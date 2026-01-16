
import { Request, Response } from 'express';
import { ReferenceService } from '../services/ReferenceService.js';

export const getAllKategoriCpl = async (req: Request, res: Response) => {
    try {
        const kategori = await ReferenceService.getAllKategoriCpl();
        res.json({ data: kategori });
    } catch (error) {
        console.error('Get kategori CPL error:', error);
        res.status(500).json({ error: 'Gagal mengambil data kategori CPL' });
    }
};
