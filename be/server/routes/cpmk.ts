
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getAllCpmk,
    getCpmkByMataKuliah,
    getCpmkById,
    createCpmk,
    updateCpmk,
    deleteCpmk
} from '../controllers/cpmk-controller.js';

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

export default router;
