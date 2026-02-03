
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import multer from 'multer';
import {
  getAllMataKuliah,
  getMataKuliahSemesters,
  getMataKuliahById,
  getMataKuliahKelas,
  createMataKuliah,
  updateMataKuliah,
  deleteMataKuliah,
  exportMataKuliah,
  importMataKuliah
} from '../controllers/mata-kuliah-controller.js';

const upload = multer({ storage: multer.memoryStorage() });

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

// Export Mata Kuliah as Excel
router.get('/export/excel', authMiddleware, exportMataKuliah);

// Import Mata Kuliah from Excel
router.post('/import/excel', authMiddleware, requireRole('admin', 'kaprodi'), upload.single('file'), importMataKuliah);

export default router;
