import { Request, Response } from 'express';
import { AcademicService } from '../services/AcademicService.js';

// Get all Prodi (Public access for registration)
export const getAllProdi = async (req: Request, res: Response) => {
    try {
        const { fakultasId } = req.query;
        const prodi = await AcademicService.getAllProdi(fakultasId as string);
        res.json({ data: prodi });
    } catch (error) {
        console.error('Get Prodi error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Prodi' });
    }
};
