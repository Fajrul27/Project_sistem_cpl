// ============================================
// CPL Routes
// ============================================

import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import multer from 'multer';
import {
  getAllCpl,
  getCplById,
  getCplStats,
  createCpl,
  updateCpl,
  deleteCpl,
  exportCpl,
  importCpl
} from '../controllers/cpl-controller.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Get all CPL
router.get('/', authMiddleware, getAllCpl);

// Get CPL by ID
router.get('/:id', authMiddleware, getCplById);

// Get CPL Stats
router.get('/:id/stats', authMiddleware, getCplStats);

// Create CPL
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), createCpl);

// Update CPL
router.put('/:id', authMiddleware, requireRole('admin', 'kaprodi'), updateCpl);

// Delete CPL
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), deleteCpl);

// Export CPL as Excel
router.get('/export/excel', authMiddleware, exportCpl);

// Import CPL from Excel
router.post('/import/excel', authMiddleware, requireRole('admin', 'kaprodi'), upload.single('file'), importCpl);

export default router;