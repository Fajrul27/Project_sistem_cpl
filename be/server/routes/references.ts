// ============================================
// Reference Routes (Semester, Kelas)
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all Semesters
router.get('/semester', authMiddleware, async (req, res) => {
    try {
        const semesters = await prisma.semester.findMany({
            where: { isActive: true },
            orderBy: { angka: 'asc' }
        });
        res.json({ data: semesters });
    } catch (error) {
        console.error('Get semesters error:', error);
        res.status(500).json({ error: 'Gagal mengambil data semester' });
    }
});

// Get all Kelas
router.get('/kelas', authMiddleware, async (req, res) => {
    try {
        const kelas = await prisma.kelas.findMany({
            orderBy: { nama: 'asc' }
        });
        res.json({ data: kelas });
    } catch (error) {
        console.error('Get kelas error:', error);
        res.status(500).json({ error: 'Gagal mengambil data kelas' });
    }
});

// Get all Fakultas
router.get('/fakultas', authMiddleware, async (req, res) => {
    try {
        const fakultas = await prisma.fakultas.findMany({
            orderBy: { nama: 'asc' }
        });
        res.json({ data: fakultas });
    } catch (error) {
        console.error('Get fakultas error:', error);
        res.status(500).json({ error: 'Gagal mengambil data fakultas' });
    }
});

export default router;
