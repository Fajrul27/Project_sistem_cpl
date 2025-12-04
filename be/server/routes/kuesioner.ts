import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Schema validation
const kuesionerSchema = z.object({
    semester: z.number(),
    tahunAjaran: z.string(),
    nilai: z.array(z.object({
        cplId: z.string(),
        nilai: z.number().min(1).max(100) // Assuming 1-100 scale
    }))
});

// GET /api/kuesioner/me?semester=...&tahunAjaran=...
// Get current student's questionnaire
router.get('/me', authMiddleware, requireRole('mahasiswa'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { semester, tahunAjaran } = req.query;

        if (!semester || !tahunAjaran) {
            return res.status(400).json({ error: 'Semester dan Tahun Ajaran wajib diisi' });
        }

        const data = await prisma.penilaianTidakLangsung.findMany({
            where: {
                mahasiswaId: userId,
                semester: Number(semester),
                tahunAjaran: String(tahunAjaran)
            },
            include: {
                cpl: true
            }
        });

        res.json(data);
    } catch (error) {
        console.error('Error fetching kuesioner:', error);
        res.status(500).json({ error: 'Gagal mengambil data kuesioner' });
    }
});

// POST /api/kuesioner
// Submit questionnaire
router.post('/', authMiddleware, requireRole('mahasiswa'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const body = kuesionerSchema.parse(req.body);

        // Use transaction to upsert multiple records
        await prisma.$transaction(
            body.nilai.map(item =>
                prisma.penilaianTidakLangsung.upsert({
                    where: {
                        mahasiswaId_cplId_semester_tahunAjaran: {
                            mahasiswaId: userId,
                            cplId: item.cplId,
                            semester: body.semester,
                            tahunAjaran: body.tahunAjaran
                        }
                    },
                    update: {
                        nilai: item.nilai
                    },
                    create: {
                        mahasiswaId: userId,
                        cplId: item.cplId,
                        semester: body.semester,
                        tahunAjaran: body.tahunAjaran,
                        nilai: item.nilai
                    }
                })
            )
        );

        res.json({ message: 'Kuesioner berhasil disimpan' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Error submitting kuesioner:', error);
        res.status(500).json({ error: 'Gagal menyimpan kuesioner' });
    }
});

// GET /api/kuesioner/stats?prodiId=...&tahunAjaran=...
// Get stats for Kaprodi
router.get('/stats', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const { prodiId, tahunAjaran } = req.query;

        const whereClause: any = {};
        if (tahunAjaran) whereClause.tahunAjaran = String(tahunAjaran);
        if (prodiId) {
            whereClause.mahasiswa = {
                prodiId: String(prodiId)
            };
        }

        // Aggregate average score per CPL
        const stats = await prisma.penilaianTidakLangsung.groupBy({
            by: ['cplId'],
            where: whereClause,
            _avg: {
                nilai: true
            },
            _count: {
                nilai: true
            }
        });

        // Fetch CPL details to attach codes
        const cpls = await prisma.cpl.findMany({
            where: { id: { in: stats.map(s => s.cplId) } }
        });

        const result = stats.map(s => {
            const cpl = cpls.find(c => c.id === s.cplId);
            return {
                cplId: s.cplId,
                kodeCpl: cpl?.kodeCpl || 'Unknown',
                deskripsi: cpl?.deskripsi || '',
                rataRata: s._avg.nilai,
                jumlahResponden: s._count.nilai
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching kuesioner stats:', error);
        res.status(500).json({ error: 'Gagal mengambil statistik kuesioner' });
    }
});

export default router;
