
import { Request, Response } from 'express';
import { ReferenceService } from '../services/ReferenceService.js';

export const getAllJenisMataKuliah = async (req: Request, res: Response) => {
    try {
        const jenis = await ReferenceService.getAllJenisMataKuliah();
        res.json({ data: jenis });
    } catch (error) {
        console.error('Get jenis MK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data jenis MK' });
    }
};
