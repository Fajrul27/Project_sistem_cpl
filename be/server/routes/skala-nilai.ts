import { Router } from 'express';
import { SkalaNilaiController } from '../controllers/skala-nilai-controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Public read access (authenticated)
router.get('/', authMiddleware, SkalaNilaiController.getAll);

// Admin-only write access
router.post('/', authMiddleware, requireRole('admin'), SkalaNilaiController.create);
router.put('/:id', authMiddleware, requireRole('admin'), SkalaNilaiController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), SkalaNilaiController.delete);

export default router;
