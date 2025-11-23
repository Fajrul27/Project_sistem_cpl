// ============================================
// CPMK - CPL Mapping Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { calculateNilaiCplFromCpmk } from '../lib/calculation.js';

const router = Router();

// Get all CPMK-CPL mappings
router.get('/', authMiddleware, async (req, res) => {
    try {
        const mappings = await prisma.cpmkCplMapping.findMany({
            include: {
                cpmk: {
                    select: {
                        id: true,
                        kodeCpmk: true,
                        deskripsi: true,
                        mataKuliah: {
                            select: {
                                kodeMk: true,
                                namaMk: true
                            }
                        }
                    }
                },
                cpl: {
                    select: {
                        id: true,
                        kodeCpl: true,
                        deskripsi: true,
                        kategori: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ data: mappings });
    } catch (error) {
        console.error('Get CPMK-CPL mappings error:', error);
        res.status(500).json({ error: 'Gagal mengambil data mapping' });
    }
});

// Get mappings by CPMK ID
router.get('/cpmk/:cpmkId', authMiddleware, async (req, res) => {
    try {
        const { cpmkId } = req.params;

        const mappings = await prisma.cpmkCplMapping.findMany({
            where: { cpmkId },
            include: {
                cpl: {
                    select: {
                        id: true,
                        kodeCpl: true,
                        deskripsi: true,
                        kategori: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Calculate total bobot
        const totalBobot = mappings.reduce((sum, mapping) =>
            sum + Number(mapping.bobotPersentase), 0
        );

        res.json({
            data: mappings,
            totalBobot: totalBobot.toFixed(2)
        });
    } catch (error) {
        console.error('Get mappings by CPMK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data mapping' });
    }
});

// Create CPMK-CPL mapping
router.post('/', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { cpmkId, cplId, bobotPersentase } = req.body;

        // Validate required fields
        if (!cpmkId || !cplId || bobotPersentase === undefined) {
            return res.status(400).json({
                error: 'CPMK, CPL, dan Bobot Persentase harus diisi'
            });
        }

        // Validate bobot range
        const bobot = parseFloat(bobotPersentase);
        if (bobot < 0 || bobot > 100) {
            return res.status(400).json({
                error: 'Bobot persentase harus antara 0-100%'
            });
        }

        // Check if CPMK exists
        const cpmk = await prisma.cpmk.findUnique({
            where: { id: cpmkId }
        });
        if (!cpmk) {
            return res.status(404).json({ error: 'CPMK tidak ditemukan' });
        }

        // Check if CPL exists
        const cpl = await prisma.cpl.findUnique({
            where: { id: cplId }
        });
        if (!cpl) {
            return res.status(404).json({ error: 'CPL tidak ditemukan' });
        }

        // Check if mapping already exists
        const existing = await prisma.cpmkCplMapping.findFirst({
            where: { cpmkId, cplId }
        });

        if (existing) {
            return res.status(400).json({ error: 'Mapping sudah ada' });
        }

        // Check total bobot after adding new mapping
        const currentMappings = await prisma.cpmkCplMapping.findMany({
            where: { cpmkId }
        });

        const currentTotal = currentMappings.reduce((sum, m) =>
            sum + Number(m.bobotPersentase), 0
        );

        if (currentTotal + bobot > 100) {
            return res.status(400).json({
                error: `Total bobot akan melebihi 100% (saat ini: ${currentTotal.toFixed(2)}%)`
            });
        }

        const mapping = await prisma.cpmkCplMapping.create({
            data: {
                cpmkId,
                cplId,
                bobotPersentase: bobot
            },
            include: {
                cpmk: {
                    select: {
                        id: true,
                        kodeCpmk: true,
                        deskripsi: true
                    }
                },
                cpl: {
                    select: {
                        id: true,
                        kodeCpl: true,
                        deskripsi: true
                    }
                }
            }
        });

        res.status(201).json({
            data: mapping,
            message: 'Mapping CPMK-CPL berhasil dibuat'
        });
    } catch (error) {
        console.error('Create CPMK-CPL mapping error:', error);
        res.status(500).json({ error: 'Gagal membuat mapping' });
    }
});

// Update CPMK-CPL mapping (update bobot)
router.put('/:id', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { bobotPersentase } = req.body;

        if (bobotPersentase === undefined) {
            return res.status(400).json({ error: 'Bobot persentase harus diisi' });
        }

        // Validate bobot range
        const bobot = parseFloat(bobotPersentase);
        if (bobot < 0 || bobot > 100) {
            return res.status(400).json({
                error: 'Bobot persentase harus antara 0-100%'
            });
        }

        // Check if mapping exists
        const existing = await prisma.cpmkCplMapping.findUnique({
            where: { id },
            include: { cpmk: true }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Mapping tidak ditemukan' });
        }

        // Check total bobot after update
        const otherMappings = await prisma.cpmkCplMapping.findMany({
            where: {
                cpmkId: existing.cpmkId,
                id: { not: id }
            }
        });

        const otherTotal = otherMappings.reduce((sum, m) =>
            sum + Number(m.bobotPersentase), 0
        );

        if (otherTotal + bobot > 100) {
            return res.status(400).json({
                error: `Total bobot akan melebihi 100% (mapping lain: ${otherTotal.toFixed(2)}%)`
            });
        }

        const mapping = await prisma.cpmkCplMapping.update({
            where: { id },
            data: { bobotPersentase: bobot },
            include: {
                cpmk: {
                    select: {
                        id: true,
                        kodeCpmk: true,
                        deskripsi: true
                    }
                },
                cpl: {
                    select: {
                        id: true,
                        kodeCpl: true,
                        deskripsi: true
                    }
                }
            }
        });

        // Recalculate CPL grades
        await recalculateCplForBatch(existing.cpmkId, existing.cpmk.mataKuliahId);

        res.json({
            data: mapping,
            message: 'Mapping berhasil diupdate'
        });
    } catch (error) {
        console.error('Update CPMK-CPL mapping error:', error);
        res.status(500).json({ error: 'Gagal mengupdate mapping' });
    }
});

// Batch create mappings
router.post('/batch', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { mappings: mappingData } = req.body;

        if (!Array.isArray(mappingData)) {
            return res.status(400).json({ error: 'mappings harus berupa array' });
        }

        // Validate total bobot doesn't exceed 100% per CPMK
        const bobotByCpmk = new Map<string, number>();

        for (const m of mappingData) {
            const current = bobotByCpmk.get(m.cpmkId) || 0;
            bobotByCpmk.set(m.cpmkId, current + parseFloat(m.bobotPersentase));
        }

        for (const [cpmkId, total] of bobotByCpmk.entries()) {
            if (total > 100) {
                return res.status(400).json({
                    error: `Total bobot untuk CPMK ${cpmkId} melebihi 100%`
                });
            }
        }

        const created = await prisma.cpmkCplMapping.createMany({
            data: mappingData.map((m: any) => ({
                cpmkId: m.cpmkId,
                cplId: m.cplId,
                bobotPersentase: parseFloat(m.bobotPersentase)
            })),
            skipDuplicates: true
        });

        res.status(201).json({
            data: created,
            message: `${created.count} mapping berhasil dibuat`
        });
    } catch (error) {
        console.error('Batch create mappings error:', error);
        res.status(500).json({ error: 'Gagal membuat batch mapping' });
    }
});

// Delete CPMK-CPL mapping
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if mapping exists
        const existing = await prisma.cpmkCplMapping.findUnique({
            where: { id },
            include: { cpmk: true }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Mapping tidak ditemukan' });
        }

        await prisma.cpmkCplMapping.delete({
            where: { id }
        });

        // Recalculate CPL grades
        await recalculateCplForBatch(existing.cpmkId, existing.cpmk.mataKuliahId);

        res.json({ message: 'Mapping berhasil dihapus' });
    } catch (error) {
        console.error('Delete CPMK-CPL mapping error:', error);
        res.status(500).json({ error: 'Gagal menghapus mapping' });
    }
});

// Helper: Recalculate CPL for all affected students
async function recalculateCplForBatch(cpmkId: string, mataKuliahId: string) {
    try {
        // Find all students who have grades for this CPMK
        const affectedGrades = await prisma.nilaiCpmk.findMany({
            where: { cpmkId },
            select: {
                mahasiswaId: true,
                semester: true,
                tahunAjaran: true
            },
            distinct: ['mahasiswaId', 'semester', 'tahunAjaran']
        });

        console.log(`Recalculating CPL for CPMK ${cpmkId}, affecting ${affectedGrades.length} students`);

        for (const grade of affectedGrades) {
            await calculateNilaiCplFromCpmk(
                grade.mahasiswaId,
                mataKuliahId,
                grade.semester,
                grade.tahunAjaran
            );
        }
    } catch (error) {
        console.error('Recalculate CPL batch error:', error);
    }
}

export default router;
