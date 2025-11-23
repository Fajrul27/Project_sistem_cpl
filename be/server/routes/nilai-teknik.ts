// ============================================
// Nilai Teknik Penilaian Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { calculateNilaiCpmk, calculateNilaiCplFromCpmk } from '../lib/calculation.js';

const router = Router();

// Get all nilai teknik by mahasiswa
router.get('/mahasiswa/:mahasiswaId', authMiddleware, async (req, res) => {
    try {
        const { mahasiswaId } = req.params;
        const { semester, tahunAjaran } = req.query;

        const where: any = { mahasiswaId };
        if (semester) where.semester = parseInt(semester as string);
        if (tahunAjaran) where.tahunAjaran = tahunAjaran;

        const nilaiTeknik = await prisma.nilaiTeknikPenilaian.findMany({
            where,
            include: {
                teknikPenilaian: {
                    include: {
                        cpmk: {
                            include: {
                                mataKuliah: true
                            }
                        }
                    }
                },
                mataKuliah: true
            },
            orderBy: [
                { semester: 'asc' },
                { tahunAjaran: 'asc' }
            ]
        });

        res.json({ data: nilaiTeknik });
    } catch (error) {
        console.error('Get nilai teknik error:', error);
        res.status(500).json({ error: 'Gagal mengambil data nilai teknik penilaian' });
    }
});

// Get nilai teknik for specific CPMK
router.get('/cpmk/:cpmkId/:mahasiswaId', authMiddleware, async (req, res) => {
    try {
        const { cpmkId, mahasiswaId } = req.params;
        const { semester, tahunAjaran } = req.query;

        // Get teknik penilaian for this CPMK
        const teknikList = await prisma.teknikPenilaian.findMany({
            where: { cpmkId },
            orderBy: { createdAt: 'asc' }
        });

        // Get nilai for each teknik
        const nilaiTeknik = await Promise.all(
            teknikList.map(async (teknik) => {
                const where: any = {
                    mahasiswaId,
                    teknikPenilaianId: teknik.id
                };
                if (semester) where.semester = parseInt(semester as string);
                if (tahunAjaran) where.tahunAjaran = tahunAjaran;

                const nilai = await prisma.nilaiTeknikPenilaian.findFirst({ where });

                return {
                    teknikPenilaian: teknik,
                    nilai: nilai || null
                };
            })
        );

        res.json({ data: nilaiTeknik });
    } catch (error) {
        console.error('Get nilai teknik by CPMK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data' });
    }
});

// Create/Update nilai teknik penilaian (single)
router.post('/', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { mahasiswaId, teknikPenilaianId, mataKuliahId, nilai, semester, tahunAjaran, catatan } = req.body;

        // Validate required fields
        if (!mahasiswaId || !teknikPenilaianId || !mataKuliahId || nilai === undefined || !semester || !tahunAjaran) {
            return res.status(400).json({
                error: 'Mahasiswa, teknik penilaian, mata kuliah, nilai, semester, dan tahun ajaran harus diisi'
            });
        }

        // Validate nilai range
        const nilaiNum = parseFloat(nilai);
        if (nilaiNum < 0 || nilaiNum > 100) {
            return res.status(400).json({ error: 'Nilai harus antara 0-100' });
        }

        // Check if teknik penilaian exists and get CPMK
        const teknik = await prisma.teknikPenilaian.findUnique({
            where: { id: teknikPenilaianId },
            include: {
                cpmk: true
            }
        });

        if (!teknik) {
            return res.status(404).json({ error: 'Teknik penilaian tidak ditemukan' });
        }

        // Check CPMK validation status
        if (teknik.cpmk.statusValidasi !== 'active' && teknik.cpmk.statusValidasi !== 'validated') {
            return res.status(400).json({
                error: 'CPMK belum divalidasi. Harap validasi CPMK terlebih dahulu sebelum input nilai.'
            });
        }

        // Upsert nilai teknik
        const nilaiTeknik = await prisma.nilaiTeknikPenilaian.upsert({
            where: {
                mahasiswaId_teknikPenilaianId_semester_tahunAjaran: {
                    mahasiswaId,
                    teknikPenilaianId,
                    semester: parseInt(semester),
                    tahunAjaran
                }
            },
            update: {
                nilai: nilaiNum,
                catatan: catatan?.trim() || null,
                updatedAt: new Date()
            },
            create: {
                mahasiswaId,
                teknikPenilaianId,
                mataKuliahId,
                nilai: nilaiNum,
                semester: parseInt(semester),
                tahunAjaran,
                catatan: catatan?.trim() || null,
                createdBy: userId
            },
            include: {
                teknikPenilaian: {
                    include: {
                        cpmk: true
                    }
                }
            }
        });

        // Trigger auto-calculate CPMK nilai
        await calculateNilaiCpmk(mahasiswaId, teknik.cpmkId, mataKuliahId, parseInt(semester), tahunAjaran);

        res.status(201).json({
            data: nilaiTeknik,
            message: 'Nilai teknik penilaian berhasil disimpan'
        });
    } catch (error) {
        console.error('Create nilai teknik error:', error);
        res.status(500).json({ error: 'Gagal menyimpan nilai' });
    }
});

// Batch input nilai (untuk multiple mahasiswa)
router.post('/batch', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { entries } = req.body; // Array of { mahasiswaId, teknikPenilaianId, mataKuliahId, nilai, semester, tahunAjaran }

        if (!Array.isArray(entries)) {
            return res.status(400).json({ error: 'Entries harus berupa array' });
        }

        const results = [];
        const errors = [];

        for (const entry of entries) {
            try {
                const { mahasiswaId, teknikPenilaianId, mataKuliahId, nilai, semester, tahunAjaran } = entry;

                // Validate
                if (!mahasiswaId || !teknikPenilaianId || nilai === undefined) {
                    errors.push({ entry, error: 'Data tidak lengkap' });
                    continue;
                }

                const nilaiNum = parseFloat(nilai);
                if (nilaiNum < 0 || nilaiNum > 100) {
                    errors.push({ entry, error: 'Nilai harus 0-100' });
                    continue;
                }

                // Upsert
                const nilaiTeknik = await prisma.nilaiTeknikPenilaian.upsert({
                    where: {
                        mahasiswaId_teknikPenilaianId_semester_tahunAjaran: {
                            mahasiswaId,
                            teknikPenilaianId,
                            semester: parseInt(semester),
                            tahunAjaran
                        }
                    },
                    update: {
                        nilai: nilaiNum,
                        updatedAt: new Date()
                    },
                    create: {
                        mahasiswaId,
                        teknikPenilaianId,
                        mataKuliahId,
                        nilai: nilaiNum,
                        semester: parseInt(semester),
                        tahunAjaran,
                        createdBy: userId
                    }
                });

                results.push(nilaiTeknik);

                // Get CPMK ID for calculation
                const teknik = await prisma.teknikPenilaian.findUnique({
                    where: { id: teknikPenilaianId }
                });
                if (teknik) {
                    await calculateNilaiCpmk(mahasiswaId, teknik.cpmkId, mataKuliahId, parseInt(semester), tahunAjaran);
                }
            } catch (err) {
                errors.push({ entry, error: err instanceof Error ? err.message : 'Unknown error' });
            }
        }

        res.status(201).json({
            message: `${results.length} nilai berhasil disimpan`,
            data: results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Batch input error:', error);
        res.status(500).json({ error: 'Gagal melakukan batch input' });
    }
});

// Update nilai teknik
router.put('/:id', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nilai, catatan } = req.body;

        const existing = await prisma.nilaiTeknikPenilaian.findUnique({
            where: { id },
            include: {
                teknikPenilaian: true
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Nilai tidak ditemukan' });
        }

        const nilaiNum = parseFloat(nilai);
        if (nilaiNum < 0 || nilaiNum > 100) {
            return res.status(400).json({ error: 'Nilai harus 0-100' });
        }

        const updated = await prisma.nilaiTeknikPenilaian.update({
            where: { id },
            data: {
                nilai: nilaiNum,
                catatan: catatan?.trim() || null,
                updatedAt: new Date()
            }
        });

        // Recalculate CPMK
        await calculateNilaiCpmk(
            existing.mahasiswaId,
            existing.teknikPenilaian.cpmkId,
            existing.mataKuliahId,
            existing.semester,
            existing.tahunAjaran
        );

        res.json({
            data: updated,
            message: 'Nilai berhasil diupdate'
        });
    } catch (error) {
        console.error('Update nilai teknik error:', error);
        res.status(500).json({ error: 'Gagal update nilai' });
    }
});

// Delete nilai teknik
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await prisma.nilaiTeknikPenilaian.findUnique({
            where: { id },
            include: {
                teknikPenilaian: true
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Nilai tidak ditemukan' });
        }

        await prisma.nilaiTeknikPenilaian.delete({
            where: { id }
        });

        // Recalculate CPMK
        await calculateNilaiCpmk(
            existing.mahasiswaId,
            existing.teknikPenilaian.cpmkId,
            existing.mataKuliahId,
            existing.semester,
            existing.tahunAjaran
        );

        res.json({ message: 'Nilai berhasil dihapus' });
    } catch (error) {
        console.error('Delete nilai teknik error:', error);
        res.status(500).json({ error: 'Gagal hapus nilai' });
    }
});

// Helper functions moved to ../lib/calculation.ts

export default router;
