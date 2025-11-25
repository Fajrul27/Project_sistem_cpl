import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all Kategori CPL
router.get('/', authMiddleware, async (req, res) => {
    try {
        const kategori = await prisma.kategoriCpl.findMany({
            orderBy: { nama: 'asc' }
        });
        res.json({ data: kategori });
    } catch (error) {
        console.error('Get Kategori CPL error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Kategori CPL' });
    }
});

export default router;
