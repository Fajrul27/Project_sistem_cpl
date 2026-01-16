import { Request, Response } from 'express';
import { AuditLogService } from '../services/AuditLogService.js';

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const filters = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 20,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            action: req.query.action as string,
            userId: req.query.userId as string,
            tableName: req.query.tableName as string
        };

        const result = await AuditLogService.getLogs(filters);

        // Handle BigInt serialization
        const serialized = JSON.parse(JSON.stringify(result, (_, v) =>
            typeof v === 'bigint' ? v.toString() : v
        ));

        res.json(serialized);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};


export const getStats = async (req: Request, res: Response) => {
    try {
        const stats = await AuditLogService.getStats();
        // Handle BigInt serialization if any (count is Int usually, but verify)
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};

export const exportLogs = async (req: Request, res: Response) => {
    try {
        const filters = {
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            action: req.query.action as string,
            userId: req.query.userId as string,
            tableName: req.query.tableName as string
        };

        const buffer = await AuditLogService.exportLogs(filters);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.csv`);
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting logs:', error);
        res.status(500).json({ error: 'Failed to export logs' });
    }
};

export const restoreRecord = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await AuditLogService.restoreRecord(Number(id));
        res.json({ message: 'Record restored successfully', data: result });
    } catch (error: any) {
        console.error('Restore error:', error);
        res.status(400).json({ error: error.message || 'Failed to restore record' });
    }
}
