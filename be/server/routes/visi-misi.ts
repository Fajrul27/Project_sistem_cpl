
import { Router } from 'express';
import { authMiddleware, requireRole, requirePermission } from '../middleware/auth.js';
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
router.post('/', authMiddleware, requirePermission('visi_misi', 'create'), createVisiMisi);

// PUT /api/visi-misi/:id
router.put('/:id', authMiddleware, requirePermission('visi_misi', 'edit'), updateVisiMisi);

// DELETE /api/visi-misi/:id
router.delete('/:id', authMiddleware, requirePermission('visi_misi', 'delete'), deleteVisiMisi);

export default router;
