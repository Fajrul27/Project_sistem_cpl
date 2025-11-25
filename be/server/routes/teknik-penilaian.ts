// ============================================
// Teknik Penilaian Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { calculateNilaiCpmk } from '../lib/calculation.js';

const router = Router();

// Get teknik penilaian by CPMK ID
router.get('/cpmk/:cpmkId', authMiddleware, async (req, res) => {
    try {
        const { cpmkId } = req.params;

        const teknikPenilaian = await prisma.teknikPenilaian.findMany({
            where: { cpmkId },
            orderBy: { createdAt: 'asc' }
        });

        // Calculate total bobot
        const totalBobot = teknikPenilaian.reduce((sum, tp) =>
            sum + Number(tp.bobotPersentase), 0
        );

        res.json({
            data: teknikPenilaian,
            totalBobot: totalBobot.toFixed(2)
        });
    } catch (error) {
        console.error('Get teknik penilaian error:', error);
        res.status(500).json({ error: 'Gagal mengambil data teknik penilaian' });
    }
});

// Create teknik penilaian
router.post('/', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { cpmkId, namaTeknik, bobotPersentase, deskripsi, teknikRefId } = req.body;

        // Validate required fields
        if (!cpmkId || (!namaTeknik && !teknikRefId) || bobotPersentase === undefined) {
            return res.status(400).json({
                error: 'CPMK, Nama Teknik (atau Ref ID), dan Bobot Persentase harus diisi'
            });
        }

        let finalNamaTeknik = namaTeknik;
        if (teknikRefId) {
            const ref = await prisma.teknikPenilaianRef.findUnique({ where: { id: teknikRefId } });
            if (!ref) return res.status(400).json({ error: 'Teknik Penilaian Ref tidak ditemukan' });
            finalNamaTeknik = ref.nama;
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

        // Check total bobot after adding new teknik penilaian
        const currentTeknik = await prisma.teknikPenilaian.findMany({
            where: { cpmkId }
        });

        const currentTotal = currentTeknik.reduce((sum, tp) =>
            sum + Number(tp.bobotPersentase), 0
        );

        if (currentTotal + bobot > 100) {
            return res.status(400).json({
                error: `Total bobot akan melebihi 100% (saat ini: ${currentTotal.toFixed(2)}%)`
            });
        }

        const teknikPenilaian = await prisma.teknikPenilaian.create({
            data: {
                cpmkId,
                namaTeknik: finalNamaTeknik.trim(),
                teknikRefId: teknikRefId || null,
                bobotPersentase: bobot,
                deskripsi: deskripsi?.trim() || null
            }
        });

        res.status(201).json({
            data: teknikPenilaian,
            message: 'Teknik penilaian berhasil dibuat'
        });
    } catch (error) {
        console.error('Create teknik penilaian error:', error);
        res.status(500).json({ error: 'Gagal membuat teknik penilaian' });
    }
});

// Update teknik penilaian
router.put('/:id', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { id } = req.params;
        const { namaTeknik, bobotPersentase, deskripsi, teknikRefId } = req.body;

        // Check if teknik penilaian exists
        const existing = await prisma.teknikPenilaian.findUnique({
            where: { id },
            include: { cpmk: true }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Teknik penilaian tidak ditemukan' });
        }

        // Prepare update data
        const updateData: any = {};

        if (namaTeknik !== undefined) {
            updateData.namaTeknik = namaTeknik.trim();
        }
        if (teknikRefId !== undefined) {
            updateData.teknikRefId = teknikRefId;
            // Also update name if ref changed
            if (teknikRefId) {
                const ref = await prisma.teknikPenilaianRef.findUnique({ where: { id: teknikRefId } });
                if (ref) updateData.namaTeknik = ref.nama;
            }
        }

        if (deskripsi !== undefined) {
            updateData.deskripsi = deskripsi?.trim() || null;
        }

        let weightChanged = false;
        if (bobotPersentase !== undefined) {
            // Validate bobot range
            const bobot = parseFloat(bobotPersentase);
            if (bobot < 0 || bobot > 100) {
                return res.status(400).json({
                    error: 'Bobot persentase harus antara 0-100%'
                });
            }

            // Check total bobot after update
            const otherTeknik = await prisma.teknikPenilaian.findMany({
                where: {
                    cpmkId: existing.cpmkId,
                    id: { not: id }
                }
            });

            const otherTotal = otherTeknik.reduce((sum, tp) =>
                sum + Number(tp.bobotPersentase), 0
            );

            if (otherTotal + bobot > 100) {
                return res.status(400).json({
                    error: `Total bobot akan melebihi 100% (teknik lain: ${otherTotal.toFixed(2)}%)`
                });
            }

            updateData.bobotPersentase = bobot;
            weightChanged = true;
        }

        const teknikPenilaian = await prisma.teknikPenilaian.update({
            where: { id },
            data: updateData
        });

        // Recalculate grades if weight changed
        if (weightChanged) {
            await recalculateCpmkForBatch(existing.cpmkId, existing.cpmk.mataKuliahId);
        }

        res.json({
            data: teknikPenilaian,
            message: 'Teknik penilaian berhasil diupdate'
        });
    } catch (error) {
        console.error('Update teknik penilaian error:', error);
        res.status(500).json({ error: 'Gagal mengupdate teknik penilaian' });
    }
});

// Delete teknik penilaian
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
    try {
        const { id } = req.params;

        // Check if teknik penilaian exists
        const existing = await prisma.teknikPenilaian.findUnique({
            where: { id },
            include: { cpmk: true }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Teknik penilaian tidak ditemukan' });
        }

        await prisma.teknikPenilaian.delete({
            where: { id }
        });

        // Recalculate grades
        await recalculateCpmkForBatch(existing.cpmkId, existing.cpmk.mataKuliahId);

        res.json({ message: 'Teknik penilaian berhasil dihapus' });
    } catch (error) {
        console.error('Delete teknik penilaian error:', error);
        res.status(500).json({ error: 'Gagal menghapus teknik penilaian' });
    }
});

// Helper: Recalculate CPMK for all affected students
async function recalculateCpmkForBatch(cpmkId: string, mataKuliahId: string) {
    try {
        // Find all students who have grades for this CPMK (via any teknik)
        // We query NilaiTeknikPenilaian for any teknik belonging to this CPMK
        const teknikIds = (await prisma.teknikPenilaian.findMany({
            where: { cpmkId },
            select: { id: true }
        })).map(t => t.id);

        if (teknikIds.length === 0) return;

        const affectedGrades = await prisma.nilaiTeknikPenilaian.findMany({
            where: { teknikPenilaianId: { in: teknikIds } },
            select: {
                mahasiswaId: true,
                semester: true,
                tahunAjaran: true
            },
            distinct: ['mahasiswaId', 'semester', 'tahunAjaran']
        });

        console.log(`Recalculating CPMK ${cpmkId} for ${affectedGrades.length} students`);

        for (const grade of affectedGrades) {
            await calculateNilaiCpmk(
                grade.mahasiswaId,
                cpmkId,
                mataKuliahId,
                grade.semester,
                grade.tahunAjaran
            );
        }
    } catch (error) {
        console.error('Recalculate batch error:', error);
    }
}

export default router;
