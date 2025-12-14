
import { Request, Response } from 'express';
import { CPMKMappingService } from '../services/CPMKMappingService.js';

export const getAllMappings = async (req: Request, res: Response) => {
    try {
        const mappings = await CPMKMappingService.getAllMappings();
        res.json({ data: mappings });
    } catch (error) {
        console.error('Get CPMK-CPL mappings error:', error);
        res.status(500).json({ error: 'Gagal mengambil data mapping' });
    }
};

export const getMappingsByCpmk = async (req: Request, res: Response) => {
    try {
        const { cpmkId } = req.params;
        const result = await CPMKMappingService.getMappingsByCpmk(cpmkId);
        res.json({ data: result.mappings, totalBobot: result.totalBobot });
    } catch (error) {
        console.error('Get mappings by CPMK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data mapping' });
    }
};

export const createMapping = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const mapping = await CPMKMappingService.createMapping(userId, userRole, req.body);

        res.status(201).json({
            data: mapping,
            message: 'Mapping CPMK-CPL berhasil dibuat'
        });
    } catch (error: any) {
        console.error('Create CPMK-CPL mapping error:', error);
        if (error.message === 'MISSING_FIELDS') return res.status(400).json({ error: 'CPMK, CPL, dan Bobot Persentase harus diisi' });
        if (error.message === 'INVALID_BOBOT') return res.status(400).json({ error: 'Bobot persentase harus antara 0-100%' });
        if (error.message === 'CPMK_NOT_FOUND') return res.status(404).json({ error: 'CPMK tidak ditemukan' });
        if (error.message === 'CPL_NOT_FOUND') return res.status(404).json({ error: 'CPL tidak ditemukan' });
        if (error.message === 'MAPPING_EXISTS') return res.status(400).json({ error: 'Mapping sudah ada' });
        if (error.message === 'FORBIDDEN_ACCESS') return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        if (error.message.startsWith('TOTAL_BOBOT_EXCEEDED')) {
            const currentTotal = error.message.split(':')[1];
            return res.status(400).json({ error: `Total bobot akan melebihi 100% (saat ini: ${currentTotal}%)` });
        }
        res.status(500).json({ error: 'Gagal membuat mapping' });
    }
};

export const updateMapping = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const mapping = await CPMKMappingService.updateMapping(id, req.body.bobotPersentase);

        res.json({
            data: mapping,
            message: 'Mapping berhasil diupdate'
        });
    } catch (error: any) {
        console.error('Update CPMK-CPL mapping error:', error);
        if (error.message === 'MISSING_FIELDS') return res.status(400).json({ error: 'Bobot persentase harus diisi' });
        if (error.message === 'INVALID_BOBOT') return res.status(400).json({ error: 'Bobot persentase harus antara 0-100%' });
        if (error.message === 'MAPPING_NOT_FOUND') return res.status(404).json({ error: 'Mapping tidak ditemukan' });
        if (error.message.startsWith('TOTAL_BOBOT_EXCEEDED')) {
            const otherTotal = error.message.split(':')[1];
            return res.status(400).json({ error: `Total bobot akan melebihi 100% (mapping lain: ${otherTotal}%)` });
        }
        res.status(500).json({ error: 'Gagal mengupdate mapping' });
    }
};

export const batchCreateMappings = async (req: Request, res: Response) => {
    try {
        const { mappings: mappingData } = req.body;
        if (!Array.isArray(mappingData)) return res.status(400).json({ error: 'mappings harus berupa array' });

        const created = await CPMKMappingService.batchCreateMappings(mappingData);

        res.status(201).json({
            data: created,
            message: `${created.count} mapping berhasil dibuat`
        });
    } catch (error: any) {
        console.error('Batch create mappings error:', error);
        if (error.message.startsWith('TOTAL_BOBOT_EXCEEDED_FOR_CPMK')) {
            const cpmkId = error.message.split(':')[1];
            return res.status(400).json({ error: `Total bobot untuk CPMK ${cpmkId} melebihi 100%` });
        }
        res.status(500).json({ error: 'Gagal membuat batch mapping' });
    }
};

export const deleteMapping = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await CPMKMappingService.deleteMapping(id);
        res.json({ message: 'Mapping berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete CPMK-CPL mapping error:', error);
        if (error.message === 'MAPPING_NOT_FOUND') return res.status(404).json({ error: 'Mapping tidak ditemukan' });
        res.status(500).json({ error: 'Gagal menghapus mapping' });
    }
};
