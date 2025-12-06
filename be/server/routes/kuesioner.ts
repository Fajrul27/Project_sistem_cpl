
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getMyKuesioner,
    submitKuesioner,
    getKuesionerStats
} from '../controllers/kuesioner-controller.js';

const router = Router();

// GET /api/kuesioner/me?semester=...&tahunAjaran=...
// Get current student's questionnaire
router.get('/me', authMiddleware, requireRole('mahasiswa'), getMyKuesioner);

// POST /api/kuesioner
// Submit questionnaire
router.post('/', authMiddleware, requireRole('mahasiswa'), submitKuesioner);

// GET /api/kuesioner/stats?prodiId=...&tahunAjaran=...&semester=...&fakultasId=...
// Get stats for Kaprodi/Admin
router.get('/stats', authMiddleware, requireRole('admin', 'kaprodi'), getKuesionerStats);

export default router;
