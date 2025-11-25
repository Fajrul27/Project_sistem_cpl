import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all Jenis Mata Kuliah
router.get('/', authMiddleware, async (req, res) => {
    try {
        const jenis = await prisma.jenisMataKuliah.findMany({
            orderBy: { nama: 'asc' }
        });
        res.json({ data: jenis });
    } catch (error) {
        console.error('Get Jenis Mata Kuliah error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Jenis Mata Kuliah' });
    }
});

export default router;
