
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getKaprodiByProgramStudi,
    getAllKaprodiData,
    createOrUpdateKaprodiData,
    deleteKaprodiData
} from '../controllers/kaprodi-data-controller.js';

const router = Router();

// Get kaprodi data by program studi
router.get('/:programStudi', authMiddleware, getKaprodiByProgramStudi);

// Get all kaprodi data (Admin & Kaprodi)
router.get('/', authMiddleware, requireRole('admin', 'kaprodi'), getAllKaprodiData);

// Create or update kaprodi data (Admin & Kaprodi)
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), createOrUpdateKaprodiData);

// Delete kaprodi data (Admin & Kaprodi)
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), deleteKaprodiData);

export default router;
