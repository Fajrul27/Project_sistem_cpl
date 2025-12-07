
import { Request, Response } from 'express';
import { z } from 'zod';
import { SubCPMKService } from '../services/SubCPMKService.js';

// Schema validation
const subCpmkSchema = z.object({
    kode: z.string(),
    deskripsi: z.string(),
    bobot: z.number().optional().default(0)
});

// GET /api/sub-cpmk?cpmkId=...
export const getSubCpmk = async (req: Request, res: Response) => {
    try {
        const { cpmkId } = req.query;
        if (!cpmkId) return res.status(400).json({ error: 'CPMK ID wajib diisi' });

        const data = await SubCPMKService.getSubCpmk(String(cpmkId));
        res.json({ data });
    } catch (error) {
        console.error('Error fetching sub-cpmk:', error);
        res.status(500).json({ error: 'Gagal mengambil data Sub-CPMK' });
    }
};

// POST /api/sub-cpmk?cpmkId=...
export const createSubCpmk = async (req: Request, res: Response) => {
    try {
        const { cpmkId } = req.query;
        if (!cpmkId) return res.status(400).json({ error: 'CPMK ID wajib diisi' });

        const validation = subCpmkSchema.safeParse(req.body);
        if (!validation.success) return res.status(400).json({ error: validation.error.issues[0].message });

        const subCpmk = await SubCPMKService.createSubCpmk(String(cpmkId), validation.data);
        res.status(201).json({ data: subCpmk });
    } catch (error: any) {
        console.error('Error creating sub-cpmk:', error);
        if (error.message.startsWith('TOTAL_WEIGHT_EXCEEDED')) {
            const currentTotal = Number(error.message.split(':')[1]);
            return res.status(400).json({
                error: `Total bobot akan melebihi 100% (saat ini: ${currentTotal.toFixed(2)}%)`
            });
        }
        res.status(500).json({ error: 'Gagal membuat Sub-CPMK' });
    }
};

// PUT /api/sub-cpmk/:id
export const updateSubCpmk = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validation = subCpmkSchema.safeParse(req.body);
        if (!validation.success) return res.status(400).json({ error: validation.error.issues[0].message });

        const subCpmk = await SubCPMKService.updateSubCpmk(id, validation.data);
        res.json({ data: subCpmk });
    } catch (error: any) {
        console.error('Error updating sub-cpmk:', error);
        if (error.message.startsWith('TOTAL_WEIGHT_EXCEEDED')) {
            const currentTotal = Number(error.message.split(':')[1]);
            return res.status(400).json({
                error: `Total bobot akan melebihi 100% (saat ini: ${currentTotal.toFixed(2)}%)`
            });
        }
        res.status(500).json({ error: 'Gagal mengupdate Sub-CPMK' });
    }
};

// DELETE /api/sub-cpmk/:id
export const deleteSubCpmk = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await SubCPMKService.deleteSubCpmk(id);
        res.json({ message: 'Sub-CPMK berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting sub-cpmk:', error);
        res.status(500).json({ error: 'Gagal menghapus Sub-CPMK' });
    }
};

// POST /api/sub-cpmk/mapping
export const createSubCpmkMapping = async (req: Request, res: Response) => {
    try {
        const { subCpmkId, teknikPenilaianId, bobot } = req.body;
        if (!subCpmkId || !teknikPenilaianId) return res.status(400).json({ error: 'Data tidak lengkap' });

        const mapping = await SubCPMKService.createSubCpmkMapping(subCpmkId, teknikPenilaianId, Number(bobot) || 100);
        res.status(201).json({ data: mapping });
    } catch (error) {
        console.error('Error creating mapping:', error);
        res.status(500).json({ error: 'Gagal membuat mapping' });
    }
};

// DELETE /api/sub-cpmk/mapping/:id
export const deleteSubCpmkMapping = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await SubCPMKService.deleteSubCpmkMapping(id);
        res.json({ message: 'Mapping berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting mapping:', error);
        res.status(500).json({ error: 'Gagal menghapus mapping' });
    }
};
