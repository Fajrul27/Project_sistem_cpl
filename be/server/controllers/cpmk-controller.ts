import { Request, Response } from 'express';
import { CPMKService } from '../services/CPMKService.js';

// Get all CPMK (with optional mata kuliah filter)
export const getAllCpmk = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { mataKuliahId, prodiId, fakultasId, semester, statusValidasi, page, limit, q } = req.query;

        const result = await CPMKService.getAllCpmk({
            userId,
            userRole,
            mataKuliahId: mataKuliahId as string,
            prodiId: prodiId as string,
            fakultasId: fakultasId as string,
            semester: semester as string,
            statusValidasi: statusValidasi as string,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            q: q as string
        });

        res.json(result);
    } catch (error: any) {
        console.error('Get CPMK error:', error);
        if (error.message === 'FORBIDDEN_MK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }
        res.status(500).json({ error: 'Gagal mengambil data CPMK' });
    }
};

// Get CPMK by Mata Kuliah ID
export const getCpmkByMataKuliah = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { mkId } = req.params;

        const cpmk = await CPMKService.getCpmkByMataKuliah(mkId, userId, userRole);
        res.json({ data: cpmk });
    } catch (error: any) {
        console.error('Get CPMK by MK error:', error);
        if (error.message === 'FORBIDDEN_MK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }
        res.status(500).json({ error: 'Gagal mengambil data CPMK' });
    }
};

// Get CPMK by ID (with full details)
export const getCpmkById = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { id } = req.params;

        const cpmk = await CPMKService.getCpmkById(id, userId, userRole);
        res.json({ data: cpmk });
    } catch (error: any) {
        console.error('Get CPMK by ID error:', error);
        if (error.message === 'CPMK tidak ditemukan') return res.status(404).json({ error: error.message });
        if (error.message === 'FORBIDDEN_CPMK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke CPMK ini' });
        }
        res.status(500).json({ error: 'Gagal mengambil data CPMK' });
    }
};

// Create CPMK
export const createCpmk = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const cpmk = await CPMKService.createCpmk(req.body, userId, userRole);

        res.status(201).json({ data: cpmk, message: 'CPMK berhasil dibuat' });
    } catch (error: any) {
        console.error('Create CPMK error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'Kode CPMK dan Mata Kuliah harus diisi') return res.status(400).json({ error: error.message });
        if (error.message === 'FORBIDDEN_CREATE_CPMK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menambahkan CPMK ke mata kuliah ini' });
        }
        res.status(500).json({ error: 'Gagal membuat CPMK' });
    }
};

// Update CPMK
export const updateCpmk = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { id } = req.params;

        const cpmk = await CPMKService.updateCpmk(id, req.body, userId, userRole);

        res.json({ data: cpmk, message: 'CPMK berhasil diupdate' });
    } catch (error: any) {
        console.error('Update CPMK error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'CPMK tidak ditemukan') return res.status(404).json({ error: error.message });
        if (error.message === 'FORBIDDEN_EDIT_CPMK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk mengedit CPMK ini' });
        }
        if (error.message.startsWith('USED_IN_GRADES')) {
            const count = error.message.split(':')[1];
            return res.status(403).json({
                error: 'CPMK tidak dapat diedit karena sudah digunakan untuk penilaian',
                detail: `Terdapat ${count} nilai mahasiswa yang terkait dengan CPMK ini`
            });
        }
        res.status(500).json({ error: 'Gagal mengupdate CPMK' });
    }
};

// Delete CPMK (soft delete)
export const deleteCpmk = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { id } = req.params;

        await CPMKService.deleteCpmk(id, userId, userRole);

        res.json({ message: 'CPMK berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete CPMK error:', error);
        if (error.message === 'CPMK tidak ditemukan') return res.status(404).json({ error: error.message });
        if (error.message === 'FORBIDDEN_DELETE_CPMK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menghapus CPMK ini' });
        }
        if (error.message.startsWith('USED_IN_GRADES')) {
            const count = error.message.split(':')[1];
            return res.status(403).json({
                error: 'CPMK tidak dapat dihapus karena sudah digunakan untuk penilaian',
                detail: `Terdapat ${count} nilai mahasiswa yang terkait dengan CPMK ini`
            });
        }
        res.status(500).json({ error: 'Gagal menghapus CPMK' });
    }
};

// Validate CPMK (Kaprodi only)
export const validateCpmk = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { id } = req.params;
        const { statusValidasi } = req.body;

        const cpmk = await CPMKService.validateCpmk(id, statusValidasi, userId);

        res.json({
            data: cpmk,
            message: `CPMK berhasil diubah statusnya menjadi ${statusValidasi}`
        });
    } catch (error: any) {
        console.error('Validate CPMK error:', error);
        if (error.message === 'INVALID_STATUS') {
            return res.status(400).json({ error: 'Status validasi tidak valid. Pilih: draft, validated, atau active' });
        }
        if (error.message === 'CPMK tidak ditemukan') return res.status(404).json({ error: error.message });
        res.status(500).json({ error: 'Gagal memvalidasi CPMK' });
    }
};
