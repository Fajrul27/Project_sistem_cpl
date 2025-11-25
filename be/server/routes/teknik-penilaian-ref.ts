import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all Teknik Penilaian Ref
router.get('/', authMiddleware, async (req, res) => {
    try {
        const refs = await prisma.teknikPenilaianRef.findMany({
            orderBy: { nama: 'asc' }
        });
        res.json({ data: refs });
    } catch (error) {
        console.error('Get Teknik Penilaian Ref error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Teknik Penilaian Ref' });
    }
});

export default router;
