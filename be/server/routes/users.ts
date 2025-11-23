// ============================================
// Users Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all users (admin only)
router.get('/', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), async (req, res) => {
  try {
    const { role } = req.query;

    let where: any = {};
    if (role) {
      // Filter berdasarkan role user (admin/dosen/mahasiswa)
      where = {
        role: {
          role: role as string
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
router.get('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
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

// Update user role (admin only)
router.put('/:id/role', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role?: string };

    const allowedRoles = ['admin', 'dosen', 'mahasiswa', 'kaprodi'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Role tidak valid' });
    }

    // Pastikan user ada
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // Update atau buat user role
    await prisma.userRole.upsert({
      where: { userId: id },
      update: { role: role as any },
      create: { userId: id, role: role as any }
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        profile: true
      }
    });

    res.json({
      message: 'Role user berhasil diperbarui',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Gagal memperbarui role user' });
  }
});

// Update user basic info (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, fullName } = req.body as { email?: string; fullName?: string };

    if (!email && !fullName) {
      return res.status(400).json({ error: 'Tidak ada data untuk diperbarui' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { profile: true }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    const userData: any = {};
    if (email && email !== existingUser.email) {
      userData.email = email;
    }

    const profileUpdate: any = {};
    if (fullName !== undefined) {
      profileUpdate.namaLengkap = fullName;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...userData,
        ...(Object.keys(profileUpdate).length > 0 && {
          profile: existingUser.profile
            ? { update: profileUpdate }
            : { create: profileUpdate }
        })
      },
      include: {
        role: true,
        profile: true
      }
    });

    res.json({
      message: 'User berhasil diperbarui',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Gagal memperbarui user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Gagal menghapus user' });
  }
});

export default router;
