import { Request, Response } from 'express';
import { CPLService } from '../services/CPLService.js';

// Get all mappings
export const getAllMappings = async (req: Request, res: Response) => {
    try {
        const mappings = await CPLService.getAllMappings();
        res.json({ data: mappings });
    } catch (error) {
        console.error('Get mappings error:', error);
        res.status(500).json({ error: 'Gagal mengambil data mapping' });
    }
};

// Get mappings by Mata Kuliah
export const getMappingsByMataKuliah = async (req: Request, res: Response) => {
    try {
        const { mkId } = req.params;
        const result = await CPLService.getMappingsByMataKuliah(mkId);
        res.json(result);
    } catch (error) {
        console.error('Get mappings by MK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data mapping' });
    }
};

// Create mapping
export const createMapping = async (req: Request, res: Response) => {
    try {
        const mapping = await CPLService.createMapping(req.body);

        res.status(201).json({ data: mapping, message: 'Mapping berhasil dibuat' });
    } catch (error: any) {
        console.error('Create mapping error:', error);
        if (error.message === 'Mapping sudah ada' || error.message.includes('Total bobot')) {
            // Parse error message for specific totals if needed, but simple for now
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal membuat mapping' });
    }
};

// Update mapping
export const updateMapping = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { bobotKontribusi } = req.body;

        const mapping = await CPLService.updateMapping(id, bobotKontribusi);

        res.json({ data: mapping, message: 'Mapping berhasil diupdate' });
    } catch (error: any) {
        console.error('Update mapping error:', error);
        if (error.message === 'Mapping tidak ditemukan') return res.status(404).json({ error: error.message });
        if (error.message.includes('Total bobot')) return res.status(400).json({ error: error.message });
        res.status(500).json({ error: 'Gagal mengupdate mapping' });
    }
};

// Batch create mappings
export const batchCreateMappings = async (req: Request, res: Response) => {
    try {
        const { mappings } = req.body;
        const created = await CPLService.batchCreateMappings(mappings);

        res.status(201).json({
            data: created,
            message: `${created.count} mapping berhasil dibuat`
        });
    } catch (error: any) {
        console.error('Batch create mappings error:', error);
        if (error.message === 'Mappings must be an array' || error.message.includes('Total bobot')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal membuat batch mapping' });
    }
};

// Delete mapping
export const deleteMapping = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await CPLService.deleteMapping(id);
        res.json({ message: 'Mapping berhasil dihapus' });
    } catch (error) {
        console.error('Delete mapping error:', error);
        res.status(500).json({ error: 'Gagal menghapus mapping' });
    }
};
