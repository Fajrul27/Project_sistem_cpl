
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getAllTeknikPenilaianRef } from '../controllers/teknik-penilaian-ref-controller.js';

const router = Router();

// Get all Teknik Penilaian Ref
router.get('/', authMiddleware, getAllTeknikPenilaianRef);

export default router;
