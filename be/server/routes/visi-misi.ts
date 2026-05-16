
import { Router } from 'express';
import { authMiddleware, requireRole, requirePermission } from '../middleware/auth.js';
import {
    getVisiMisi,
    createVisiMisi,
    updateVisiMisi,
    deleteVisiMisi,
    exportVisiMisi,
    importVisiMisi,
    getTemplateVisiMisi
} from '../controllers/visi-misi-controller.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// GET /api/visi-misi?prodiId=...
router.get('/', authMiddleware, getVisiMisi);

// Export/Import
router.get('/export/excel', authMiddleware, requirePermission('visi_misi', 'view'), exportVisiMisi);
router.get('/template/excel', authMiddleware, requirePermission('visi_misi', 'create'), getTemplateVisiMisi);
router.post('/import/excel', authMiddleware, requirePermission('visi_misi', 'create'), upload.single('file'), importVisiMisi);

// POST /api/visi-misi
router.post('/', authMiddleware, requirePermission('visi_misi', 'create'), createVisiMisi);

// PUT /api/visi-misi/:id
router.put('/:id', authMiddleware, requirePermission('visi_misi', 'edit'), updateVisiMisi);

// DELETE /api/visi-misi/:id
router.delete('/:id', authMiddleware, requirePermission('visi_misi', 'delete'), deleteVisiMisi);

export default router;
