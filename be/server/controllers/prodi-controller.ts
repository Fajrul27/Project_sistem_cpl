import { Request, Response } from 'express';
import { AcademicService } from '../services/AcademicService.js';

// Get all Prodi (Public access for registration)
export const getAllProdi = async (req: Request, res: Response) => {
    try {
        const { fakultasId } = req.query;
        const prodi = await AcademicService.getAllProdi(fakultasId as string);
        res.json({ data: prodi });
    } catch (error) {
        console.error('Get Prodi error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Prodi' });
    }
};

// Create Prodi
export const createProdi = async (req: Request, res: Response) => {
    try {
        const { kode, nama, jenjang, fakultasId } = req.body;
        if (!kode || !nama || !jenjang || !fakultasId) {
            return res.status(400).json({ error: 'Data Prodi tidak lengkap (kode, nama, jenjang, fakultasId)' });
        }

        const newProdi = await AcademicService.createProdi({ kode, nama, jenjang, fakultasId });
        res.status(201).json({ data: newProdi, message: 'Prodi berhasil dibuat' });
    } catch (error: any) {
        console.error('Create Prodi error:', error);
        res.status(500).json({ error: error.message || 'Gagal membuat Prodi' });
    }
};

// Update Prodi
export const updateProdi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { kode, nama, jenjang, fakultasId } = req.body;

        const updatedProdi = await AcademicService.updateProdi(id, { kode, nama, jenjang, fakultasId });
        res.json({ data: updatedProdi, message: 'Prodi berhasil diupdate' });
    } catch (error: any) {
        console.error('Update Prodi error:', error);
        res.status(500).json({ error: error.message || 'Gagal update Prodi' });
    }
};

// Delete Prodi
export const deleteProdi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await AcademicService.deleteProdi(id);
        res.json({ message: 'Prodi berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete Prodi error:', error);
        res.status(500).json({ error: error.message || 'Gagal menghapus Prodi' });
    }
};
