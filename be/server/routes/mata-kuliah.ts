
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  getAllMataKuliah,
  getMataKuliahSemesters,
  getMataKuliahById,
  getMataKuliahKelas,
  createMataKuliah,
  updateMataKuliah,
  deleteMataKuliah
} from '../controllers/mata-kuliah-controller.js';

const router = Router();

// Get all Mata Kuliah (filtered by access)
router.get('/', authMiddleware, getAllMataKuliah);

// Get available semesters for accessible Mata Kuliah
router.get('/semesters', authMiddleware, getMataKuliahSemesters);

// Get single Mata Kuliah details
router.get('/:id', authMiddleware, getMataKuliahById);

// Get classes for a specific Mata Kuliah (assigned to user)
router.get('/:id/kelas', authMiddleware, getMataKuliahKelas);

// Create Mata Kuliah
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), createMataKuliah);

// Update Mata Kuliah
router.put('/:id', authMiddleware, requireRole('admin', 'kaprodi'), updateMataKuliah);

// Delete Mata Kuliah (soft delete)
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), deleteMataKuliah);

export default router;
