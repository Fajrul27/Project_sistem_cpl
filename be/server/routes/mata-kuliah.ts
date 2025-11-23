// ============================================
// Mata Kuliah Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all Mata Kuliah
router.get('/', authMiddleware, async (req, res) => {
  try {
    const mataKuliah = await prisma.mataKuliah.findMany({
      where: { isActive: true },
      orderBy: { kodeMk: 'asc' }
    });

    res.json({ data: mataKuliah });
  } catch (error) {
    console.error('Get Mata Kuliah error:', error);
    res.status(500).json({ error: 'Gagal mengambil data Mata Kuliah' });
  }
});

// Create Mata Kuliah
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { kodeMk, namaMk, sks, semester } = req.body;

    const mataKuliah = await prisma.mataKuliah.create({
      data: {
        kodeMk,
        namaMk,
        sks: parseInt(sks),
        semester: parseInt(semester),
        createdBy: userId,
      },
    });

    res.status(201).json({ data: mataKuliah, message: 'Mata Kuliah berhasil dibuat' });
  } catch (error) {
    console.error('Create Mata Kuliah error:', error);
    res.status(500).json({ error: 'Gagal membuat Mata Kuliah' });
  }
});

// Update Mata Kuliah
router.put('/:id', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const { id } = req.params;
    const { kodeMk, namaMk, sks, semester } = req.body;

    const mataKuliah = await prisma.mataKuliah.update({
      where: { id },
      data: {
        kodeMk,
        namaMk,
        sks: parseInt(sks),
        semester: parseInt(semester),
      },
    });

    res.json({ data: mataKuliah, message: 'Mata Kuliah berhasil diupdate' });
  } catch (error) {
    console.error('Update Mata Kuliah error:', error);
    res.status(500).json({ error: 'Gagal mengupdate Mata Kuliah' });
  }
});

// Delete Mata Kuliah (soft delete)
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.mataKuliah.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({ message: 'Mata Kuliah berhasil dihapus' });
  } catch (error) {
    console.error('Delete Mata Kuliah error:', error);
    res.status(500).json({ error: 'Gagal menghapus Mata Kuliah' });
  }
});

export default router;
