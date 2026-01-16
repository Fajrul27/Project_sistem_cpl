import { Request, Response } from 'express';
import { TeknikPenilaianService } from '../services/TeknikPenilaianService.js';

// Get teknik penilaian by CPMK ID
export const getTeknikByCpmk = async (req: Request, res: Response) => {
    try {
        const { cpmkId } = req.params;

        const result = await TeknikPenilaianService.getTeknikByCpmk(cpmkId);

        res.json(result);
    } catch (error) {
        console.error('Get teknik penilaian error:', error);
        res.status(500).json({ error: 'Gagal mengambil data teknik penilaian' });
    }
};

// Create teknik penilaian
export const createTeknikPenilaian = async (req: Request, res: Response) => {
    try {
        const teknikPenilaian = await TeknikPenilaianService.createTeknikPenilaian(req.body);

        res.status(201).json({
            data: teknikPenilaian,
            message: 'Teknik penilaian berhasil dibuat'
        });
    } catch (error: any) {
        console.error('Create teknik penilaian error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'MISSING_FIELDS') {
            return res.status(400).json({
                error: 'CPMK, Nama Teknik (atau Ref ID), dan Bobot Persentase harus diisi'
            });
        }
        if (error.message === 'REF_NOT_FOUND') return res.status(400).json({ error: 'Teknik Penilaian Ref tidak ditemukan' });
        if (error.message === 'INVALID_BOBOT') return res.status(400).json({ error: 'Bobot persentase harus antara 0-100%' });
        if (error.message === 'CPMK_NOT_FOUND') return res.status(404).json({ error: 'CPMK tidak ditemukan' });
        if (error.message.startsWith('WEIGHT_OVERFLOW')) {
            const currentTotal = error.message.split(':')[1];
            return res.status(400).json({
                error: `Total bobot akan melebihi 100% (saat ini: ${currentTotal}%)`
            });
        }
        res.status(500).json({ error: 'Gagal membuat teknik penilaian' });
    }
};

// Update teknik penilaian
export const updateTeknikPenilaian = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await TeknikPenilaianService.updateTeknikPenilaian(id, req.body);

        res.json({
            data: result,
            message: 'Teknik penilaian berhasil diupdate'
        });
    } catch (error: any) {
        console.error('Update teknik penilaian error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Teknik penilaian tidak ditemukan' });
        if (error.message === 'INVALID_BOBOT') return res.status(400).json({ error: 'Bobot persentase harus antara 0-100%' });
        if (error.message.startsWith('WEIGHT_OVERFLOW')) {
            const otherTotal = error.message.split(':')[1];
            return res.status(400).json({
                error: `Total bobot akan melebihi 100% (teknik lain: ${otherTotal}%)`
            });
        }
        res.status(500).json({ error: 'Gagal mengupdate teknik penilaian' });
    }
};

// Delete teknik penilaian
export const deleteTeknikPenilaian = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await TeknikPenilaianService.deleteTeknikPenilaian(id);

        res.json({ message: 'Teknik penilaian berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete teknik penilaian error:', error);
        if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Teknik penilaian tidak ditemukan' });
        res.status(500).json({ error: 'Gagal menghapus teknik penilaian' });
    }
};
