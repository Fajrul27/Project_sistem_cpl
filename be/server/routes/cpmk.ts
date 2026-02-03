
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import multer from 'multer';
import {
    getAllCpmk,
    getCpmkByMataKuliah,
    getCpmkById,
    createCpmk,
    updateCpmk,
    deleteCpmk,
    exportCpmk,
    importCpmk
} from '../controllers/cpmk-controller.js';

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

// Get all CPMK (with optional mata kuliah filter)
router.get('/', authMiddleware, getAllCpmk);

// Get CPMK by Mata Kuliah ID
router.get('/mata-kuliah/:mkId', authMiddleware, getCpmkByMataKuliah);

// Get CPMK by ID (with full details)
router.get('/:id', authMiddleware, getCpmkById);

// Create CPMK
router.post('/', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), createCpmk);

// Update CPMK
router.put('/:id', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), updateCpmk);

// Delete CPMK (soft delete)
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), deleteCpmk);

// Export CPMK as Excel
router.get('/export/excel', authMiddleware, exportCpmk);

// Import CPMK from Excel
router.post('/import/excel', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), upload.single('file'), importCpmk);

export default router;
