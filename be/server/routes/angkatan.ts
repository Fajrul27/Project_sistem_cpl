import { Router } from 'express';
import {
    getAllAngkatan,
    createAngkatan,
    updateAngkatan,
    deleteAngkatan,
    exportAngkatan,
    importAngkatan,
    getTemplateAngkatan
} from '../controllers/angkatan-controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Get all angkatan (public/authenticated only)
router.get('/', authMiddleware, getAllAngkatan);

// Export/Import
router.get('/export/excel', authMiddleware, requireRole('admin'), exportAngkatan);
router.get('/template/excel', authMiddleware, requireRole('admin'), getTemplateAngkatan);
router.post('/import/excel', authMiddleware, requireRole('admin'), upload.single('file'), importAngkatan);

// Create angkatan (admin only)
router.post('/', authMiddleware, requireRole('admin'), createAngkatan);

// Update angkatan (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), updateAngkatan);

// Delete angkatan (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteAngkatan);

export default router;
