import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all Fakultas
router.get('/', authMiddleware, async (req, res) => {
    try {
        const fakultas = await prisma.fakultas.findMany({
            orderBy: { kode: 'asc' },
            include: {
                prodi: true
            }
        });
        res.json({ data: fakultas });
    } catch (error) {
        console.error('Get Fakultas error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Fakultas' });
    }
});

export default router;
