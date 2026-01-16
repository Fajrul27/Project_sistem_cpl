import { Request, Response } from 'express';
import { ReferenceService } from '../services/ReferenceService.js';

// Get all Semesters
export const getAllSemesters = async (req: Request, res: Response) => {
    try {
        const semesters = await ReferenceService.getAllSemesters();
        res.json({ data: semesters });
    } catch (error) {
        console.error('Get semesters error:', error);
        res.status(500).json({ error: 'Gagal mengambil data semester' });
    }
};

// Get all Kelas
export const getAllKelas = async (req: Request, res: Response) => {
    try {
        const kelas = await ReferenceService.getAllKelas();
        res.json({ data: kelas });
    } catch (error) {
        console.error('Get kelas error:', error);
        res.status(500).json({ error: 'Gagal mengambil data kelas' });
    }
};

// Get all Fakultas
export const getAllFakultasRef = async (req: Request, res: Response) => {
    try {
        const fakultas = await ReferenceService.getAllFakultas();
        res.json({ data: fakultas });
    } catch (error) {
        console.error('Get fakultas error:', error);
        res.status(500).json({ error: 'Gagal mengambil data fakultas' });
    }

};

// Get all Tahun Ajaran
export const getAllTahunAjaran = async (req: Request, res: Response) => {
    try {
        const { isActive } = req.query;
        // Parse boolean if it comes as string "true"/"false"
        const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;

        const tahunAjaran = await ReferenceService.getAllTahunAjaran({ isActive: isActiveBool });
        res.json({ data: tahunAjaran });
    } catch (error) {
        console.error('Get tahun ajaran error:', error);
        res.status(500).json({ error: 'Gagal mengambil data tahun ajaran' });
    }
};
