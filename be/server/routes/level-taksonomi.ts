
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getAllLevelTaksonomi } from '../controllers/level-taksonomi-controller.js';

const router = Router();

// Get all Level Taksonomi
router.get('/', authMiddleware, getAllLevelTaksonomi);

export default router;
