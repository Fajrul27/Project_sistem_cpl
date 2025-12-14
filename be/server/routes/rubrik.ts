
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getRubrikByCpmk,
    createOrUpdateRubrik,
    deleteRubrik
} from '../controllers/rubrik-controller.js';

const router = Router();

// Get Rubrik by CPMK ID
router.get('/:cpmkId', authMiddleware, getRubrikByCpmk);

// Create or Update Rubrik
router.post('/', authMiddleware, requireRole('admin', 'dosen'), createOrUpdateRubrik);

// Delete Rubrik
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen'), deleteRubrik);

export default router;
