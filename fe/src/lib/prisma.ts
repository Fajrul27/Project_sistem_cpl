// ============================================
// Prisma Client Configuration
// ============================================

import { PrismaClient } from '@prisma/client';

// Prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper function to handle Prisma errors
export function handlePrismaError(error: any) {
  if (error.code === 'P2002') {
    return { error: 'Data already exists', details: error.meta };
  }
  if (error.code === 'P2025') {
    return { error: 'Record not found', details: error.meta };
  }
  if (error.code === 'P2003') {
    return { error: 'Foreign key constraint failed', details: error.meta };
  }
  return { error: error.message || 'Database error' };
}

export default prisma;
