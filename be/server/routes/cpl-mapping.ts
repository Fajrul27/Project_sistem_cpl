// ============================================
// CPL - Mata Kuliah Mapping Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Helper function to calculate total bobot kontribusi per MK
async function getTotalBobotKontribusiMK(mataKuliahId: string): Promise<number> {
  const result = await prisma.cplMataKuliah.aggregate({
    where: { mataKuliahId },
    _sum: { bobotKontribusi: true }
  });
  return Number(result._sum.bobotKontribusi || 0);
}

// Get all mappings
router.get('/', authMiddleware, async (req, res) => {
  try {
    const mappings = await prisma.cplMataKuliah.findMany({
      include: {
        cpl: true,
        mataKuliah: true
      },
      orderBy: { mataKuliah: { semester: 'asc' } }
    });

    res.json({ data: mappings });
  } catch (error) {
    console.error('Get mappings error:', error);
    res.status(500).json({ error: 'Gagal mengambil data mapping' });
  }
});

// Get mappings by Mata Kuliah
router.get('/mata-kuliah/:mkId', authMiddleware, async (req, res) => {
  try {
    const { mkId } = req.params;

    const mappings = await prisma.cplMataKuliah.findMany({
      where: { mataKuliahId: mkId },
      include: {
        cpl: true,
        mataKuliah: true
      }
    });

    const totalBobot = await getTotalBobotKontribusiMK(mkId);

    res.json({
      data: mappings,
      meta: {
        totalBobotKontribusi: Number(totalBobot.toFixed(2)),
        isValid: Math.abs(totalBobot - 1.0) < 0.01,
        expectedTotal: 1.0
      }
    });
  } catch (error) {
    console.error('Get mappings by MK error:', error);
    res.status(500).json({ error: 'Gagal mengambil data mapping' });
  }
});

// Create mapping
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const { cplId, mataKuliahId, bobotKontribusi } = req.body;

    // Check if mapping already exists
    const existing = await prisma.cplMataKuliah.findFirst({
      where: { cplId, mataKuliahId }
    });

    if (existing) {
      return res.status(400).json({ error: 'Mapping sudah ada' });
    }

    const mapping = await prisma.cplMataKuliah.create({
      data: {
        cplId,
        mataKuliahId,
        bobotKontribusi: parseFloat(bobotKontribusi) || 1.0
      },
      include: {
        cpl: true,
        mataKuliah: true
      }
    });

    // STRICT: Check total after creation
    const newTotal = await getTotalBobotKontribusiMK(mataKuliahId);
    if (Math.abs(newTotal - 1.0) > 0.01) {
      // Rollback if total is invalid
      await prisma.cplMataKuliah.delete({ where: { id: mapping.id } });
      return res.status(400).json({
        error: 'Total bobot kontribusi harus = 100%',
        currentTotal: Number((newTotal * 100).toFixed(2)),
        message: `Total akan menjadi ${(newTotal * 100).toFixed(2)}%. Silakan sesuaikan bobot.`
      });
    }

    res.status(201).json({ data: mapping, message: 'Mapping berhasil dibuat' });
  } catch (error) {
    console.error('Create mapping error:', error);
    res.status(500).json({ error: 'Gagal membuat mapping' });
  }
});

// Update mapping
router.put('/:id', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const { id } = req.params;
    const { bobotKontribusi } = req.body;

    const existing = await prisma.cplMataKuliah.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Mapping tidak ditemukan' });

    const mapping = await prisma.cplMataKuliah.update({
      where: { id },
      data: {
        bobotKontribusi: parseFloat(bobotKontribusi) || 1.0
      },
      include: {
        cpl: true,
        mataKuliah: true
      }
    });

    // STRICT: Check total after update
    const newTotal = await getTotalBobotKontribusiMK(existing.mataKuliahId);
    if (Math.abs(newTotal - 1.0) > 0.01) {
      // Rollback if total is invalid
      await prisma.cplMataKuliah.update({
        where: { id },
        data: { bobotKontribusi: existing.bobotKontribusi }
      });
      return res.status(400).json({
        error: 'Total bobot kontribusi harus = 100%',
        currentTotal: Number((newTotal * 100).toFixed(2)),
        message: `Total akan menjadi ${(newTotal * 100).toFixed(2)}%. Silakan sesuaikan bobot.`
      });
    }

    res.json({ data: mapping, message: 'Mapping berhasil diupdate' });
  } catch (error) {
    console.error('Update mapping error:', error);
    res.status(500).json({ error: 'Gagal mengupdate mapping' });
  }
});

// Batch create mappings
router.post('/batch', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const { mappings: mappingData } = req.body;

    if (!Array.isArray(mappingData)) {
      return res.status(400).json({ error: 'mappings harus berupa array' });
    }

    // Group by mataKuliahId to validate each
    const groupedByMK = mappingData.reduce((acc: any, m: any) => {
      if (!acc[m.mataKuliahId]) acc[m.mataKuliahId] = [];
      acc[m.mataKuliahId].push(m);
      return acc;
    }, {});

    // Validate each mata kuliah's total = 100%
    for (const [mkId, mappings] of Object.entries(groupedByMK)) {
      const total = (mappings as any[]).reduce((sum, m) =>
        sum + (parseFloat(m.bobotKontribusi) || 1.0), 0
      );

      if (Math.abs(total - 1.0) > 0.01) {
        return res.status(400).json({
          error: 'Total bobot kontribusi harus = 100%',
          mataKuliahId: mkId,
          currentTotal: Number((total * 100).toFixed(2)),
          message: `Mata kuliah ini memiliki total ${(total * 100).toFixed(2)}%. Silakan sesuaikan bobot.`
        });
      }
    }

    const created = await prisma.cplMataKuliah.createMany({
      data: mappingData.map((m: any) => ({
        cplId: m.cplId,
        mataKuliahId: m.mataKuliahId,
        bobotKontribusi: parseFloat(m.bobotKontribusi) || 1.0
      })),
      skipDuplicates: true
    });

    res.status(201).json({
      data: created,
      message: `${created.count} mapping berhasil dibuat`
    });
  } catch (error) {
    console.error('Batch create mappings error:', error);
    res.status(500).json({ error: 'Gagal membuat batch mapping' });
  }
});

// DELETE harus setelah POST /batch (karena /batch bukan parameter)
// Delete mapping
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.cplMataKuliah.delete({
      where: { id }
    });

    res.json({ message: 'Mapping berhasil dihapus' });
  } catch (error) {
    console.error('Delete mapping error:', error);
    res.status(500).json({ error: 'Gagal menghapus mapping' });
  }
});

export default router;
