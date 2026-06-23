
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getAllKategoriCpl, createKategoriCpl } from '../controllers/kategori-cpl-controller.js';

const router = Router();

// Get all Kategori CPL
router.get('/', authMiddleware, getAllKategoriCpl);

// Create new Kategori CPL
router.post('/', authMiddleware, createKategoriCpl);

export default router;
