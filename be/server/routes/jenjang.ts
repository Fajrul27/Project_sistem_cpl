import { Router } from 'express';
import * as JenjangController from '../controllers/jenjang-controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.use(authMiddleware);

router.get('/', JenjangController.getAllJenjang);
router.post('/', requireRole('admin'), JenjangController.createJenjang);
router.put('/:id', requireRole('admin'), JenjangController.updateJenjang);
router.delete('/:id', requireRole('admin'), JenjangController.deleteJenjang);

// Export/Import
router.get('/export/excel', requireRole('admin'), JenjangController.exportJenjang);
router.get('/template/excel', requireRole('admin'), JenjangController.getTemplateJenjang);
router.post('/import/excel', requireRole('admin'), upload.single('file'), JenjangController.importJenjang);

export default router;
