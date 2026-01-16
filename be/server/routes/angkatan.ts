import { Router } from 'express';
import { getAllAngkatan, createAngkatan, updateAngkatan, deleteAngkatan } from '../controllers/angkatan-controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// Get all angkatan (public/authenticated only)
router.get('/', authMiddleware, getAllAngkatan);

// Create angkatan (admin only)
router.post('/', authMiddleware, requireRole('admin'), createAngkatan);

// Update angkatan (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), updateAngkatan);

// Delete angkatan (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteAngkatan);

export default router;
