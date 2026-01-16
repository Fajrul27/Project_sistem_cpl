
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getEvaluasiByMataKuliah,
    submitEvaluasi,
    reviewEvaluasi
} from '../controllers/evaluasi-controller.js';

const router = Router();

// Get Evaluasi by Mata Kuliah
router.get('/mata-kuliah/:mataKuliahId', authMiddleware, getEvaluasiByMataKuliah);

// Submit Evaluasi (Dosen)
router.post('/', authMiddleware, requireRole('dosen', 'admin'), submitEvaluasi);

// Review Evaluasi (Kaprodi)
router.put('/:id/review', authMiddleware, requireRole('kaprodi', 'admin'), reviewEvaluasi);

export default router;
