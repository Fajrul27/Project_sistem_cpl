// ============================================
// Mata Kuliah Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getAccessibleMataKuliahIds } from '../lib/access-control.js';

const router = Router();

// Get all Mata Kuliah (filtered by access)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    const where: any = { isActive: true };

    // Filter based on role
    if (userRole === 'dosen') {
      const accessibleIds = await getAccessibleMataKuliahIds(userId, userRole);
      where.id = { in: accessibleIds };
    } else if (userRole === 'kaprodi') {
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (profile?.programStudi) {
        where.programStudi = profile.programStudi;
      }
    }

    const mataKuliah = await prisma.mataKuliah.findMany({
      where,
      orderBy: { kodeMk: 'asc' },
      include: {
        pengampu: {
          include: {
            dosen: {
              include: {
                user: {
                  select: {
                    email: true
                  }
                }
              }
            }
          }
        }
      }
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
    const userRole = (req as any).userRole;
    const { kodeMk, namaMk, sks, semester, programStudi } = req.body;

    let prodiToUse = programStudi;

    // If Kaprodi, force programStudi to be their own
    if (userRole === 'kaprodi') {
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (!profile?.programStudi) {
        return res.status(400).json({ error: 'Profil Kaprodi tidak memiliki Program Studi' });
      }
      prodiToUse = profile.programStudi;
    }

    const mataKuliah = await prisma.mataKuliah.create({
      data: {
        kodeMk,
        namaMk,
        sks: parseInt(sks),
        semester: parseInt(semester),
        programStudi: prodiToUse,
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
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;
    const { kodeMk, namaMk, sks, semester, programStudi } = req.body;

    // Check access
    const existing = await prisma.mataKuliah.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Mata Kuliah tidak ditemukan' });

    if (userRole === 'kaprodi') {
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (existing.programStudi !== profile?.programStudi) {
        return res.status(403).json({ error: 'Anda tidak memiliki akses untuk mengedit mata kuliah ini' });
      }
    }

    const mataKuliah = await prisma.mataKuliah.update({
      where: { id },
      data: {
        kodeMk,
        namaMk,
        sks: parseInt(sks),
        semester: parseInt(semester),
        programStudi: userRole === 'admin' ? programStudi : existing.programStudi // Kaprodi cannot change prodi
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
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    // Check access
    const existing = await prisma.mataKuliah.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Mata Kuliah tidak ditemukan' });

    if (userRole === 'kaprodi') {
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (existing.programStudi !== profile?.programStudi) {
        return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menghapus mata kuliah ini' });
      }
    }

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
