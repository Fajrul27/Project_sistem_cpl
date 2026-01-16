import { Request, Response } from 'express';
import { RubrikService } from '../services/RubrikService.js';

// Get Rubrik by CPMK ID
export const getRubrikByCpmk = async (req: Request, res: Response) => {
    try {
        const { cpmkId } = req.params;
        const rubrik = await RubrikService.getRubrikByCpmk(cpmkId);

        if (!rubrik) {
            return res.json({ data: null });
        }

        res.json({ data: rubrik });
    } catch (error) {
        console.error('Get rubrik error:', error);
        res.status(500).json({ error: 'Gagal mengambil data rubrik' });
    }
};

// Create or Update Rubrik
export const createOrUpdateRubrik = async (req: Request, res: Response) => {
    try {
        const { cpmkId, deskripsi, kriteria } = req.body;
        const result = await RubrikService.createOrUpdateRubrik(cpmkId, deskripsi, kriteria);

        res.json({ data: result, message: 'Rubrik berhasil disimpan' });
    } catch (error: any) {
        console.error('Save rubrik error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'INVALID_DATA') return res.status(400).json({ error: 'Data rubrik tidak valid' });
        if (error.message === 'CPMK_NOT_FOUND') return res.status(404).json({ error: 'CPMK tidak ditemukan' });
        res.status(500).json({ error: 'Gagal menyimpan rubrik' });
    }
};

// Delete Rubrik
export const deleteRubrik = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await RubrikService.deleteRubrik(id);
        res.json({ message: 'Rubrik berhasil dihapus' });
    } catch (error) {
        console.error('Delete rubrik error:', error);
        res.status(500).json({ error: 'Gagal menghapus rubrik' });
    }
};
