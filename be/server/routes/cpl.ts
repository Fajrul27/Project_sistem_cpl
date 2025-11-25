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
        }
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

// Create CPL
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { kodeCpl, deskripsi, kategori, bobot } = req.body;

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
    const { kodeCpl, deskripsi, kategori, bobot } = req.body;

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
