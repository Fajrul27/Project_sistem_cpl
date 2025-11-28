// ============================================
// CPL Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();



// Get all CPL
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const { prodiId } = req.query;

    const where: any = { isActive: true };

    // Kaprodi hanya bisa lihat CPL dari prodinya
    if (userRole === 'kaprodi') {
      const profile = await prisma.profile.findUnique({
        where: { userId }
      });

      if (profile?.prodiId) {
        where.prodiId = profile.prodiId;
      } else {
        // Jika kaprodi tidak punya prodiId, kembalikan array kosong
        return res.json({ data: [] });
      }
    }

    // Filter by prodi jika ada query parameter (admin only)
    if (prodiId && userRole === 'admin') {
      where.prodiId = prodiId as string;
    }

    const cpl = await prisma.cpl.findMany({
      where,
      include: {
        kategoriRef: true,
        prodi: true
      },
      orderBy: { kodeCpl: 'asc' }
    });

    res.json({ data: cpl });
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
        kategoriRef: true,
        prodi: true
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
    const userRole = (req as any).userRole;
    const { kodeCpl, deskripsi, kategori, kategoriId, prodiId } = req.body;

    let finalProdiId = prodiId;

    // Jika kaprodi, paksa menggunakan prodiId mereka
    if (userRole === 'kaprodi') {
      const profile = await prisma.profile.findUnique({
        where: { userId }
      });

      if (!profile?.prodiId) {
        return res.status(403).json({
          error: 'Profile Anda belum memiliki Program Studi. Hubungi admin.'
        });
      }

      finalProdiId = profile.prodiId;
    }

    const cpl = await prisma.cpl.create({
      data: {
        kodeCpl,
        deskripsi,
        kategori,
        kategoriId,
        prodiId: finalProdiId,
        createdBy: userId
      },
      include: {
        kategoriRef: true,
        prodi: true
      }
    });

    res.status(201).json({
      data: cpl,
      message: 'CPL berhasil dibuat'
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
    const { kodeCpl, deskripsi, kategori, kategoriId, prodiId } = req.body;

    // Check existence
    const existing = await prisma.cpl.findUnique({
      where: { id },
      include: { prodi: true }
    });
    if (!existing) return res.status(404).json({ error: 'CPL tidak ditemukan' });

    // Validasi akses kaprodi
    if (userRole === 'kaprodi') {
      const profile = await prisma.profile.findUnique({
        where: { userId }
      });

      // Cek ownership atau prodi match
      if (existing.createdBy !== userId && existing.prodiId !== profile?.prodiId) {
        return res.status(403).json({
          error: 'Anda hanya dapat mengubah CPL dari program studi Anda'
        });
      }
    }

    const updateData: any = {
      kodeCpl,
      deskripsi,
      kategori,
      kategoriId
    };

    // Admin bisa update prodiId, kaprodi tidak
    if (userRole === 'admin') {
      updateData.prodiId = prodiId;
    }

    const cpl = await prisma.cpl.update({
      where: { id },
      data: updateData,
      include: {
        kategoriRef: true,
        prodi: true
      }
    });

    res.json({
      data: cpl,
      message: 'CPL berhasil diupdate'
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

    // Check existence
    const existing = await prisma.cpl.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'CPL tidak ditemukan' });

    if (userRole === 'kaprodi') {
      const profile = await prisma.profile.findUnique({
        where: { userId }
      });

      if (existing.createdBy !== userId && existing.prodiId !== profile?.prodiId) {
        return res.status(403).json({
          error: 'Anda hanya dapat menghapus CPL dari program studi Anda'
        });
      }
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
