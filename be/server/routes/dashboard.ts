// ============================================
// Dashboard Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole, getUserProfile } from '../middleware/auth.js';

const router = Router();

// Get dashboard statistics
router.get('/stats', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    // Define filters
    let userFilter: any = {};
    let cplFilter: any = { isActive: true };
    let mkFilter: any = { isActive: true };
    let nilaiFilter: any = {};
    let prodiId: string | null = null;

    // Apply filters for Dosen and Kaprodi
    let customUserCount: number | null = null;

    if (userRole === 'kaprodi') {
      const profile = await getUserProfile(userId);
      if (profile && profile.prodiId) {
        prodiId = profile.prodiId;

        // Filter users (mahasiswa) by prodi
        userFilter = {
          role: {
            role: 'mahasiswa'
          },
          profile: { prodiId }
        };

        // Filter CPL by prodi
        cplFilter = {
          ...cplFilter,
          prodiId
        };

        // Filter Mata Kuliah by prodi
        mkFilter = {
          ...mkFilter,
          prodiId
        };

        // Filter Nilai by mahasiswa's prodi
        nilaiFilter = {
          mahasiswa: {
            prodiId
          }
        };
      }
    } else if (userRole === 'dosen') {
      // Dosen specific logic: Show only assigned MKs and students in those MKs (Logic aligned with Mahasiswa Page / users.ts)
      const pengampuRecords = await prisma.mataKuliahPengampu.findMany({
        where: {
          dosenId: userId,
          // isPengampu: true // Optional: enforce isPengampu if needed, users.ts does it.
        },
        include: {
          mataKuliah: true
        }
      });

      const myMkIds = [...new Set(pengampuRecords.map(p => p.mataKuliahId))];

      // Filter Mata Kuliah: Only assigned MKs
      mkFilter = {
        ...mkFilter,
        id: { in: myMkIds }
      };

      // Filter Nilai: Only for assigned MKs
      nilaiFilter = {
        mataKuliahId: { in: myMkIds }
      };

      // Calculate User Count based on Prodi + Semester of assigned MKs
      // This matches the logic in users.ts which shows all students in the semesters taught by the dosen
      const uniqueFilters = new Set<string>();
      const orConditions: any[] = [];

      for (const record of pengampuRecords) {
        const mk = record.mataKuliah;
        if (mk.prodiId) {
          const key = `prodiId:${mk.prodiId}:semester:${mk.semester}`;
          if (!uniqueFilters.has(key)) {
            uniqueFilters.add(key);
            orConditions.push({
              prodiId: mk.prodiId,
              semester: mk.semester
            });
          }
        } else if (mk.programStudi) {
          const key = `programStudi:${mk.programStudi}:semester:${mk.semester}`;
          if (!uniqueFilters.has(key)) {
            uniqueFilters.add(key);
            orConditions.push({
              programStudi: mk.programStudi,
              semester: mk.semester
            });
          }
        }
      }

      if (orConditions.length > 0) {
        customUserCount = await prisma.profile.count({
          where: {
            user: { role: { role: 'mahasiswa' } },
            OR: orConditions
          }
        });
      } else {
        customUserCount = 0;
      }

      // For CPL, we can still filter by Prodi if we can get it from the user profile
      const profile = await getUserProfile(userId);
      if (profile && profile.prodiId) {
        prodiId = profile.prodiId;
        cplFilter = { ...cplFilter, prodiId };

        // Also update distribution query to use prodiId if available
      }
    }

    // 1. Basic Counts
    // 1. Basic Counts
    const [dbUserCount, cplCount, mataKuliahCount, nilaiCount] = await Promise.all([
      prisma.user.count({ where: userFilter }),
      prisma.cpl.count({ where: cplFilter }),
      prisma.mataKuliah.count({ where: mkFilter }),
      prisma.nilaiCpl.count({ where: nilaiFilter })
    ]);

    const userCount = customUserCount !== null ? customUserCount : dbUserCount;

    // 2. CPL Average & Performance (Bar Chart & Top 5)
    // Group by CPL and calculate average
    const cplAggregations = await prisma.nilaiCpl.groupBy({
      by: ['cplId'],
      where: nilaiFilter,
      _avg: {
        nilai: true
      },
      _count: {
        nilai: true
      }
    });

    // Fetch CPL details for mapping
    const cpls = await prisma.cpl.findMany({
      where: { id: { in: cplAggregations.map(a => a.cplId) } },
      select: { id: true, kodeCpl: true }
    });

    const cplMap = new Map(cpls.map(c => [c.id, c.kodeCpl]));

    const chartData = cplAggregations.map(item => ({
      name: cplMap.get(item.cplId) || "Unknown",
      nilai: parseFloat((item._avg.nilai || 0).toFixed(2))
    }));

    // Calculate Global Average
    let avgScore = 0;
    if (chartData.length > 0) {
      const sum = chartData.reduce((acc, curr) => acc + curr.nilai, 0);
      avgScore = parseFloat((sum / chartData.length).toFixed(2));
    }

    // Top 5 Performance
    const performanceData = [...chartData]
      .sort((a, b) => b.nilai - a.nilai)
      .slice(0, 5)
      .map(item => ({
        ...item,
        status: item.nilai >= 80 ? "Excellent" : item.nilai >= 70 ? "Good" : "Need Improvement"
      }));

    // 3. Semester Trend (Line Chart)
    const semesterAggregations = await prisma.nilaiCpl.groupBy({
      by: ['semester'],
      where: nilaiFilter,
      _avg: {
        nilai: true
      }
    });

    const trendData = semesterAggregations
      .map(item => ({
        semester: `Sem ${item.semester} `,
        nilai: parseFloat((item._avg.nilai || 0).toFixed(2))
      }))
      .sort((a, b) => a.semester.localeCompare(b.semester));

    // 4. Distribution (Pie Chart)
    // Construct raw query with optional filtering
    let distributionCounts;

    if (prodiId) {
      // Filtered query for specific prodi
      distributionCounts = await prisma.$queryRaw`
        SELECT
          SUM(CASE WHEN nc.nilai >= 85 THEN 1 ELSE 0 END) as excellent,
          SUM(CASE WHEN nc.nilai >= 70 AND nc.nilai < 85 THEN 1 ELSE 0 END) as good,
          SUM(CASE WHEN nc.nilai >= 60 AND nc.nilai < 70 THEN 1 ELSE 0 END) as fair,
          SUM(CASE WHEN nc.nilai < 60 THEN 1 ELSE 0 END) as poor,
          COUNT(*) as total
        FROM nilai_cpl nc
        JOIN profiles p ON nc.mahasiswa_id = p.user_id
        WHERE p.prodi_id = ${prodiId}
      `;
    } else {
      // Global query
      distributionCounts = await prisma.$queryRaw`
        SELECT
          SUM(CASE WHEN nilai >= 85 THEN 1 ELSE 0 END) as excellent,
          SUM(CASE WHEN nilai >= 70 AND nilai < 85 THEN 1 ELSE 0 END) as good,
          SUM(CASE WHEN nilai >= 60 AND nilai < 70 THEN 1 ELSE 0 END) as fair,
          SUM(CASE WHEN nilai < 60 THEN 1 ELSE 0 END) as poor,
          COUNT(*) as total
        FROM nilai_cpl
      `;
    }

    // Helper to safely convert BigInt to Number
    const toNumber = (val: any) => {
      if (typeof val === 'bigint') return Number(val);
      return Number(val || 0);
    };

    const distResult: any = Array.isArray(distributionCounts) ? distributionCounts[0] : distributionCounts;
    const total = toNumber(distResult.total);

    const distributionData = [
      {
        name: "Sangat Baik (85-100)",
        value: toNumber(distResult.excellent),
        percentage: total > 0 ? ((toNumber(distResult.excellent) / total) * 100).toFixed(1) : "0.0"
      },
      {
        name: "Baik (70-84)",
        value: toNumber(distResult.good),
        percentage: total > 0 ? ((toNumber(distResult.good) / total) * 100).toFixed(1) : "0.0"
      },
      {
        name: "Cukup (60-69)",
        value: toNumber(distResult.fair),
        percentage: total > 0 ? ((toNumber(distResult.fair) / total) * 100).toFixed(1) : "0.0"
      },
      {
        name: "Kurang (<60)",
        value: toNumber(distResult.poor),
        percentage: total > 0 ? ((toNumber(distResult.poor) / total) * 100).toFixed(1) : "0.0"
      }
    ];

    res.json({
      data: {
        stats: {
          users: userCount,
          cpl: cplCount,
          mataKuliah: mataKuliahCount,
          nilai: nilaiCount,
          avgScore
        },
        chartData,
        trendData,
        distributionData,
        performanceData
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik' });
  }
});

export default router;
