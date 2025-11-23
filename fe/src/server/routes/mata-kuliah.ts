// ============================================
// Mata Kuliah Routes
// ============================================

import { Router } from 'express';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '../middleware/auth';

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

export default router;
