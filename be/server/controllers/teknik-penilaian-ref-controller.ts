
import { Request, Response } from 'express';
import { ReferenceService } from '../services/ReferenceService.js';

export const getAllTeknikPenilaianRef = async (req: Request, res: Response) => {
    try {
        const teknikList = await ReferenceService.getAllTeknikPenilaianRef();
        res.json({ data: teknikList });
    } catch (error) {
        console.error('Get teknik penilaian ref error:', error);
        res.status(500).json({ error: 'Gagal mengambil data teknik penilaian ref' });
    }
};
