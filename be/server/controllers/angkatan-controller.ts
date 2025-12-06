import { Request, Response } from 'express';
import { AcademicService } from '../services/AcademicService.js';

// Get all angkatan
export const getAllAngkatan = async (req: Request, res: Response) => {
    try {
        const angkatan = await AcademicService.getAllAngkatan();
        res.json({ data: angkatan });
    } catch (error) {
        console.error('Get angkatan error:', error);
        res.status(500).json({ error: 'Gagal mengambil data angkatan' });
    }
};

// Create angkatan
export const createAngkatan = async (req: Request, res: Response) => {
    try {
        const { tahun } = req.body;
        const newAngkatan = await AcademicService.createAngkatan(parseInt(tahun));
        res.status(201).json({ data: newAngkatan });
    } catch (error: any) {
        console.error('Create angkatan error:', error);
        if (error.message === 'Tahun harus diisi') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal membuat angkatan' });
    }
};
