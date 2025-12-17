import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import * as EvaluasiController from '../controllers/evaluasi-cpl-controller.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Target Management
// Target Management
router.get('/targets', requireRole('admin', 'kaprodi', 'dosen'), EvaluasiController.getTargets);
router.post('/targets', requireRole('admin', 'kaprodi'), EvaluasiController.upsertTargets);

// Evaluation
router.get('/evaluation', requireRole('admin', 'kaprodi', 'dosen'), EvaluasiController.getEvaluation);

// Tindak Lanjut
router.post('/tindak-lanjut', requireRole('admin', 'kaprodi'), EvaluasiController.createTindakLanjut);
router.get('/tindak-lanjut/history', requireRole('admin', 'kaprodi', 'dosen'), EvaluasiController.getTindakLanjutHistory);

export default router;
