// ============================================
// Dashboard Routes
// ============================================
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
const router = Router();
// Get dashboard statistics
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const [userCount, cplCount, mataKuliahCount, nilaiCount] = await Promise.all([
            prisma.user.count(),
            prisma.cpl.count({ where: { isActive: true } }),
            prisma.mataKuliah.count({ where: { isActive: true } }),
            prisma.nilaiCpl.count()
        ]);
        res.json({
            data: {
                users: userCount,
                cpl: cplCount,
                mataKuliah: mataKuliahCount,
                nilai: nilaiCount
            }
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Gagal mengambil statistik' });
    }
});
export default router;
