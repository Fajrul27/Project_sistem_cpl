import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all Kurikulum
router.get('/', authMiddleware, async (req, res) => {
    try {
        const kurikulum = await prisma.kurikulum.findMany({
            where: { isActive: true },
            orderBy: { tahunMulai: 'desc' }
        });
        res.json({ data: kurikulum });
    } catch (error) {
        console.error('Get Kurikulum error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Kurikulum' });
    }
});

export default router;
