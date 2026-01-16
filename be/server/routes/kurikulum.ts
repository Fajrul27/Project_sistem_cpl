import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { getAllKurikulum, createKurikulum, updateKurikulum, deleteKurikulum } from '../controllers/kurikulum-controller.js';

const router = Router();

// Get all Kurikulum
router.get('/', authMiddleware, getAllKurikulum);

// Create Kurikulum
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), createKurikulum);

// Update Kurikulum
router.put('/:id', authMiddleware, requireRole('admin', 'kaprodi'), updateKurikulum);

// Delete Kurikulum
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), deleteKurikulum);

export default router;
