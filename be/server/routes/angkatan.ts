import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all angkatan
router.get('/', authMiddleware, async (req, res) => {
    try {
        const angkatan = await prisma.angkatan.findMany({
            orderBy: { tahun: 'desc' },
            where: { isActive: true }
        });
        res.json({ data: angkatan });
    } catch (error) {
        console.error('Get angkatan error:', error);
        res.status(500).json({ error: 'Gagal mengambil data angkatan' });
    }
});

// Create angkatan
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), async (req, res) => {
    try {
        const { tahun } = req.body;

        if (!tahun) {
            return res.status(400).json({ error: 'Tahun harus diisi' });
        }

        const newAngkatan = await prisma.angkatan.create({
            data: {
                tahun: parseInt(tahun)
            }
        });

        res.status(201).json({ data: newAngkatan });
    } catch (error) {
        console.error('Create angkatan error:', error);
        res.status(500).json({ error: 'Gagal membuat angkatan' });
    }
});

export default router;
