import { Request, Response } from 'express';
import { AcademicService } from '../services/AcademicService.js';

// Get all Fakultas
export const getAllFakultas = async (req: Request, res: Response) => {
    try {
        const fakultas = await AcademicService.getAllFakultas();
        res.json({ data: fakultas });
    } catch (error) {
        console.error('Get Fakultas error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Fakultas' });
    }
};
