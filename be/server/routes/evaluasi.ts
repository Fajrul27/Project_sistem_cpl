// ============================================
// Evaluasi Mata Kuliah (CQI) Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Get Evaluasi by Mata Kuliah
router.get('/mata-kuliah/:mataKuliahId', authMiddleware, async (req, res) => {
    try {
        const { mataKuliahId } = req.params;
        const { semester, tahunAjaran } = req.query;

        const where: any = { mataKuliahId };
        if (semester) where.semester = parseInt(semester as string);
        if (tahunAjaran) where.tahunAjaran = tahunAjaran;

        const evaluasi = await prisma.evaluasiMataKuliah.findMany({
            where,
            include: {
                dosen: {
                    select: {
                        id: true,
                        email: true,
                        profile: {
                            select: { namaLengkap: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ data: evaluasi });
    } catch (error) {
        console.error('Get evaluasi error:', error);
        res.status(500).json({ error: 'Gagal mengambil data evaluasi' });
    }
});

// Submit Evaluasi (Dosen)
router.post('/', authMiddleware, requireRole('dosen', 'admin'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { mataKuliahId, semester, tahunAjaran, kendala, rencanaPerbaikan } = req.body;

        if (!mataKuliahId || !semester || !tahunAjaran || !rencanaPerbaikan) {
            return res.status(400).json({ error: 'Data evaluasi tidak lengkap' });
        }

        const evaluasi = await prisma.evaluasiMataKuliah.upsert({
            where: {
                mataKuliahId_dosenId_semester_tahunAjaran: {
                    mataKuliahId,
                    dosenId: userId,
                    semester: parseInt(semester),
                    tahunAjaran
                }
            },
            update: {
                kendala,
                rencanaPerbaikan,
                updatedAt: new Date()
            },
            create: {
                mataKuliahId,
                dosenId: userId,
                semester: parseInt(semester),
                tahunAjaran,
                kendala,
                rencanaPerbaikan
            }
        });

        res.json({ data: evaluasi, message: 'Evaluasi berhasil disimpan' });
    } catch (error) {
        console.error('Submit evaluasi error:', error);
        res.status(500).json({ error: 'Gagal menyimpan evaluasi' });
    }
});

// Review Evaluasi (Kaprodi)
router.put('/:id/review', authMiddleware, requireRole('kaprodi', 'admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { feedbackKaprodi } = req.body;

        const evaluasi = await prisma.evaluasiMataKuliah.update({
            where: { id },
            data: {
                feedbackKaprodi,
                status: 'reviewed',
                updatedAt: new Date()
            }
        });

        res.json({ data: evaluasi, message: 'Feedback berhasil disimpan' });
    } catch (error) {
        console.error('Review evaluasi error:', error);
        res.status(500).json({ error: 'Gagal menyimpan feedback' });
    }
});

export default router;
