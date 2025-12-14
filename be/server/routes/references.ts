
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getAllSemesters, getAllKelas, getAllFakultasRef } from '../controllers/references-controller.js';

const router = Router();

// Get all Semesters
router.get('/semester', authMiddleware, getAllSemesters);

// Get all Kelas
router.get('/kelas', authMiddleware, getAllKelas);

// Get all Fakultas
router.get('/fakultas', authMiddleware, getAllFakultasRef);

export default router;
