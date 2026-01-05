import { Request, Response } from 'express';
import { AcademicService } from '../services/AcademicService.js';

// Get all Fakultas
export const getAllFakultas = async (req: Request, res: Response) => {
    try {
        const fakultas = await AcademicService.getAllFakultas();
        res.json({ data: fakultas });
    } catch (error) {
        console.error('Get Fakultas error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Fakultas' });
    }
};

// Create Fakultas
export const createFakultas = async (req: Request, res: Response) => {
    try {
        const { kode, nama } = req.body;
        if (!kode || !nama) {
            return res.status(400).json({ error: 'Kode dan Nama Fakultas harus diisi' });
        }

        const newFakultas = await AcademicService.createFakultas({ kode, nama });
        res.status(201).json({ data: newFakultas, message: 'Fakultas berhasil dibuat' });
    } catch (error: any) {
        console.error('Create Fakultas error:', error);
        res.status(500).json({ error: error.message || 'Gagal membuat Fakultas' });
    }
};

// Update Fakultas
export const updateFakultas = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { kode, nama } = req.body;

        const updatedFakultas = await AcademicService.updateFakultas(id, { kode, nama });
        res.json({ data: updatedFakultas, message: 'Fakultas berhasil diupdate' });
    } catch (error: any) {
        console.error('Update Fakultas error:', error);
        res.status(500).json({ error: error.message || 'Gagal update Fakultas' });
    }
};

// Delete Fakultas
export const deleteFakultas = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await AcademicService.deleteFakultas(id);
        res.json({ message: 'Fakultas berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete Fakultas error:', error);
        res.status(500).json({ error: error.message || 'Gagal menghapus Fakultas' });
    }
};
