
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getAllKategoriCpl } from '../controllers/kategori-cpl-controller.js';

const router = Router();

// Get all Kategori CPL
router.get('/', authMiddleware, getAllKategoriCpl);

export default router;
