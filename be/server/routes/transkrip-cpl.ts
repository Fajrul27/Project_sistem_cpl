
import { Router } from 'express';
import { authMiddleware, requireRole, requireProdiScope } from '../middleware/auth.js';
import {
  getAnalysis,
  getTranskripByMahasiswa,
  calculateTranskrip
} from '../controllers/transkrip-cpl-controller.js';

const router = Router();

// GET /api/transkrip-cpl/analisis - Get aggregated analysis data
router.get('/analisis', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), getAnalysis);

// GET /api/transkrip-cpl/:mahasiswaId - Get transkrip by mahasiswa
router.get('/:mahasiswaId', authMiddleware, requireProdiScope, getTranskripByMahasiswa);

// POST /api/transkrip-cpl/calculate - Trigger calculation
router.post('/calculate', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), calculateTranskrip);

export default router;
