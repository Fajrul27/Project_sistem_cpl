// ============================================
// Users Routes
// ============================================

import { Router } from 'express';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { role } = req.query;

    let where: any = {};
    if (role) {
      where = {
        role: {
          some: {
            role: role as string
          }
        }
      };
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        role: true,
        profile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Gagal mengambil data users' });
  }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        profile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({ data: user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Gagal mengambil data user' });
  }
});

export default router;
