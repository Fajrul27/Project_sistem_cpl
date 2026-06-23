
import { Request, Response } from 'express';
import { ReferenceService } from '../services/ReferenceService.js';

export const getAllKategoriCpl = async (req: Request, res: Response) => {
    try {
        const kategori = await ReferenceService.getAllKategoriCpl();
        res.json({ data: kategori });
    } catch (error) {
        console.error('Get kategori CPL error:', error);
        res.status(500).json({ error: 'Gagal mengambil data kategori CPL' });
    }
};

export const createKategoriCpl = async (req: Request, res: Response) => {
    try {
        const { nama } = req.body;
        if (!nama || nama.trim() === '') {
            return res.status(400).json({ error: 'Nama kategori tidak boleh kosong' });
        }
        
        // Check if exists
        const existing = await ReferenceService.getAllKategoriCpl();
        if (existing.some(k => k.nama.toLowerCase() === nama.trim().toLowerCase())) {
            return res.status(400).json({ error: 'Kategori sudah ada' });
        }

        const kategori = await ReferenceService.createKategoriCpl(nama.trim());
        res.status(201).json({ data: kategori, message: 'Kategori berhasil ditambahkan' });
    } catch (error) {
        console.error('Create kategori CPL error:', error);
        res.status(500).json({ error: 'Gagal menambahkan kategori CPL' });
    }
};
