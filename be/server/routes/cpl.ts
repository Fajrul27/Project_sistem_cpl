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
    const cpl = await prisma.cpl.findMany({
      where: { isActive: true },
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

    res.status(201).json({ data: cpl, message: 'CPL berhasil dibuat' });
  } catch (error) {
    console.error('Create CPL error:', error);
    res.status(500).json({ error: 'Gagal membuat CPL' });
  }
});

// Update CPL
router.put('/:id', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const { id } = req.params;
    const { kodeCpl, deskripsi, kategori, bobot } = req.body;

    const cpl = await prisma.cpl.update({
      where: { id },
      data: {
        kodeCpl,
        deskripsi,
        kategori,
        bobot: parseFloat(bobot) || 1.0
      }
    });

    res.json({ data: cpl, message: 'CPL berhasil diupdate' });
  } catch (error) {
    console.error('Update CPL error:', error);
    res.status(500).json({ error: 'Gagal mengupdate CPL' });
  }
});

// Delete CPL
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const { id } = req.params;

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
