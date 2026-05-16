import { Router } from 'express';
import { authMiddleware as requireAuth, requireRole } from '../middleware/auth.js';
import multer from 'multer';
import {
    getProfilLulusan,
    createProfilLulusan,
    updateProfilLulusan,
    deleteProfilLulusan,
    exportProfilLulusan,
    importProfilLulusan,
    downloadTemplateProfilLulusan
} from '../controllers/profil-lulusan-controller.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// GET /api/profil-lulusan?prodiId=...
router.get('/', requireAuth, getProfilLulusan);

// POST /api/profil-lulusan
router.post('/', requireAuth, requireRole('admin', 'kaprodi'), createProfilLulusan);

// PUT /api/profil-lulusan/:id
router.put('/:id', requireAuth, requireRole('admin', 'kaprodi'), updateProfilLulusan);

// DELETE /api/profil-lulusan/:id
router.delete('/:id', requireAuth, requireRole('admin', 'kaprodi'), deleteProfilLulusan);

// Export & Import
router.get('/export/excel', requireAuth, exportProfilLulusan);
router.post('/import/excel', requireAuth, requireRole('admin', 'kaprodi'), upload.single('file'), importProfilLulusan);
router.get('/template/excel', requireAuth, requireRole('admin', 'kaprodi'), downloadTemplateProfilLulusan);

export default router;
