import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all Level Taksonomi
router.get('/', authMiddleware, async (req, res) => {
    try {
        const levels = await prisma.levelTaksonomi.findMany({
            orderBy: { kode: 'asc' }
        });
        res.json({ data: levels });
    } catch (error) {
        console.error('Get Level Taksonomi error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Level Taksonomi' });
    }
});

export default router;
