
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getVisiMisi,
    createVisiMisi,
    updateVisiMisi,
    deleteVisiMisi
} from '../controllers/visi-misi-controller.js';

const router = Router();

// GET /api/visi-misi?prodiId=...
router.get('/', authMiddleware, getVisiMisi);

// POST /api/visi-misi
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), createVisiMisi);

// PUT /api/visi-misi/:id
router.put('/:id', authMiddleware, requireRole('admin', 'kaprodi'), updateVisiMisi);

// DELETE /api/visi-misi/:id
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), deleteVisiMisi);

export default router;
