
import { Router } from 'express';
import { authMiddleware, requireRole, requirePengampu } from '../middleware/auth.js';
import { getAllNilaiCpl, getNilaiCplByUser, createNilaiCpl } from '../controllers/nilai-cpl-controller.js';

const router = Router();

// Get all nilai CPL
router.get('/', authMiddleware, getAllNilaiCpl);

// Get nilai CPL by user ID
router.get('/user/:userId', authMiddleware, getNilaiCplByUser);

// Create nilai CPL
router.post('/', authMiddleware, requireRole('dosen'), requirePengampu('mataKuliahId'), createNilaiCpl);

export default router;
