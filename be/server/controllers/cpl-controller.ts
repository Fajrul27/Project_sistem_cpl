import { Request, Response } from 'express';
import { CPLService } from '../services/CPLService.js';

// Get all CPL
export const getAllCpl = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { prodiId, page, limit, q } = req.query;

        const result = await CPLService.getAllCpl({
            userId,
            userRole,
            prodiId: prodiId as string,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            q: q as string,
            kategori: (req.query.kategori as string),
            kurikulumId: (req.query.kurikulumId as string)
        });

        res.json(result);
    } catch (error) {
        console.error('Get CPL error:', error);
        res.status(500).json({ error: 'Gagal mengambil data CPL' });
    }
};

// Get CPL by ID
export const getCplById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cpl = await CPLService.getCplById(id);
        res.json({ data: cpl });
    } catch (error: any) {
        console.error('Get CPL by ID error:', error);
        if (error.message === 'CPL tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mengambil data CPL' });
    }
};

// Get CPL Stats
export const getCplStats = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const stats = await CPLService.getCplStats(id);
        res.json(stats);
    } catch (error) {
        console.error('Get CPL Stats error:', error);
        res.status(500).json({ error: 'Gagal mengambil statistik CPL' });
    }
};

// Create CPL
export const createCpl = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const cpl = await CPLService.createCpl(req.body, userId, userRole);

        res.status(201).json({
            data: cpl,
            message: 'CPL berhasil dibuat'
        });
    } catch (error: any) {
        console.error('Create CPL error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'Profil Kaprodi tidak memiliki Program Studi') {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal membuat CPL' });
    }
};

// Update CPL
export const updateCpl = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const cpl = await CPLService.updateCpl(id, req.body, userId, userRole);

        res.json({
            data: cpl,
            message: 'CPL berhasil diupdate'
        });
    } catch (error: any) {
        console.error('Update CPL error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'CPL tidak ditemukan') return res.status(404).json({ error: error.message });
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ error: 'Anda hanya dapat mengubah CPL dari program studi Anda' });
        }
        res.status(500).json({ error: 'Gagal mengupdate CPL' });
    }
};

// Delete CPL
export const deleteCpl = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        await CPLService.deleteCpl(id, userId, userRole);

        res.json({ message: 'CPL berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete CPL error:', error);
        if (error.message === 'CPL tidak ditemukan') return res.status(404).json({ error: error.message });
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ error: 'Anda hanya dapat menghapus CPL dari program studi Anda' });
        }
        res.status(500).json({ error: 'Gagal menghapus CPL' });
    }
};
