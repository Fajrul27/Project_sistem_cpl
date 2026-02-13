import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';

export class AuditLogService {
    /**
     * Get statistics for dashboard
     */
    static async getStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const [totalToday, totalWeek, actionCounts, topUsers] = await Promise.all([
            prisma.auditLog.count({
                where: { createdAt: { gte: today } }
            }),
            prisma.auditLog.count({
                where: { createdAt: { gte: lastWeek } }
            }),
            prisma.auditLog.groupBy({
                by: ['action'],
                _count: { action: true },
                orderBy: { _count: { action: 'desc' } }
            }),
            prisma.auditLog.groupBy({
                by: ['userId'],
                _count: { userId: true },
                orderBy: { _count: { userId: 'desc' } },
                take: 5
            })
        ]);

        // Enrich top users with names
        const enrichedTopUsers = await Promise.all(topUsers.map(async (u) => {
            if (!u.userId) return { name: 'System', count: u._count.userId };
            const user = await prisma.user.findUnique({
                where: { id: u.userId },
                include: { profile: true }
            });
            return {
                name: user?.profile?.namaLengkap || user?.email || 'Unknown',
                email: user?.email,
                count: u._count.userId
            };
        }));

        return {
            totalToday,
            totalWeek,
            actions: actionCounts.map(a => ({ action: a.action, count: a._count.action })),
            topUsers: enrichedTopUsers
        };
    }

    /**
     * Export logs to Excel buffer
     */
    static async exportLogs(filters: {
        startDate?: string;
        endDate?: string;
        action?: string;
        userId?: string;
        tableName?: string;
    }) {
        const { startDate, endDate, action, userId, tableName } = filters;
        const where: Prisma.AuditLogWhereInput = {};

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        if (action) where.action = action.toUpperCase();
        if (userId) where.userId = userId;
        if (tableName) where.tableName = tableName;

        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: [
                { createdAt: 'desc' },
                { id: 'desc' }
            ],
            include: {
                user: {
                    select: {
                        email: true,
                        profile: { select: { namaLengkap: true } }
                    }
                }
            }
        });

        // Flatten for Excel
        const data = logs.map(log => ({
            Time: log.createdAt.toISOString(),
            Action: log.action,
            Table: log.tableName,
            RecordID: log.recordId,
            User: log.user?.profile?.namaLengkap || 'System',
            Email: log.user?.email || 'N/A',
            Changes: `Old: ${log.oldData ? 'Yes' : 'No'}, New: ${log.newData ? 'Yes' : 'No'}`
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Audit Logs");

        return XLSX.write(wb, { type: 'buffer', bookType: 'csv' });
    }

    /**
     * Get all audit logs with optional filtering
     */
    static async getLogs(filters: {
        startDate?: string;
        endDate?: string;
        action?: string;
        userId?: string;
        tableName?: string;
        page: number;
        limit: number;
    }) {
        const { startDate, endDate, action, userId, tableName, page = 1, limit = 50 } = filters;
        const skip = (page - 1) * limit;

        const where: Prisma.AuditLogWhereInput = {};

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        if (action) {
            where.action = action.toUpperCase();
        }

        if (userId) {
            where.userId = userId;
        }

        if (tableName) {
            where.tableName = tableName;
        }

        const [total, logs] = await Promise.all([
            prisma.auditLog.count({ where }),
            prisma.auditLog.findMany({
                where,
                take: limit,
                skip,
                orderBy: [
                    { createdAt: 'desc' },
                    { id: 'desc' }
                ],
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            profile: {
                                select: {
                                    namaLengkap: true
                                }
                            }
                        }
                    }
                }
            })
        ]);

        return {
            data: logs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Restore a deleted record from audit log
     */
    static async restoreRecord(logId: number) {
        const log = await prisma.auditLog.findUnique({
            where: { id: BigInt(logId) }
        });

        if (!log) {
            throw new Error('Audit log record not found');
        }

        if (log.action !== 'DELETE') {
            throw new Error('Only DELETE actions can be restored');
        }

        if (!log.oldData) {
            throw new Error('No snapshot data available to restore');
        }

        const dataToRestore = JSON.parse(log.oldData);
        const modelName = log.tableName;

        // Remove immutable fields or fields that might conflict
        // e.g. if we want to restore strictly, we keep the ID.
        // But we might need to verify if ID already exists (unlikely if it was deleted, but possible if re-created)

        // Check if record with same ID exists
        // We need to cast to any to access model dynamically
        const existing = await (prisma as any)[modelName].findUnique({
            where: { id: dataToRestore.id }
        }).catch(() => null);

        if (existing) {
            throw new Error('Cannot restore: A record with this ID already exists.');
        }

        // Attempt restore
        try {
            const restored = await (prisma as any)[modelName].create({
                data: dataToRestore
            });
            return restored;
        } catch (error: any) {
            // Handle foreign key constraint violations nicely
            if (error.code === 'P2003') {
                throw new Error('Cannot restore: Dependent data is missing (Foreign Key Constraint). Parent record may have been deleted.');
            }
            throw error;
        }
    }
}
