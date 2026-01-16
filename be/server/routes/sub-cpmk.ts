
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getSubCpmk,
    createSubCpmk,
    updateSubCpmk,
    deleteSubCpmk,
    createSubCpmkMapping,
    deleteSubCpmkMapping
} from '../controllers/sub-cpmk-controller.js';

const router = Router();

// GET /api/sub-cpmk?cpmkId=...
router.get('/', authMiddleware, getSubCpmk);

// POST /api/sub-cpmk?cpmkId=...
router.post('/', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), createSubCpmk);

// PUT /api/sub-cpmk/:id
router.put('/:id', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), updateSubCpmk);

// DELETE /api/sub-cpmk/:id
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), deleteSubCpmk);

// POST /api/sub-cpmk/mapping
router.post('/mapping', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), createSubCpmkMapping);

// DELETE /api/sub-cpmk/mapping/:id
router.delete('/mapping/:id', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), deleteSubCpmkMapping);

export default router;
