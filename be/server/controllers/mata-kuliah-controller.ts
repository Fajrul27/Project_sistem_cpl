import { Request, Response } from 'express';
import { MataKuliahService } from '../services/MataKuliahService.js';

// Get all Mata Kuliah (filtered by access)
// Get all Mata Kuliah (filtered by access)
export const getAllMataKuliah = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { semester, fakultasId, prodiId, kurikulumId, page, limit, q } = req.query;

        const result = await MataKuliahService.getAllMataKuliah({
            userId,
            userRole,
            semester: semester as string,
            fakultasId: fakultasId as string,
            prodiId: prodiId as string,
            kurikulumId: kurikulumId as string,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            q: q as string
        });

        res.json(result);
    } catch (error) {
        console.error('Get Mata Kuliah error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Mata Kuliah' });
    }
};

// Get available semesters for accessible Mata Kuliah
export const getMataKuliahSemesters = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const semesters = await MataKuliahService.getMataKuliahSemesters(userId, userRole);
        res.json({ data: semesters });
    } catch (error) {
        console.error('Get Semesters error:', error);
        res.status(500).json({ error: 'Gagal mengambil data semester' });
    }
};

// Get single Mata Kuliah details
export const getMataKuliahById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const mataKuliah = await MataKuliahService.getMataKuliahById(id);

        if (!mataKuliah) {
            // If null (e.g. 'semesters' check), treat as 404 or just return
            return res.status(404).json({ error: 'Not found' });
        }

        res.json({ data: mataKuliah });
    } catch (error: any) {
        console.error('Get Mata Kuliah Detail error:', error);
        if (error.message === 'Mata Kuliah tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mengambil data Mata Kuliah' });
    }
};

// Get classes for a specific Mata Kuliah (assigned to user)
export const getMataKuliahKelas = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const kelasList = await MataKuliahService.getMataKuliahKelas(id, userId, userRole);
        res.json({ data: kelasList });
    } catch (error) {
        console.error('Get Kelas for MK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data kelas' });
    }
};

// Create Mata Kuliah
export const createMataKuliah = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const mataKuliah = await MataKuliahService.createMataKuliah(req.body, userId, userRole);

        res.status(201).json({ data: mataKuliah, message: 'Mata Kuliah berhasil dibuat' });
    } catch (error: any) {
        console.error('Create Mata Kuliah error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'Profil Kaprodi tidak memiliki Program Studi') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal membuat Mata Kuliah' });
    }
};

// Update Mata Kuliah
export const updateMataKuliah = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const mataKuliah = await MataKuliahService.updateMataKuliah(id, req.body, userId, userRole);

        res.json({ data: mataKuliah, message: 'Mata Kuliah berhasil diupdate' });
    } catch (error: any) {
        console.error('Update Mata Kuliah error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'Mata Kuliah tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk mengedit mata kuliah ini' });
        }
        res.status(500).json({ error: 'Gagal mengupdate Mata Kuliah' });
    }
};

// Delete Mata Kuliah (soft delete)
export const deleteMataKuliah = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        await MataKuliahService.deleteMataKuliah(id, userId, userRole);

        res.json({ message: 'Mata Kuliah berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete Mata Kuliah error:', error);
        if (error.message === 'Mata Kuliah tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menghapus mata kuliah ini' });
        }
        res.status(500).json({ error: 'Gagal menghapus Mata Kuliah' });
    }
};
