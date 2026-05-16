import { Router } from 'express';
import { SkalaNilaiController } from '../controllers/skala-nilai-controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Public read access (authenticated)
router.get('/', authMiddleware, SkalaNilaiController.getAll);

// Export/Import
router.get('/export/excel', authMiddleware, requireRole('admin'), SkalaNilaiController.exportExcel);
router.get('/template/excel', authMiddleware, requireRole('admin'), SkalaNilaiController.getTemplate);
router.post('/import/excel', authMiddleware, requireRole('admin'), upload.single('file'), SkalaNilaiController.importExcel);

// Admin-only write access
router.post('/', authMiddleware, requireRole('admin'), SkalaNilaiController.create);
router.put('/:id', authMiddleware, requireRole('admin'), SkalaNilaiController.update);
router.delete('/:id', authMiddleware, requireRole('admin'), SkalaNilaiController.delete);

export default router;
