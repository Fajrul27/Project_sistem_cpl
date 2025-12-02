// ============================================
// Rubrik Routes (CPMK Level)
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole, requirePengampu } from '../middleware/auth.js';

const router = Router();

// Get Rubrik by CPMK ID
router.get('/:cpmkId', authMiddleware, async (req, res) => {
    try {
        const { cpmkId } = req.params;

        const rubrik = await prisma.rubrik.findUnique({
            where: { cpmkId },
            include: {
                kriteria: {
                    include: {
                        levels: {
                            orderBy: { nilai: 'desc' }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!rubrik) {
            return res.status(404).json({ error: 'Rubrik tidak ditemukan' });
        }

        res.json({ data: rubrik });
    } catch (error) {
        console.error('Get rubrik error:', error);
        res.status(500).json({ error: 'Gagal mengambil data rubrik' });
    }
});

// Create or Update Rubrik
router.post('/', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { cpmkId, deskripsi, kriteria } = req.body;

        // Validate input
        if (!cpmkId || !Array.isArray(kriteria) || kriteria.length === 0) {
            return res.status(400).json({ error: 'Data rubrik tidak valid' });
        }

        // Check if CPMK exists
        const cpmk = await prisma.cpmk.findUnique({
            where: { id: cpmkId }
        });

        if (!cpmk) {
            return res.status(404).json({ error: 'CPMK tidak ditemukan' });
        }

        // Transaction to handle full replacement of rubric structure
        const result = await prisma.$transaction(async (tx) => {
            // 1. Find existing rubrik
            const existingRubrik = await tx.rubrik.findUnique({
                where: { cpmkId }
            });

            let rubrikId = existingRubrik?.id;

            if (existingRubrik) {
                // Update basic info
                await tx.rubrik.update({
                    where: { id: rubrikId },
                    data: { deskripsi }
                });

                // Delete existing criteria (cascade will delete levels)
                await tx.rubrikKriteria.deleteMany({
                    where: { rubrikId }
                });
            } else {
                // Create new rubrik
                const newRubrik = await tx.rubrik.create({
                    data: {
                        cpmkId,
                        deskripsi
                    }
                });
                rubrikId = newRubrik.id;
            }

            // 2. Create new criteria and levels
            for (const krit of kriteria) {
                const newKriteria = await tx.rubrikKriteria.create({
                    data: {
                        rubrikId: rubrikId!,
                        deskripsi: krit.deskripsi,
                        bobot: krit.bobot
                    }
                });

                if (Array.isArray(krit.levels)) {
                    await tx.rubrikLevel.createMany({
                        data: krit.levels.map((lvl: any) => ({
                            kriteriaId: newKriteria.id,
                            deskripsi: lvl.deskripsi,
                            nilai: lvl.nilai,
                            label: lvl.label
                        }))
                    });
                }
            }

            return await tx.rubrik.findUnique({
                where: { id: rubrikId },
                include: {
                    kriteria: {
                        include: { levels: true }
                    }
                }
            });
        });

        res.json({ data: result, message: 'Rubrik berhasil disimpan' });
    } catch (error) {
        console.error('Save rubrik error:', error);
        res.status(500).json({ error: 'Gagal menyimpan rubrik' });
    }
});

// Delete Rubrik
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.rubrik.delete({
            where: { id }
        });

        res.json({ message: 'Rubrik berhasil dihapus' });
    } catch (error) {
        console.error('Delete rubrik error:', error);
        res.status(500).json({ error: 'Gagal menghapus rubrik' });
    }
});

export default router;
