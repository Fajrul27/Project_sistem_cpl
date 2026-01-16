
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

// Get all kaprodi data (Admin only)
router.get('/', authMiddleware, requireRole('admin'), getAllKaprodiData);

// Create or update kaprodi data (Admin only)
router.post('/', authMiddleware, requireRole('admin'), createOrUpdateKaprodiData);

// Delete kaprodi data (Admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteKaprodiData);

export default router;
