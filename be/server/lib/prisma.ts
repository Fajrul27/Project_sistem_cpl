import { PrismaClient } from '@prisma/client';
import { context } from './context.js';
import { invalidateDashboardCache } from './dashboardCache.js';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const prismaClient =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.DEBUG_QUERIES === 'true' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error']
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
        const skipAuditLog = context.getStore()?.skipAuditLog;

        // Automatically invalidate dashboard cache on ANY database mutation for 100% future-proof sync
        if (['create', 'update', 'delete', 'createMany', 'updateMany', 'deleteMany', 'upsert'].includes(operation)) {
          setImmediate(() => {
            invalidateDashboardCache();
          });
        }

        // Execute the main database query first for minimum latency
        const result = await query(args);

        // Asynchronously log audit trail in the background without blocking the HTTP response
        if (!skipAuditLog && ['create', 'update', 'delete', 'createMany', 'updateMany', 'deleteMany', 'upsert'].includes(operation)) {
          setImmediate(async () => {
            try {
              const recordId = (result && (result as any).id) ? (result as any).id : null;
              if (userId) {
                await prismaClient.auditLog.create({
                  data: {
                    userId,
                    action: operation.toUpperCase(),
                    tableName: model,
                    recordId: typeof recordId === 'string' ? recordId : (recordId ? String(recordId) : null),
                    oldData: null,
                    newData: ['create', 'update', 'upsert'].includes(operation) && result ? JSON.stringify(result) : null,
                    ipAddress: 'unknown',
                    userAgent: 'unknown'
                  }
                });
              }
            } catch (error) {
              // Ignore background audit log errors
            }
          });
        }

        return result;
      }
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
}
