// ============================================
// Dashboard Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Get dashboard statistics
router.get('/stats', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), async (req, res) => {
  try {
    // 1. Basic Counts
    const [userCount, cplCount, mataKuliahCount, nilaiCount] = await Promise.all([
      prisma.user.count(),
      prisma.cpl.count({ where: { isActive: true } }),
      prisma.mataKuliah.count({ where: { isActive: true } }),
      prisma.nilaiCpl.count()
    ]);

    // 2. CPL Average & Performance (Bar Chart & Top 5)
    // Group by CPL and calculate average
    const cplAggregations = await prisma.nilaiCpl.groupBy({
      by: ['cplId'],
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

    // 4. Distribution (Pie Chart) - Using Raw Query for efficiency with ranges
    // Ranges: Excellent (85-100), Good (70-84), Fair (60-69), Poor (<60)
    const distributionCounts = await prisma.$queryRaw`
      SELECT
        SUM(CASE WHEN nilai >= 85 THEN 1 ELSE 0 END) as excellent,
        SUM(CASE WHEN nilai >= 70 AND nilai < 85 THEN 1 ELSE 0 END) as good,
        SUM(CASE WHEN nilai >= 60 AND nilai < 70 THEN 1 ELSE 0 END) as fair,
        SUM(CASE WHEN nilai < 60 THEN 1 ELSE 0 END) as poor,
        COUNT(*) as total
      FROM nilai_cpl
    `;

    const distResult: any = Array.isArray(distributionCounts) ? distributionCounts[0] : distributionCounts;
    const total = Number(distResult.total || 0);

    const distributionData = [
      {
        name: "Sangat Baik (85-100)",
        value: Number(distResult.excellent || 0),
        percentage: total > 0 ? ((Number(distResult.excellent || 0) / total) * 100).toFixed(1) : "0.0"
      },
      {
        name: "Baik (70-84)",
        value: Number(distResult.good || 0),
        percentage: total > 0 ? ((Number(distResult.good || 0) / total) * 100).toFixed(1) : "0.0"
      },
      {
        name: "Cukup (60-69)",
        value: Number(distResult.fair || 0),
        percentage: total > 0 ? ((Number(distResult.fair || 0) / total) * 100).toFixed(1) : "0.0"
      },
      {
        name: "Kurang (<60)",
        value: Number(distResult.poor || 0),
        percentage: total > 0 ? ((Number(distResult.poor || 0) / total) * 100).toFixed(1) : "0.0"
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
