// ============================================
// Nilai CPL Routes
// ============================================

import { Router } from 'express';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all nilai CPL
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    // If mahasiswa, only show their own nilai
    const where = userRole === 'mahasiswa' ? { mahasiswaId: userId } : {};

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
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { cplId, mataKuliahId, nilai, semester, tahunAjaran } = req.body;

    const nilaiCpl = await prisma.nilaiCpl.create({
      data: {
        mahasiswaId: userId,
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
