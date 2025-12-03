// ============================================
// Transkrip CPL Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole, requireProdiScope } from '../middleware/auth.js';

const router = Router();

// Helper to calculate weighted average for a list of NilaiCpl
function calculateCplScoreSync(nilaiList: any[], cplId: string, weightMap: Map<string, number>, minNilai: number) {
  if (nilaiList.length === 0) return { nilaiAkhir: 0, status: 'belum_tercapai', semesterTercapai: 0, tahunAjaran: '-' };

  // Calculate weighted average: Σ(nilai × bobot × SKS) / Σ(bobot × SKS)
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const n of nilaiList) {
    const key = `${cplId}-${n.mataKuliahId}`;
    const bobot = weightMap.get(key) ?? 1.0;
    const sks = n.mataKuliah.sks;
    const nilai = Number(n.nilai);

    totalWeightedScore += nilai * bobot * sks;
    totalWeight += bobot * sks;
  }

  const avgScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const status = avgScore >= minNilai ? 'tercapai' : 'belum_tercapai';

  // Get latest semester info
  const latest = nilaiList.sort((a, b) => {
    if (a.tahunAjaran !== b.tahunAjaran) return a.tahunAjaran.localeCompare(b.tahunAjaran);
    return a.semester - b.semester;
  })[nilaiList.length - 1];

  return {
    nilaiAkhir: Number(avgScore.toFixed(2)),
    status,
    semesterTercapai: latest.semester,
    tahunAjaran: latest.tahunAjaran
  };
}

// GET /api/transkrip-cpl/analisis - Get aggregated analysis data
router.get('/analisis', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), async (req, res) => {
  try {
    const { semester } = req.query;
    const where: any = {};

    if (semester && semester !== 'all') {
      where.semester = Number(semester);
    }

    // 1. Get Average Score per CPL
    const aggregations = await prisma.nilaiCpl.groupBy({
      by: ['cplId'],
      _avg: {
        nilai: true
      },
      where
    });

    // Get CPL details for mapping
    const cpls = await prisma.cpl.findMany({
      select: { id: true, kodeCpl: true }
    });
    const cplMap = new Map(cpls.map(c => [c.id, c.kodeCpl]));

    const cplData = aggregations.map(agg => ({
      name: cplMap.get(agg.cplId) || 'Unknown',
      nilai: Number(agg._avg.nilai?.toFixed(2) || 0)
    })).sort((a, b) => a.name.localeCompare(b.name));

    // 2. Get Distribution Data (Optimized with Raw Query)
    const semesterParam = (semester && semester !== 'all') ? Number(semester) : undefined;

    // Use Prisma.sql for safe parameter interpolation if needed, or just conditional logic
    // Since we can't easily import Prisma class here without checking package.json/imports, 
    // we'll use separate queries or simple logic. 
    // Actually, let's import Prisma at the top first.

    let distributionRaw: any[];

    if (semesterParam) {
      distributionRaw = await prisma.$queryRaw`
        SELECT
          CASE
            WHEN nilai >= 90 THEN '90-100'
            WHEN nilai >= 80 THEN '80-89'
            WHEN nilai >= 70 THEN '70-79'
            WHEN nilai >= 60 THEN '60-69'
            ELSE '0-59'
          END as range_name,
          COUNT(*) as count
        FROM nilai_cpl
        WHERE semester = ${semesterParam}
        GROUP BY
          CASE
            WHEN nilai >= 90 THEN '90-100'
            WHEN nilai >= 80 THEN '80-89'
            WHEN nilai >= 70 THEN '70-79'
            WHEN nilai >= 60 THEN '60-69'
            ELSE '0-59'
          END
      `;
    } else {
      distributionRaw = await prisma.$queryRaw`
        SELECT
          CASE
            WHEN nilai >= 90 THEN '90-100'
            WHEN nilai >= 80 THEN '80-89'
            WHEN nilai >= 70 THEN '70-79'
            WHEN nilai >= 60 THEN '60-69'
            ELSE '0-59'
          END as range_name,
          COUNT(*) as count
        FROM nilai_cpl
        GROUP BY
          CASE
            WHEN nilai >= 90 THEN '90-100'
            WHEN nilai >= 80 THEN '80-89'
            WHEN nilai >= 70 THEN '70-79'
            WHEN nilai >= 60 THEN '60-69'
            ELSE '0-59'
          END
      `;
    }

    const ranges = [
      { name: "0-59", min: 0, max: 59, count: 0 },
      { name: "60-69", min: 60, max: 69, count: 0 },
      { name: "70-79", min: 70, max: 79, count: 0 },
      { name: "80-89", min: 80, max: 89, count: 0 },
      { name: "90-100", min: 90, max: 100, count: 0 },
    ];

    for (const row of distributionRaw) {
      const range = ranges.find(r => r.name === row.range_name);
      if (range) {
        range.count = Number(row.count);
      }
    }

    // 3. Radar Data (Top 8 CPL)
    const radarData = [...cplData]
      .sort((a, b) => b.nilai - a.nilai)
      .slice(0, 8)
      .map(item => ({
        subject: item.name,
        nilai: item.nilai,
        fullMark: 100
      }));

    res.json({
      cplData,
      distributionData: ranges,
      radarData
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Gagal memuat data analisis' });
  }
});

// GET /api/transkrip-cpl/:mahasiswaId - Get transkrip by mahasiswa
router.get('/:mahasiswaId', authMiddleware, requireProdiScope, async (req, res) => {
  try {
    const { mahasiswaId } = req.params;

    const { semester, tahunAjaran } = req.query;

    // Get mahasiswa info first to filter CPLs by Prodi
    const mahasiswa = await prisma.profile.findUnique({
      where: { userId: mahasiswaId },
      include: {
        prodi: true,
        angkatanRef: true
      }

    });

    if (!mahasiswa) {
      return res.status(404).json({ success: false, error: 'Mahasiswa tidak ditemukan' });
    }

    // Get CPLs filtered by Prodi (or general CPLs)
    const allCpls = await prisma.cpl.findMany({
      where: {
        isActive: true,
        OR: [
          { prodiId: mahasiswa.prodiId },
          { prodiId: null }
        ]
      },
      include: {
        kategoriRef: true
      },
      orderBy: { kodeCpl: 'asc' }
    });

    // Build where clause
    const where: any = { mahasiswaId };
    if (semester && semester !== 'all') {
      where.semester = Number(semester);
    }
    if (tahunAjaran && tahunAjaran !== 'all') {
      where.tahunAjaran = String(tahunAjaran);
    }

    // Get all NilaiCpl for this student
    const nilaiCplList = await prisma.nilaiCpl.findMany({
      where,
      include: {
        cpl: true,
        mataKuliah: true
      }
    });

    // Extract IDs for batch fetching weights
    const cplIds = [...new Set(nilaiCplList.map(n => n.cplId))];
    const mkIds = [...new Set(nilaiCplList.map(n => n.mataKuliahId))];

    // Batch fetch weights
    const weights = await prisma.cplMataKuliah.findMany({
      where: {
        cplId: { in: cplIds },
        mataKuliahId: { in: mkIds }
      }
    });

    // Create weight map
    const weightMap = new Map<string, number>();
    for (const w of weights) {
      weightMap.set(`${w.cplId}-${w.mataKuliahId}`, Number(w.bobotKontribusi));
    }

    // Group by CPL
    const cplMap = new Map<string, any[]>();
    for (const nilai of nilaiCplList) {
      if (!cplMap.has(nilai.cplId)) {
        cplMap.set(nilai.cplId, []);
      }
      cplMap.get(nilai.cplId)!.push(nilai);
    }

    const transkrip = [];

    for (const cpl of allCpls) {
      const nilaiList = cplMap.get(cpl.id) || [];

      // Filter: Hanya munculkan CPL yang sudah ada nilainya
      if (nilaiList.length === 0) continue;

      const minNilai = 70; // Default passing grade
      const calc = calculateCplScoreSync(nilaiList, cpl.id, weightMap, minNilai);

      const mataKuliahList = nilaiList.map(n => ({
        id: n.mataKuliah.id,
        kodeMk: n.mataKuliah.kodeMk,
        namaMk: n.mataKuliah.namaMk
      }));

      transkrip.push({
        cplId: cpl.id,
        cpl: {
          ...cpl,
          kategori: cpl.kategoriRef?.nama || cpl.kategori // Fallback to old string field if needed
        },
        mataKuliahList,
        ...calc
      });
    }

    // Calculate summary
    const totalCpl = transkrip.length;
    const tercapai = transkrip.filter(t => t.status === 'tercapai').length;
    const belumTercapai = transkrip.filter(t => t.status === 'belum_tercapai').length;
    const avgScore = transkrip.reduce((sum, t) => sum + Number(t.nilaiAkhir), 0) / totalCpl || 0;

    res.json({
      success: true,
      data: {
        mahasiswa,
        transkrip,
        summary: {
          totalCpl,
          totalCurriculumCpl: allCpls.length,
          tercapai,
          belumTercapai,
          proses: 0,
          avgScore: Number(avgScore.toFixed(2)),
          persentaseTercapai: totalCpl > 0 ? Number(((tercapai / totalCpl) * 100).toFixed(2)) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching mahasiswa transkrip:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/transkrip-cpl/calculate - Trigger calculation (Just returns data now)
router.post('/calculate', authMiddleware, requireRole('admin', 'dosen'), async (req, res) => {
  try {
    const { mahasiswaId } = req.body;
    // Redirect to GET logic
    res.redirect(307, `/api/transkrip-cpl/${mahasiswaId}`);
  } catch (error) {
    res.status(500).json({ error: 'Calculation error' });
  }
});

export default router;
