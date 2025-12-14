import { Request, Response } from 'express';
import { MataKuliahPengampuService } from '../services/MataKuliahPengampuService.js';

// Get all pengampu for a mata kuliah
export const getPengampuByMataKuliah = async (req: Request, res: Response) => {
    try {
        const { mataKuliahId } = req.params;
        const pengampu = await MataKuliahPengampuService.getPengampuByMataKuliah(mataKuliahId);
        res.json({ data: pengampu });
    } catch (error) {
        console.error('Error fetching pengampu:', error);
        res.status(500).json({ error: 'Failed to fetch pengampu' });
    }
};

// Get all mata kuliah for a dosen
export const getAssignmentsByDosen = async (req: Request, res: Response) => {
    try {
        const { dosenId } = req.params;
        const assignments = await MataKuliahPengampuService.getAssignmentsByDosen(dosenId);
        res.json({ data: assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
};

// Assign dosen to mata kuliah
export const assignDosenToMataKuliah = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const assignment = await MataKuliahPengampuService.assignDosen(req.body, userId, userRole);

        res.status(201).json({
            data: assignment,
            message: 'Dosen berhasil ditambahkan ke mata kuliah'
        });
    } catch (error: any) {
        if (error.message === 'ALREADY_EXISTS' || error.code === 'P2002') {
            return res.status(400).json({ error: 'Dosen sudah terdaftar pada mata kuliah ini' });
        }
        if (error.message === 'FORBIDDEN_ACCESS') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }
        console.error('Error assigning dosen:', error);
        res.status(500).json({ error: 'Failed to assign dosen' });
    }
};

// Remove dosen from mata kuliah
export const removeDosenFromMataKuliah = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        await MataKuliahPengampuService.removeAssignment(id, userId, userRole);

        res.json({ message: 'Dosen berhasil dihapus dari mata kuliah' });
    } catch (error: any) {
        console.error('Error removing dosen:', error);
        if (error.message === 'FORBIDDEN_ACCESS') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menghapus pengampu ini' });
        }
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Pengampu tidak ditemukan' });
        }
        res.status(500).json({ error: 'Failed to remove dosen' });
    }
};

// Get daftar peserta (mahasiswa) untuk mata kuliah yang diampu dosen
export const getPesertaByMataKuliah = async (req: Request, res: Response) => {
    try {
        const { mataKuliahId } = req.params;
        const userId = (req as any).userId;

        const peserta = await MataKuliahPengampuService.getPesertaByMataKuliah(mataKuliahId, userId);

        res.json({
            data: peserta,
            total: peserta.length
        });
    } catch (error: any) {
        console.error('Error fetching peserta:', error);
        if (error.message === 'FORBIDDEN_ACCESS') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }
        res.status(500).json({ error: 'Failed to fetch peserta' });
    }
};
