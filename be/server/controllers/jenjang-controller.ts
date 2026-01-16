import { Request, Response } from 'express';
import { JenjangService } from '../services/JenjangService.js';

export const getAllJenjang = async (req: Request, res: Response) => {
    try {
        const data = await JenjangService.getAllJenjang();
        res.json({ data });
    } catch (error) {
        console.error('Get Jenjang error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Jenjang' });
    }
};

export const createJenjang = async (req: Request, res: Response) => {
    try {
        const { nama, keterangan } = req.body;
        if (!nama) {
            return res.status(400).json({ error: 'Nama Jenjang harus diisi' });
        }

        const newItem = await JenjangService.createJenjang({ nama, keterangan });
        res.status(201).json({ data: newItem, message: 'Jenjang berhasil dibuat' });
    } catch (error: any) {
        console.error('Create Jenjang error:', error);
        res.status(500).json({ error: error.message || 'Gagal membuat Jenjang' });
    }
};

export const updateJenjang = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama, keterangan, isActive } = req.body;

        const updatedItem = await JenjangService.updateJenjang(id, { nama, keterangan, isActive });
        res.json({ data: updatedItem, message: 'Jenjang berhasil diupdate' });
    } catch (error: any) {
        console.error('Update Jenjang error:', error);
        res.status(500).json({ error: error.message || 'Gagal update Jenjang' });
    }
};

export const deleteJenjang = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await JenjangService.deleteJenjang(id);
        res.json({ message: 'Jenjang berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete Jenjang error:', error);
        res.status(500).json({ error: error.message || 'Gagal menghapus Jenjang' });
    }
};
