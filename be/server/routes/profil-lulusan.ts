
import { Router } from 'express';
import { authMiddleware as requireAuth, requireRole } from '../middleware/auth.js';
import {
    getProfilLulusan,
    createProfilLulusan,
    updateProfilLulusan,
    deleteProfilLulusan
} from '../controllers/profil-lulusan-controller.js';

const router = Router();

// GET /api/profil-lulusan?prodiId=...
router.get('/', requireAuth, getProfilLulusan);

// POST /api/profil-lulusan
router.post('/', requireAuth, requireRole('admin', 'kaprodi'), createProfilLulusan);

// PUT /api/profil-lulusan/:id
router.put('/:id', requireAuth, requireRole('admin', 'kaprodi'), updateProfilLulusan);

// DELETE /api/profil-lulusan/:id
router.delete('/:id', requireAuth, requireRole('admin', 'kaprodi'), deleteProfilLulusan);

export default router;
