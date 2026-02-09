import { Router } from 'express';
import { getAllKrs, importKrs, deleteKrs, createKrs } from '../controllers/krs-controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All KRS routes are protected
router.use(authMiddleware);

// Only admin and kaprodi can manage KRS
router.get('/', requireRole('admin', 'kaprodi'), getAllKrs);
router.post('/', requireRole('admin', 'kaprodi'), createKrs);
router.post('/import', requireRole('admin', 'kaprodi'), upload.single('file'), importKrs);
router.delete('/:id', requireRole('admin', 'kaprodi'), deleteKrs);

export default router;
