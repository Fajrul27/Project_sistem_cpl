
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getAllFakultas, createFakultas, updateFakultas, deleteFakultas } from '../controllers/fakultas-controller.js';

const router = Router();

// Get all Fakultas
router.get('/', authMiddleware, getAllFakultas);
router.post('/', authMiddleware, createFakultas);
router.put('/:id', authMiddleware, updateFakultas);
router.delete('/:id', authMiddleware, deleteFakultas);

export default router;
