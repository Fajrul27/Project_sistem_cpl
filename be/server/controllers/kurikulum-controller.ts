
import { Request, Response } from 'express';
import { ReferenceService } from '../services/ReferenceService.js';

export const getAllKurikulum = async (req: Request, res: Response) => {
    try {
        const kurikulum = await ReferenceService.getAllKurikulum();
        res.json({ data: kurikulum });
    } catch (error) {
        console.error('Get kurikulum error:', error);
        res.status(500).json({ error: 'Gagal mengambil data kurikulum' });
    }
};
