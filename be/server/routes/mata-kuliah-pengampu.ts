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
                }
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
        const { mataKuliahId, dosenId, isPengampu } = req.body;

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

export default router;
