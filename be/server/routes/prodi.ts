import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all Prodi (Public access for registration)
router.get('/', async (req, res) => {
    try {
        const { fakultasId } = req.query;

        const where: any = {};
        if (fakultasId) {
            where.fakultasId = fakultasId as string;
        }

        const prodi = await prisma.prodi.findMany({
            where,
            orderBy: { nama: 'asc' },
            include: {
                fakultas: true
            }
        });
        res.json({ data: prodi });
    } catch (error) {
        console.error('Get Prodi error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Prodi' });
    }
});

export default router;
