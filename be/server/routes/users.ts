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
    const { role, page = 1, limit = 10, q } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};

    // Filter by role
    if (role) {
      where.role = {
        role: role as string
      };
    }

    // [SECURITY] Kaprodi only sees users in their prodi
    const userId = (req as any).userId;
    const userRole = (req as any).userRole;

    if (userRole === 'kaprodi') {
      const profile = await prisma.profile.findUnique({ where: { userId } });
      if (profile?.prodiId) {
        // Ensure we filter by prodiId in the profile relation
        if (!where.profile) where.profile = {};
        where.profile.prodiId = profile.prodiId;
      }
    }

    // [SECURITY] Dosen only sees mahasiswa in specific mata kuliah (if mataKuliahId is provided)
    if (userRole === 'dosen') {
      const mataKuliahId = req.query.mataKuliahId as string;

      if (mataKuliahId) {
        // Verify dosen teaches this specific mata kuliah
        const isPengampu = await prisma.mataKuliahPengampu.findFirst({
          where: {
            mataKuliahId,
            dosenId: userId,
            isPengampu: true
          }
        });

        if (!isPengampu) {
          return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }

        // Get mata kuliah info to filter mahasiswa by program studi and semester
        const mataKuliah = await prisma.mataKuliah.findUnique({
          where: { id: mataKuliahId }
        });

        if (!mataKuliah) {
          return res.status(404).json({ error: 'Mata kuliah tidak ditemukan' });
        }

        // Get mahasiswa based on program studi and semester
        let mahasiswaList: { userId: string }[] = [];

        if (mataKuliah.prodiId) {
          // Use new prodiId field
          mahasiswaList = await prisma.profile.findMany({
            where: {
              prodiId: mataKuliah.prodiId,
              semester: mataKuliah.semester,
              user: {
                role: {
                  role: 'mahasiswa'
                }
              }
            },
            select: {
              userId: true
            }
          });
        } else if (mataKuliah.programStudi) {
          // Fallback for old programStudi field
          mahasiswaList = await prisma.profile.findMany({
            where: {
              programStudi: mataKuliah.programStudi,
              semester: mataKuliah.semester,
              user: {
                role: {
                  role: 'mahasiswa'
                }
              }
            },
            select: {
              userId: true
            }
          });
        }

        const mahasiswaIds = mahasiswaList.map(m => m.userId);
        where.id = { in: mahasiswaIds };
      } else {
        // If no mataKuliahId provided, get all mahasiswa from all mata kuliah taught by this dosen
        const mataKuliahPengampuList = await prisma.mataKuliahPengampu.findMany({
          where: {
            dosenId: userId,
            isPengampu: true
          },
          include: {
            mataKuliah: true
          }
        });

        // Collect all unique program studi and semester combinations
        const uniqueFilters = new Set<string>();

        for (const mkPengampu of mataKuliahPengampuList) {
          const mk = mkPengampu.mataKuliah;
          if (mk.prodiId) {
            uniqueFilters.add(`prodiId:${mk.prodiId}:semester:${mk.semester}`);
          } else if (mk.programStudi) {
            uniqueFilters.add(`programStudi:${mk.programStudi}:semester:${mk.semester}`);
          }
        }

        // Get mahasiswa from all these combinations
        let allMahasiswaList: { userId: string }[] = [];

        for (const filter of uniqueFilters) {
          const parts = filter.split(':');
          if (parts[0] === 'prodiId') {
            const prodiId = parts[1];
            const semester = parseInt(parts[3]);

            const mahasiswaList = await prisma.profile.findMany({
              where: {
                prodiId: prodiId,
                semester: semester,
                user: {
                  role: {
                    role: 'mahasiswa'
                  }
                }
              },
              select: {
                userId: true
              }
            });

            allMahasiswaList.push(...mahasiswaList);
          } else if (parts[0] === 'programStudi') {
            const programStudi = parts[1];
            const semester = parseInt(parts[3]);

            const mahasiswaList = await prisma.profile.findMany({
              where: {
                programStudi: programStudi,
                semester: semester,
                user: {
                  role: {
                    role: 'mahasiswa'
                  }
                }
              },
              select: {
                userId: true
              }
            });

            allMahasiswaList.push(...mahasiswaList);
          }
        }

        // Remove duplicates
        const uniqueMahasiswaIds = [...new Set(allMahasiswaList.map(m => m.userId))];
        where.id = { in: uniqueMahasiswaIds };
      }
    }

    // Search filter (email, name, nim)
    if (q) {
      const search = q as string;
      where.OR = [
        { email: { contains: search } }, // Search by email
        {
          profile: {
            OR: [
              { namaLengkap: { contains: search } }, // Search by name
              { nim: { contains: search } }          // Search by NIM
            ]
          }
        }
      ];
    }

    // Filter by kelasId
    if (req.query.kelasId) {
      const kelasId = req.query.kelasId as string;
      if (!where.profile) where.profile = {};
      where.profile.kelasId = kelasId;
    }

    // Filter by fakultasId
    if (req.query.fakultasId) {
      const fakultasId = req.query.fakultasId as string;
      if (!where.profile) where.profile = {};

      // Filter by prodi's fakultas
      where.profile.prodi = {
        fakultasId: fakultasId
      };
    }

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Sorting
    const { sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    let orderBy: any = {};

    if (sortBy === 'nim') {
      orderBy = {
        profile: {
          nim: sortOrder as string
        }
      };
    } else if (sortBy === 'nama') {
      orderBy = {
        profile: {
          namaLengkap: sortOrder as string
        }
      };
    } else {
      orderBy = {
        [sortBy as string]: sortOrder as string
      };
    }

    // Get paginated data
    const users = await prisma.user.findMany({
      where,
      include: {
        role: true,
        profile: {
          include: {
            prodi: {
              include: {
                fakultas: true
              }
            },
            kelasRef: true,
            angkatanRef: true
          }
        }
      },
      orderBy,
      skip: limitNum === -1 ? undefined : skip, // -1 for all
      take: limitNum === -1 ? undefined : limitNum
    });

    res.json({
      data: users,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: limitNum === -1 ? 1 : Math.ceil(total / limitNum)
      }
    });
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
