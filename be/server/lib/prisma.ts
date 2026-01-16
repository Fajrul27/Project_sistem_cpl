import { PrismaClient } from '@prisma/client';
import { context } from './context.js';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prismaClient =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error']
  });

export const prisma = prismaClient.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        // Skip logging for AuditLog itself to prevent recursion
        if (model === 'AuditLog') {
          return query(args);
        }

        const userId = context.getStore()?.userId;

        // Only log modification operations
        if (['create', 'update', 'delete', 'createMany', 'updateMany', 'deleteMany', 'upsert'].includes(operation)) {
          try {
            let oldData = null;
            let recordId = null;

            // For update/delete, try to fetch old data
            if (['update', 'delete'].includes(operation)) {
              // Check if we can find the record (needs 'where' clause)
              if ((args as any).where) {
                try {
                  // Use 'any' to bypass strict typing for dynamic model access
                  oldData = await (prismaClient as any)[model].findUnique({
                    where: (args as any).where
                  });
                  if (oldData) recordId = (oldData as any).id;
                } catch (e) {
                  // Ignore if findUnique fails (e.g. non-unique where or complex query)
                }
              }
            }

            // Execute the operation
            const result = await query(args);

            // For create, result is the new data
            let newData = null;
            if (['create', 'update', 'upsert'].includes(operation)) {
              newData = result;
              if (!recordId && result && (result as any).id) recordId = (result as any).id;
            }

            // Log asynchronously to not block the main request significantly
            // Use prismaClient (base) to write to AuditLog to avoid infinite loops
            const ipAddress = 'unknown'; // Middleware could provide this via context if needed
            const userAgent = 'unknown';

            if (userId) {
              await prismaClient.auditLog.create({
                data: {
                  userId,
                  action: operation.toUpperCase(),
                  tableName: model,
                  recordId: typeof recordId === 'string' ? recordId : (recordId ? String(recordId) : null),
                  oldData: oldData ? JSON.stringify(oldData) : null,
                  newData: newData ? JSON.stringify(newData) : null,
                  ipAddress,
                  userAgent
                }
              }).catch(console.error);
            }

            return result;

          } catch (error) {
            // If logging fails, strictly strictly shouldn't fail the operation?
            // But if the operation fails, we should throw
            throw error;
          }
        }

        return query(args);
      }
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
}
