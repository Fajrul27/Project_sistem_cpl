// ============================================
// Profile Routes
// ============================================

import { Router } from 'express';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Update profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const {
      namaLengkap,
      nim,
      nip,
      programStudi,
      semester,
      tahunMasuk,
      alamat,
      noTelepon
    } = req.body;

    // Check if profile belongs to current user or user is admin
    const profile = await prisma.profile.findUnique({
      where: { id },
      include: { user: { include: { role: true } } }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile tidak ditemukan' });
    }

    const currentUserRole = (req as any).userRole;
    if (profile.userId !== userId && currentUserRole !== 'admin') {
      return res.status(403).json({ error: 'Tidak memiliki akses untuk mengupdate profile ini' });
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: {
        namaLengkap,
        nim: nim || null,
        nip: nip || null,
        programStudi: programStudi || null,
        semester: semester ? parseInt(semester) : null,
        tahunMasuk: tahunMasuk ? parseInt(tahunMasuk) : null,
        alamat: alamat || null,
        noTelepon: noTelepon || null
      }
    });

    res.json({
      data: updatedProfile,
      message: 'Profile berhasil diperbarui'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Gagal memperbarui profile' });
  }
});

// Get profile by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile tidak ditemukan' });
    }

    res.json({ data: profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Gagal mengambil data profile' });
  }
});

export default router;
