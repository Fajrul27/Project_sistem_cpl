
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getAllFakultas } from '../controllers/fakultas-controller.js';

const router = Router();

// Get all Fakultas
router.get('/', authMiddleware, getAllFakultas);

export default router;
