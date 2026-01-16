
import { Request, Response } from 'express';
import { ReferenceService } from '../services/ReferenceService.js';

export const getAllKurikulum = async (req: Request, res: Response) => {
    try {
        const filters: { isActive?: boolean } = {};
        if (req.query.isActive !== undefined) {
            filters.isActive = req.query.isActive === 'true';
        }
        const kurikulum = await ReferenceService.getAllKurikulum(filters);
        res.json({ data: kurikulum });
    } catch (error) {
        console.error('Get kurikulum error:', error);
        res.status(500).json({ error: 'Gagal mengambil data kurikulum' });
    }
};

export const createKurikulum = async (req: Request, res: Response) => {
    try {
        const { nama, tahunMulai, tahunSelesai, isActive } = req.body;
        const kurikulum = await ReferenceService.createKurikulum({
            nama,
            tahunMulai: parseInt(tahunMulai),
            tahunSelesai: tahunSelesai ? parseInt(tahunSelesai) : undefined,
            isActive: isActive === true || isActive === 'true'
        });
        res.status(201).json({ data: kurikulum });
    } catch (error) {
        console.error('Create kurikulum error:', error);
        res.status(500).json({ error: 'Gagal membuat kurikulum' });
    }
};

export const updateKurikulum = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama, tahunMulai, tahunSelesai, isActive } = req.body;
        const kurikulum = await ReferenceService.updateKurikulum(id, {
            nama,
            tahunMulai: parseInt(tahunMulai),
            tahunSelesai: tahunSelesai ? parseInt(tahunSelesai) : undefined,
            isActive: isActive === true || isActive === 'true'
        });
        res.json({ data: kurikulum });
    } catch (error) {
        console.error('Update kurikulum error:', error);
        res.status(500).json({ error: 'Gagal mengupdate kurikulum' });
    }
};

export const deleteKurikulum = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ReferenceService.deleteKurikulum(id);
        res.json({ message: 'Kurikulum berhasil dihapus' });
    } catch (error) {
        console.error('Delete kurikulum error:', error);
        res.status(500).json({ error: 'Gagal menghapus kurikulum' });
    }
};
