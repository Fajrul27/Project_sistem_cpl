
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getAllJenisMataKuliah } from '../controllers/jenis-mata-kuliah-controller.js';

const router = Router();

// Get all Jenis Mata Kuliah
router.get('/', authMiddleware, getAllJenisMataKuliah);

export default router;
