// ============================================
// Nilai CPL Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole, requirePengampu } from '../middleware/auth.js';

const router = Router();

// Get all nilai CPL
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const { cplId } = req.query;

    // Build where clause
    const where: any = {};
    if (userRole === 'mahasiswa') {
      where.mahasiswaId = userId;
    }
    if (cplId) {
      where.cplId = cplId as string;
    }

    const nilaiCpl = await prisma.nilaiCpl.findMany({
      where,
      include: {
        cpl: true,
        mataKuliah: true,
        mahasiswa: {
          include: {
            user: true
          }
        },
        creator: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: nilaiCpl });
  } catch (error) {
    console.error('Get nilai CPL error:', error);
    res.status(500).json({ error: 'Gagal mengambil data nilai CPL' });
  }
});

// Get nilai CPL by user ID
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const nilaiCpl = await prisma.nilaiCpl.findMany({
      where: { mahasiswaId: userId },
      include: {
        cpl: true,
        mataKuliah: true,
        mahasiswa: true
      },
      orderBy: { semester: 'asc' }
    });

    res.json({ data: nilaiCpl });
  } catch (error) {
    console.error('Get nilai CPL by user error:', error);
    res.status(500).json({ error: 'Gagal mengambil data nilai CPL' });
  }
});

// Create nilai CPL
router.post('/', authMiddleware, requireRole('dosen'), requirePengampu('mataKuliahId'), async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { mahasiswaId, cplId, mataKuliahId, nilai, semester, tahunAjaran } = req.body;

    const nilaiCpl = await prisma.nilaiCpl.create({
      data: {
        mahasiswaId,
        cplId,
        mataKuliahId,
        nilai: parseFloat(nilai),
        semester: parseInt(semester),
        tahunAjaran: tahunAjaran || new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
        createdBy: userId
      },
      include: {
        cpl: true,
        mataKuliah: true,
        mahasiswa: {
          include: {
            user: true
          }
        },
        creator: true
      }
    });

    res.status(201).json({ data: nilaiCpl, message: 'Nilai CPL berhasil ditambahkan' });
  } catch (error) {
    console.error('Create nilai CPL error:', error);
    res.status(500).json({ error: 'Gagal menambahkan nilai CPL' });
  }
});

export default router;
