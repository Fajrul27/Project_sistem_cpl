import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { z } from 'zod';
import { recalculateCpmkBulk } from '../lib/calculation.js';

const router = Router();

// Schema validation
const subCpmkSchema = z.object({
    kode: z.string(),
    deskripsi: z.string(),
    bobot: z.number().optional().default(0)
});

// GET /api/sub-cpmk?cpmkId=...
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { cpmkId } = req.query;

        if (!cpmkId) {
            return res.status(400).json({ error: 'CPMK ID wajib diisi' });
        }

        const data = await prisma.subCpmk.findMany({
            where: { cpmkId: String(cpmkId) },
            include: {
                asesmenMappings: {
                    include: {
                        teknikPenilaian: true
                    }
                }
            },
            orderBy: { kode: 'asc' }
        });

        res.json({ data });
    } catch (error) {
        console.error('Error fetching sub-cpmk:', error);
        res.status(500).json({ error: 'Gagal mengambil data Sub-CPMK' });
    }
});

// POST /api/sub-cpmk?cpmkId=...
router.post('/', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), async (req, res) => {
    try {
        const { cpmkId } = req.query;
        if (!cpmkId) {
            return res.status(400).json({ error: 'CPMK ID wajib diisi' });
        }

        const validation = subCpmkSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.issues[0].message });
        }

        const body = validation.data;

        const subCpmk = await prisma.subCpmk.create({
            data: {
                cpmkId: String(cpmkId),
                kode: body.kode,
                deskripsi: body.deskripsi,
                bobot: body.bobot
            }
        });

        // Trigger recalculation (in case new sub-cpmk affects total bobot, though usually 0 initially)
        await recalculateCpmkBulk(String(cpmkId));

        res.status(201).json({ data: subCpmk });
    } catch (error: any) {
        console.error('Error creating sub-cpmk:', error);
        res.status(500).json({ error: 'Gagal membuat Sub-CPMK' });
    }
});

// PUT /api/sub-cpmk/:id
router.put('/:id', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), async (req, res) => {
    try {
        const { id } = req.params;

        const validation = subCpmkSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.issues[0].message });
        }

        const body = validation.data;

        const subCpmk = await prisma.subCpmk.update({
            where: { id },
            data: {
                kode: body.kode,
                deskripsi: body.deskripsi,
                bobot: body.bobot
            }
        });

        // Trigger recalculation
        await recalculateCpmkBulk(subCpmk.cpmkId);

        res.json({ data: subCpmk });
    } catch (error: any) {
        console.error('Error updating sub-cpmk:', error);
        res.status(500).json({ error: 'Gagal mengupdate Sub-CPMK' });
    }
});

// DELETE /api/sub-cpmk/:id
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), async (req, res) => {
    try {
        const { id } = req.params;
        const subCpmk = await prisma.subCpmk.findUnique({ where: { id } });

        if (subCpmk) {
            await prisma.subCpmk.delete({ where: { id } });
            // Trigger recalculation
            await recalculateCpmkBulk(subCpmk.cpmkId);
        }

        res.json({ message: 'Sub-CPMK berhasil dihapus' });
    } catch (error: any) {
        console.error('Error deleting sub-cpmk:', error);
        res.status(500).json({ error: 'Gagal menghapus Sub-CPMK' });
    }
});

// POST /api/sub-cpmk/mapping
router.post('/mapping', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), async (req, res) => {
    try {
        const { subCpmkId, teknikPenilaianId, bobot } = req.body;

        if (!subCpmkId || !teknikPenilaianId) {
            return res.status(400).json({ error: 'Data tidak lengkap' });
        }

        const mapping = await prisma.asesmenSubCpmk.create({
            data: {
                subCpmkId,
                teknikPenilaianId,
                bobot: Number(bobot) || 100
            },
            include: { subCpmk: true }
        });

        // Trigger recalculation
        await recalculateCpmkBulk(mapping.subCpmk.cpmkId);

        res.status(201).json({ data: mapping });
    } catch (error) {
        console.error('Error creating mapping:', error);
        res.status(500).json({ error: 'Gagal membuat mapping' });
    }
});

// DELETE /api/sub-cpmk/mapping/:id
router.delete('/mapping/:id', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), async (req, res) => {
    try {
        const { id } = req.params;
        const mapping = await prisma.asesmenSubCpmk.findUnique({
            where: { id },
            include: { subCpmk: true }
        });

        if (mapping) {
            await prisma.asesmenSubCpmk.delete({ where: { id } });
            // Trigger recalculation
            await recalculateCpmkBulk(mapping.subCpmk.cpmkId);
        }

        res.json({ message: 'Mapping berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting mapping:', error);
        res.status(500).json({ error: 'Gagal menghapus mapping' });
    }
});

export default router;
