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
        nilai: z.number().min(0).max(100) // Scale 0-100
    }))
});

// GET /api/kuesioner/me?semester=...&tahunAjaran=...
// Get current student's questionnaire
router.get('/me', authMiddleware, requireRole('mahasiswa'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const { semester, tahunAjaran } = req.query;

        console.log(`[Kuesioner GET] User: ${userId}, Sem: ${semester}, TA: ${tahunAjaran}`);

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

        console.log(`[Kuesioner GET] Found ${data.length} records`);
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
        console.log(`[Kuesioner POST] User: ${userId}, Body:`, JSON.stringify(req.body, null, 2));

        const body = kuesionerSchema.parse(req.body);

        // Use transaction to upsert multiple records
        const result = await prisma.$transaction(
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

        console.log(`[Kuesioner POST] Upserted ${result.length} records`);
        res.json({ message: 'Kuesioner berhasil disimpan' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('[Kuesioner POST] Validation Error:', error.issues);
            return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Error submitting kuesioner:', error);
        res.status(500).json({ error: 'Gagal menyimpan kuesioner' });
    }
});

// GET /api/kuesioner/stats?prodiId=...&tahunAjaran=...&semester=...&fakultasId=...
// Get stats for Kaprodi/Admin
router.get('/stats', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { prodiId, tahunAjaran, semester, fakultasId } = req.query;

        const whereClause: any = {};

        // Filter by Tahun Ajaran
        if (tahunAjaran) whereClause.tahunAjaran = String(tahunAjaran);

        // Filter by Semester
        // Filter by Semester
        if (semester && semester !== 'all' && semester !== 'undefined') {
            const semInt = parseInt(String(semester));
            if (!isNaN(semInt)) {
                whereClause.semester = semInt;
            }
        }

        // Handle Prodi/Fakultas Filters & Security
        if (userRole === 'kaprodi') {
            // [SECURITY] Force Kaprodi to only see their own Prodi
            const profile = await prisma.profile.findUnique({ where: { userId } });
            if (!profile?.prodiId) {
                return res.status(403).json({ error: 'Profil Kaprodi tidak valid (tidak memiliki Prodi)' });
            }

            whereClause.mahasiswa = {
                prodiId: profile.prodiId
            };
        } else if (userRole === 'admin') {
            // Admin can filter by Prodi or Fakultas
            if (prodiId && prodiId !== 'all') {
                whereClause.mahasiswa = {
                    prodiId: String(prodiId)
                };
            } else if (fakultasId && fakultasId !== 'all') {
                whereClause.mahasiswa = {
                    prodi: {
                        fakultasId: String(fakultasId)
                    }
                };
            }
        }

        // Aggregate average score per CPL
        console.log('[Kuesioner Stats] Where Clause:', JSON.stringify(whereClause, null, 2));

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

        console.log('[Kuesioner Stats] Raw Stats:', JSON.stringify(stats, null, 2));

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
