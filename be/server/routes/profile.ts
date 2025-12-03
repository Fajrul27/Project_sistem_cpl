// ============================================
// Profile Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Force TS re-check

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
      noTelepon,
      prodiId,
      fakultasId,
      semesterId,
      kelasId,
      angkatanId
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

    // Prepare update data
    const updateData: any = {
      namaLengkap,
      nim: nim || null,
      nip: nip || null,
      programStudi: programStudi || null,
      tahunMasuk: tahunMasuk ? parseInt(tahunMasuk) : null,
      alamat: alamat || null,
      noTelepon: noTelepon || null,
      prodiId: prodiId || null,
      fakultasId: fakultasId || null,
      semesterId: semesterId || null,
      kelasId: kelasId || null,
      angkatanId: angkatanId || null
    };

    // Handle semester logic
    if (semesterId) {
      const semesterRef = await prisma.semester.findUnique({
        where: { id: semesterId }
      });
      if (semesterRef) {
        updateData.semester = semesterRef.angka;
      }
    } else if (semester) {
      // Fallback: if only semester int is provided, try to find matching semesterId
      updateData.semester = parseInt(semester);
      const semesterRef = await prisma.semester.findUnique({
        where: { angka: parseInt(semester) }
      });
      if (semesterRef) {
        updateData.semesterId = semesterRef.id;
      }
    } else {
      updateData.semester = null;
      updateData.semesterId = null;
    }

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: updateData
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
        },
        semesterRef: true,
        kelasRef: true,
        angkatanRef: true
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
