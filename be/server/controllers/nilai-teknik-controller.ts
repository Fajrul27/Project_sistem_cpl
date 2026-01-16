import { Request, Response } from 'express';
import { NilaiService } from '../services/NilaiService.js';

// Get all nilai teknik by mahasiswa
export const getNilaiByMahasiswa = async (req: Request, res: Response) => {
    try {
        const { mahasiswaId } = req.params;
        const { semester, tahunAjaranId } = req.query;

        const nilaiTeknik = await NilaiService.getNilaiByMahasiswa(
            mahasiswaId,
            semester ? parseInt(semester as string) : undefined,
            tahunAjaranId as string
        );

        res.json({ data: nilaiTeknik });
    } catch (error) {
        console.error('Get nilai teknik error:', error);
        res.status(500).json({ error: 'Gagal mengambil data nilai teknik penilaian' });
    }
};

// Get nilai teknik for specific CPMK
export const getNilaiByCpmk = async (req: Request, res: Response) => {
    try {
        const { cpmkId, mahasiswaId } = req.params;
        const { semester, tahunAjaranId } = req.query;

        const nilaiTeknik = await NilaiService.getNilaiByCpmk(
            cpmkId,
            mahasiswaId,
            semester ? parseInt(semester as string) : undefined,
            tahunAjaranId as string
        );

        res.json({ data: nilaiTeknik });
    } catch (error) {
        console.error('Get nilai teknik by CPMK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data' });
    }
};

// Get all nilai teknik for specific Mata Kuliah (Bulk fetch for Input Grid)
export const getNilaiByMataKuliah = async (req: Request, res: Response) => {
    try {
        const { mataKuliahId } = req.params;
        const { semester, tahunAjaranId } = req.query;

        const nilaiTeknik = await NilaiService.getNilaiByMataKuliah(
            mataKuliahId,
            semester ? parseInt(semester as string) : undefined,
            tahunAjaranId as string
        );

        res.json({ data: nilaiTeknik });
    } catch (error) {
        console.error('Get nilai teknik by MK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data nilai' });
    }
};

// Create/Update nilai teknik penilaian (single)
export const createOrUpdateNilai = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const nilaiTeknik = await NilaiService.createOrUpdateNilai(req.body, userId);

        res.status(201).json({
            data: nilaiTeknik,
            message: 'Nilai teknik penilaian berhasil disimpan'
        });
    } catch (error: any) {
        console.error('Create nilai teknik error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'MISSING_FIELDS') {
            return res.status(400).json({
                error: 'Mahasiswa, teknik penilaian, mata kuliah, nilai, semester, dan tahun ajaran harus diisi'
            });
        }
        if (error.message === 'INVALID_NILAI') return res.status(400).json({ error: 'Nilai harus antara 0-100' });
        if (error.message === 'TEKNIK_NOT_FOUND') return res.status(404).json({ error: 'Teknik penilaian tidak ditemukan' });
        if (error.message === 'MISMATCH_MK') return res.status(400).json({ error: 'Teknik penilaian tidak sesuai dengan mata kuliah yang dipilih' });
        res.status(500).json({ error: 'Gagal menyimpan nilai' });
    }
};

// Batch input nilai (untuk multiple mahasiswa)
export const batchInputNilai = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const { results, errors } = await NilaiService.batchInputNilai(req.body, userId, userRole);

        res.status(201).json({
            message: `${results.length} nilai berhasil disimpan`,
            data: results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error: any) {
        console.error('Batch input error:', error);
        if (error.message === 'INVALID_ENTRIES') return res.status(400).json({ error: 'Entries harus berupa array' });
        if (error.message === 'FORBIDDEN_PENGAMPU') return res.status(403).json({ error: 'Forbidden - You are not pengampu of this mata kuliah' });
        res.status(500).json({ error: 'Gagal melakukan batch input' });
    }
};

// Update nilai teknik
export const updateNilai = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const updated = await NilaiService.updateNilai(id, req.body, userId, userRole);

        res.json({
            data: updated,
            message: 'Nilai berhasil diupdate'
        });
    } catch (error: any) {
        console.error('Update nilai teknik error:', error);
        if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Nilai tidak ditemukan' });
        if (error.message === 'FORBIDDEN_PENGAMPU') return res.status(403).json({ error: 'Forbidden - You are not pengampu of this mata kuliah' });
        if (error.message === 'INVALID_NILAI') return res.status(400).json({ error: 'Nilai harus 0-100' });
        res.status(500).json({ error: 'Gagal update nilai' });
    }
};

// Delete nilai teknik
export const deleteNilai = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        await NilaiService.deleteNilai(id, userId, userRole);

        res.json({ message: 'Nilai berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete nilai teknik error:', error);
        if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Nilai tidak ditemukan' });
        if (error.message === 'FORBIDDEN_PENGAMPU') return res.status(403).json({ error: 'Forbidden - You are not pengampu of this mata kuliah' });
        res.status(500).json({ error: 'Gagal hapus nilai' });
    }
};

// Generate Template Excel
export const generateTemplate = async (req: Request, res: Response) => {
    try {
        const { mataKuliahId } = req.params;
        const { kelasId, semester, tahunAjaranId } = req.query;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const { buffer, filename } = await NilaiService.generateTemplate(
            mataKuliahId,
            kelasId as string,
            userId,
            userRole,
            semester ? parseInt(semester as string) : undefined,
            tahunAjaranId as string
        );

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error('Generate template error:', error);
        res.status(500).json({ error: 'Gagal membuat template' });
    }
};

// Import Excel
export const importNilai = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { mataKuliahId, semester, tahunAjaranId } = req.body;
        const file = req.file;

        if (!file || !mataKuliahId || !semester || !tahunAjaranId) {
            return res.status(400).json({ error: 'File, mata kuliah, semester, dan tahun ajaran harus diisi' });
        }

        const { successCount, errors } = await NilaiService.importNilai(
            file.buffer,
            mataKuliahId,
            parseInt(semester),
            tahunAjaranId,
            userId
        );

        res.json({
            message: `Import berhasil. ${successCount} nilai disimpan.`,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import excel error:', error);
        res.status(500).json({ error: 'Gagal melakukan import excel' });
    }
};
