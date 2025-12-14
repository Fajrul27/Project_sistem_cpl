import { Request, Response } from 'express';
import { NilaiCplService } from '../services/NilaiCplService.js';

// Get all nilai CPL
export const getAllNilaiCpl = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { cplId } = req.query;

        const nilaiCpl = await NilaiCplService.getAllNilaiCpl({
            userId,
            userRole,
            cplId: cplId as string
        });

        res.json({ data: nilaiCpl });
    } catch (error) {
        console.error('Get nilai CPL error:', error);
        res.status(500).json({ error: 'Gagal mengambil data nilai CPL' });
    }
};

// Get nilai CPL by user ID
export const getNilaiCplByUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const nilaiCpl = await NilaiCplService.getNilaiCplByUser(userId);
        res.json({ data: nilaiCpl });
    } catch (error) {
        console.error('Get nilai CPL by user error:', error);
        res.status(500).json({ error: 'Gagal mengambil data nilai CPL' });
    }
};

// Create nilai CPL
export const createNilaiCpl = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const nilaiCpl = await NilaiCplService.createNilaiCpl(userId, req.body);
        res.status(201).json({ data: nilaiCpl, message: 'Nilai CPL berhasil ditambahkan' });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Create nilai CPL error:', error);
        res.status(500).json({ error: 'Gagal menambahkan nilai CPL' });
    }
};
