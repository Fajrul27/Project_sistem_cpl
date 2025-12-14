
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getAllKurikulum } from '../controllers/kurikulum-controller.js';

const router = Router();

// Get all Kurikulum
router.get('/', authMiddleware, getAllKurikulum);

export default router;
