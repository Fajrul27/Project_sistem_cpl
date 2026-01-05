
import { Router } from 'express';
import { getAllProdi, createProdi, updateProdi, deleteProdi } from '../controllers/prodi-controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all Prodi (Public access for registration)
router.get('/', getAllProdi);

// Protected routes
router.post('/', authMiddleware, createProdi);
router.put('/:id', authMiddleware, updateProdi);
router.delete('/:id', authMiddleware, deleteProdi);

export default router;
