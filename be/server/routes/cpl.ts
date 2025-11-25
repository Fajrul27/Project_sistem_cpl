// ============================================
// CPL Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Helper function to calculate total bobot CPL
async function getTotalBobotCpl(): Promise<number> {
  const result = await prisma.cpl.aggregate({
    where: { isActive: true },
    _sum: { bobot: true }
  });
  return Number(result._sum.bobot || 0);
}

// Get all CPL
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cpl = await prisma.cpl.findMany({
      where: { isActive: true },
      include: {
        kategoriRef: true
      },
      orderBy: { kodeCpl: 'asc' }
    });

    const totalBobot = await getTotalBobotCpl();

    res.json({
      data: cpl,
      meta: {
        totalBobot: Number(totalBobot.toFixed(2)),
        isValid: Math.abs(totalBobot - 1.0) < 0.01,
        expectedTotal: 1.0
      }
    });
  } catch (error) {
    console.error('Get CPL error:', error);
    res.status(500).json({ error: 'Gagal mengambil data CPL' });
  }
});

// Get CPL by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const cpl = await prisma.cpl.findUnique({
      where: { id },
      include: {
        mataKuliah: {
          include: {
            mataKuliah: true
          }
        },
        kategoriRef: true
      }
    });

    if (!cpl) {
      return res.status(404).json({ error: 'CPL tidak ditemukan' });
    }

    res.json({ data: cpl });
  } catch (error) {
    console.error('Get CPL by ID error:', error);
    res.status(500).json({ error: 'Gagal mengambil data CPL' });
  }
});

// Get CPL Stats
router.get('/:id/stats', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch all grades for this CPL
    const nilaiList = await prisma.nilaiCpl.findMany({
      where: { cplId: id },
      include: {
        mataKuliah: true
      }
    });

    if (nilaiList.length === 0) {
      return res.json({
        avgNilai: 0,
        totalMahasiswa: 0,
        totalMK: 0,
        trend: 'stable',
        semesterData: [],
        distribution: [],
        mkData: []
      });
    }

    // Calculate stats
    const totalNilai = nilaiList.reduce((sum, item) => sum + Number(item.nilai), 0);
    const avgNilai = totalNilai / nilaiList.length;

    const uniqueMahasiswa = new Set(nilaiList.map(n => n.mahasiswaId));
    const uniqueMK = new Set(nilaiList.map(n => n.mataKuliahId));

    // Semester Data (Trend)
    const semesterMap = new Map();
    nilaiList.forEach(n => {
      const key = `${n.tahunAjaran} - Sem ${n.semester}`;
      if (!semesterMap.has(key)) {
        semesterMap.set(key, { sum: 0, count: 0, semester: key });
      }
      const entry = semesterMap.get(key);
      entry.sum += Number(n.nilai);
      entry.count += 1;
    });

    const semesterData = Array.from(semesterMap.values()).map((entry: any) => ({
      semester: entry.semester,
      nilai: Number((entry.sum / entry.count).toFixed(2))
    }));

    // Determine Trend
    let trend = 'stable';
    if (semesterData.length >= 2) {
      const last = semesterData[semesterData.length - 1].nilai;
      const prev = semesterData[semesterData.length - 2].nilai;
      if (last > prev) trend = 'up';
      else if (last < prev) trend = 'down';
    }

    // Distribution
    const ranges = [
      { range: '0-50', min: 0, max: 50, count: 0 },
      { range: '51-60', min: 51, max: 60, count: 0 },
      { range: '61-70', min: 61, max: 70, count: 0 },
      { range: '71-80', min: 71, max: 80, count: 0 },
      { range: '81-100', min: 81, max: 100, count: 0 },
    ];

    nilaiList.forEach(n => {
      const val = Number(n.nilai);
      const range = ranges.find(r => val >= r.min && val <= r.max);
      if (range) range.count++;
    });

    const distribution = ranges.map(r => ({ range: r.range, count: r.count }));

    // MK Data (Top 10)
    const mkMap = new Map();
    nilaiList.forEach(n => {
      const mkName = n.mataKuliah.namaMk;
      if (!mkMap.has(mkName)) {
        mkMap.set(mkName, { sum: 0, count: 0, name: mkName });
      }
      const entry = mkMap.get(mkName);
      entry.sum += Number(n.nilai);
      entry.count += 1;
    });

    const mkData = Array.from(mkMap.values())
      .map((entry: any) => ({
        name: entry.name,
        nilai: Number((entry.sum / entry.count).toFixed(2))
      }))
      .sort((a, b) => b.nilai - a.nilai)
      .slice(0, 10);

    res.json({
      avgNilai: Number(avgNilai.toFixed(2)),
      totalMahasiswa: uniqueMahasiswa.size,
      totalMK: uniqueMK.size,
      trend,
      semesterData,
      distribution,
      mkData
    });

  } catch (error) {
    console.error('Get CPL Stats error:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik CPL' });
  }
});

// Create CPL
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { kodeCpl, deskripsi, kategori, kategoriId, bobot } = req.body;

    const cpl = await prisma.cpl.create({
      data: {
        kodeCpl,
        deskripsi,
        kategori,
        bobot: parseFloat(bobot) || 1.0,
        createdBy: userId
      }
    });

    // Check total bobot after creation
    const newTotal = await getTotalBobotCpl();
    const warning = Math.abs(newTotal - 1.0) > 0.01
      ? `Peringatan: Total bobot CPL saat ini ${(newTotal * 100).toFixed(2)}%`
      : null;

    res.status(201).json({
      data: cpl,
      message: 'CPL berhasil dibuat',
      warning
    });
  } catch (error) {
    console.error('Create CPL error:', error);
    res.status(500).json({ error: 'Gagal membuat CPL' });
  }
});

// Update CPL
router.put('/:id', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const { kodeCpl, deskripsi, kategori, kategoriId, bobot } = req.body;

    // Check existence and ownership
    const existing = await prisma.cpl.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'CPL tidak ditemukan' });

    if (userRole === 'kaprodi' && existing.createdBy !== userId) {
      return res.status(403).json({ error: 'Anda hanya dapat mengubah CPL yang Anda buat' });
    }

    const cpl = await prisma.cpl.update({
      where: { id },
      data: {
        kodeCpl,
        deskripsi,
        kategori,
        bobot: parseFloat(bobot) || 1.0
      }
    });

    // Check total bobot after update
    const newTotal = await getTotalBobotCpl();
    const warning = Math.abs(newTotal - 1.0) > 0.01
      ? `Peringatan: Total bobot CPL saat ini ${(newTotal * 100).toFixed(2)}%`
      : null;

    res.json({
      data: cpl,
      message: 'CPL berhasil diupdate',
      warning
    });
  } catch (error) {
    console.error('Update CPL error:', error);
    res.status(500).json({ error: 'Gagal mengupdate CPL' });
  }
});

// Delete CPL
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    // Check existence and ownership
    const existing = await prisma.cpl.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'CPL tidak ditemukan' });

    if (userRole === 'kaprodi' && existing.createdBy !== userId) {
      return res.status(403).json({ error: 'Anda hanya dapat menghapus CPL yang Anda buat' });
    }

    await prisma.cpl.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'CPL berhasil dihapus' });
  } catch (error) {
    console.error('Delete CPL error:', error);
    res.status(500).json({ error: 'Gagal menghapus CPL' });
  }
});

export default router;
