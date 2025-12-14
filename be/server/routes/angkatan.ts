
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getAllAngkatan, createAngkatan } from '../controllers/angkatan-controller.js';

const router = Router();

// Get all angkatan
router.get('/', authMiddleware, getAllAngkatan);

// Create angkatan
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), createAngkatan);

export default router;
