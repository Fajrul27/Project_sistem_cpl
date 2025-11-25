// ============================================
// Kaprodi Data Routes
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Get kaprodi data by program studi
router.get('/:programStudi', authMiddleware, async (req, res) => {
    try {
        const { programStudi } = req.params;

        const kaprodiData = await prisma.kaprodiData.findUnique({
            where: { programStudi: programStudi.toUpperCase() }
        });

        if (!kaprodiData) {
            return res.json({
                data: {
                    programStudi: programStudi.toUpperCase(),
                    namaKaprodi: '( ........................................................ )',
                    nidnKaprodi: ''
                }
            });
        }

        res.json({ data: kaprodiData });
    } catch (error) {
        console.error('Error fetching kaprodi data:', error);
        res.status(500).json({ error: 'Failed to fetch kaprodi data' });
    }
});

// Get all kaprodi data (Admin only)
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const kaprodiData = await prisma.kaprodiData.findMany({
            orderBy: { programStudi: 'asc' }
        });

        res.json({ data: kaprodiData });
    } catch (error) {
        console.error('Error fetching kaprodi data:', error);
        res.status(500).json({ error: 'Failed to fetch kaprodi data' });
    }
});

// Create or update kaprodi data (Admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
    try {
        const { programStudi, namaKaprodi, nidnKaprodi } = req.body;

        const kaprodiData = await prisma.kaprodiData.upsert({
            where: { programStudi: programStudi.toUpperCase() },
            create: {
                programStudi: programStudi.toUpperCase(),
                namaKaprodi,
                nidnKaprodi
            },
            update: {
                namaKaprodi,
                nidnKaprodi
            }
        });

        res.json({
            data: kaprodiData,
            message: 'Data Kaprodi berhasil disimpan'
        });
    } catch (error) {
        console.error('Error saving kaprodi data:', error);
        res.status(500).json({ error: 'Failed to save kaprodi data' });
    }
});

export default router;
