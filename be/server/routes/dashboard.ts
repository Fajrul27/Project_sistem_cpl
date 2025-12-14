
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  getDashboardStats,
  getDosenAnalysis,
  getStudentEvaluation
} from '../controllers/dashboard-controller.js';

const router = Router();

// Get dashboard statistics
router.get('/stats', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), getDashboardStats);

// Get Dosen Analysis
router.get('/dosen', authMiddleware, requireRole('admin', 'kaprodi'), getDosenAnalysis);

// Get Student Evaluation
router.get('/students', authMiddleware, requireRole('admin', 'kaprodi'), getStudentEvaluation);

export default router;


