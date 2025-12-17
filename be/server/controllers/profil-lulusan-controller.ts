
import { Request, Response } from 'express';
import { ProfilLulusanService } from '../services/ProfilLulusanService.js';

// Get Profil Lulusan
export const getProfilLulusan = async (req: Request, res: Response) => {
    try {
        const { prodiId, page, limit, q, searchBy } = req.query;
        const result = await ProfilLulusanService.getProfilLulusan({
            prodiId: prodiId ? String(prodiId) : undefined,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            q: q as string,
            searchBy: searchBy as 'all' | 'prodi'
        });
        res.json(result);
    } catch (error) {
        console.error('Error fetching Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal mengambil data Profil Lulusan' });
    }
};

// Create Profil Lulusan
export const createProfilLulusan = async (req: Request, res: Response) => {
    try {
        const profil = await ProfilLulusanService.createProfilLulusan(req.body);
        res.status(201).json(profil);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'DUPLICATE_KODE') {
            return res.status(400).json({ error: 'Kode Profil Lulusan sudah ada di prodi ini' });
        }
        console.error('Error creating Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal menyimpan Profil Lulusan' });
    }
};

// Update Profil Lulusan
export const updateProfilLulusan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const profil = await ProfilLulusanService.updateProfilLulusan(id, req.body);
        res.json(profil);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'DUPLICATE_KODE') {
            return res.status(400).json({ error: 'Kode Profil Lulusan sudah digunakan' });
        }
        console.error('Error updating Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal mengupdate Profil Lulusan' });
    }
};

// Delete Profil Lulusan
export const deleteProfilLulusan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ProfilLulusanService.deleteProfilLulusan(id);
        res.json({ message: 'Berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal menghapus Profil Lulusan' });
    }
};
