// ============================================
// Mata Kuliah Pengampu Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all pengampu for a mata kuliah
router.get('/mata-kuliah/:mataKuliahId', authMiddleware, async (req, res) => {
    try {
        const { mataKuliahId } = req.params;

        const pengampu = await prisma.mataKuliahPengampu.findMany({
            where: { mataKuliahId },
            include: {
                dosen: {
                    select: {
                        userId: true,
                        namaLengkap: true,
                        nidn: true,
                        nip: true,
                        user: {
                            select: {
                                email: true
                            }
                        }
                    }
                },
                kelas: true
            }
        });

        res.json({ data: pengampu });
    } catch (error) {
        console.error('Error fetching pengampu:', error);
        res.status(500).json({ error: 'Failed to fetch pengampu' });
    }
});

// Get all mata kuliah for a dosen
router.get('/dosen/:dosenId', authMiddleware, async (req, res) => {
    try {
        const { dosenId } = req.params;

        const assignments = await prisma.mataKuliahPengampu.findMany({
            where: { dosenId },
            include: {
                mataKuliah: true
            }
        });

        res.json({ data: assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
});

// Assign dosen to mata kuliah
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { mataKuliahId, dosenId, kelasId, isPengampu } = req.body;

        // Check access for Kaprodi
        if (userRole === 'kaprodi') {
            const mataKuliah = await prisma.mataKuliah.findUnique({
                where: { id: mataKuliahId }
            });
            const profile = await prisma.profile.findUnique({ where: { userId } });

            if (!mataKuliah || mataKuliah.programStudi !== profile?.programStudi) {
                return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
            }
        }

        const assignment = await prisma.mataKuliahPengampu.create({
            data: {
                mataKuliahId,
                dosenId,
                kelasId,
                isPengampu: isPengampu ?? true
            }
        });

        res.status(201).json({
            data: assignment,
            message: 'Dosen berhasil ditambahkan ke mata kuliah'
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Dosen sudah terdaftar pada mata kuliah ini' });
        }
        console.error('Error assigning dosen:', error);
        res.status(500).json({ error: 'Failed to assign dosen' });
    }
});

// Remove dosen from mata kuliah
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        // Check access for Kaprodi
        if (userRole === 'kaprodi') {
            const assignment = await prisma.mataKuliahPengampu.findUnique({
                where: { id },
                include: { mataKuliah: true }
            });
            const profile = await prisma.profile.findUnique({ where: { userId } });

            if (!assignment || assignment.mataKuliah.programStudi !== profile?.programStudi) {
                return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menghapus pengampu ini' });
            }
        }

        await prisma.mataKuliahPengampu.delete({
            where: { id }
        });

        res.json({ message: 'Dosen berhasil dihapus dari mata kuliah' });
    } catch (error) {
        console.error('Error removing dosen:', error);
        res.status(500).json({ error: 'Failed to remove dosen' });
    }
});

// Get daftar peserta (mahasiswa) untuk mata kuliah yang diampu dosen
router.get('/peserta/:mataKuliahId', authMiddleware, requireRole('dosen'), async (req, res) => {
    try {
        const { mataKuliahId } = req.params;
        const userId = (req as any).userId;

        // Verifikasi bahwa dosen adalah pengampu mata kuliah ini
        const pengampuCheck = await prisma.mataKuliahPengampu.findFirst({
            where: { 
                mataKuliahId, 
                dosenId: userId,
                isPengampu: true 
            },
            include: {
                mataKuliah: true
            }
        });

        if (!pengampuCheck) {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }

        const mataKuliah = pengampuCheck.mataKuliah;

        // Ambil semua mahasiswa yang mengikuti mata kuliah ini
        // Berdasarkan program studi dan semester yang sesuai
        let mahasiswaList = [];

        if (mataKuliah.prodiId) {
            // Gunakan prodiId yang baru
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
                    userId: true,
                    namaLengkap: true,
                    nim: true,
                    programStudi: true,
                    prodiId: true,
                    kelasId: true,
                    user: {
                        select: {
                            email: true
                        }
                    },
                    kelasRef: {
                        select: {
                            nama: true
                        }
                    },
                    prodi: {
                        select: {
                            nama: true
                        }
                    }
                }
            });
        } else if (mataKuliah.programStudi) {
            // Fallback untuk programStudi yang lama
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
                    userId: true,
                    namaLengkap: true,
                    nim: true,
                    programStudi: true,
                    prodiId: true,
                    kelasId: true,
                    user: {
                        select: {
                            email: true
                        }
                    },
                    kelasRef: {
                        select: {
                            nama: true
                        }
                    },
                    prodi: {
                        select: {
                            nama: true
                        }
                    }
                }
            });
        }

        // Format data untuk response
        const peserta = mahasiswaList.map(mahasiswa => ({
            userId: mahasiswa.userId,
            namaLengkap: mahasiswa.namaLengkap,
            nim: mahasiswa.nim,
            email: mahasiswa.user?.email || 'Tidak ada email',
            kelas: mahasiswa.kelasRef?.nama || 'Tidak ada kelas',
            programStudi: mahasiswa.prodi?.nama || mahasiswa.programStudi || 'Tidak ada program studi'
        }));

        res.json({ 
            data: peserta,
            total: peserta.length
        });
    } catch (error) {
        console.error('Error fetching peserta:', error);
        res.status(500).json({ error: 'Failed to fetch peserta' });
    }
});

export default router;
