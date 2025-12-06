
import { Request, Response } from 'express';
import { VisiMisiService } from '../services/VisiMisiService.js';

// Get Visi Misi
export const getVisiMisi = async (req: Request, res: Response) => {
    try {
        const { prodiId } = req.query;
        const data = await VisiMisiService.getVisiMisi(prodiId ? String(prodiId) : undefined);
        res.json({ data });
    } catch (error) {
        console.error('Error fetching Visi Misi:', error);
        res.status(500).json({ error: 'Gagal mengambil data Visi Misi' });
    }
};

// Create Visi Misi
export const createVisiMisi = async (req: Request, res: Response) => {
    try {
        const newItem = await VisiMisiService.createVisiMisi(req.body);
        res.status(201).json(newItem);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Error creating Visi Misi:', error);
        res.status(500).json({ error: 'Gagal menyimpan Visi Misi' });
    }
};

// Update Visi Misi
export const updateVisiMisi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedItem = await VisiMisiService.updateVisiMisi(id, req.body);
        res.json(updatedItem);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Error updating Visi Misi:', error);
        res.status(500).json({ error: 'Gagal mengupdate Visi Misi' });
    }
};

// Delete Visi Misi
export const deleteVisiMisi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await VisiMisiService.deleteVisiMisi(id);
        res.json({ message: 'Berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting Visi Misi:', error);
        res.status(500).json({ error: 'Gagal menghapus Visi Misi' });
    }
};
