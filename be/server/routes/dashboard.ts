import { Router } from 'express';
import { authMiddleware, requirePermission, requireRole } from '../middleware/auth.js';
import {
  getDashboardStats,
  getDosenAnalysis,
  getStudentEvaluation
} from '../controllers/dashboard-controller.js';

const router = Router();

// Get dashboard statistics
router.get('/stats', authMiddleware, requirePermission('view', 'dashboard'), getDashboardStats);

// Get Dosen Analysis - for kaprodi/admin only (analytics feature)
router.get('/dosen', authMiddleware, requireRole('admin', 'kaprodi'), getDosenAnalysis);

// Get Student Evaluation - for kaprodi/admin only (analytics feature)
router.get('/students', authMiddleware, requireRole('admin', 'kaprodi'), getStudentEvaluation);

export default router;
