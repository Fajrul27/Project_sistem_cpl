import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { 
    getAllKurikulum, 
    createKurikulum, 
    updateKurikulum, 
    deleteKurikulum,
    exportKurikulum,
    importKurikulum,
    getTemplateKurikulum
} from '../controllers/kurikulum-controller.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Get all Kurikulum
router.get('/', authMiddleware, getAllKurikulum);

// Export/Import
router.get('/export/excel', authMiddleware, exportKurikulum);
router.get('/template/excel', authMiddleware, requireRole('admin', 'kaprodi'), getTemplateKurikulum);
router.post('/import/excel', authMiddleware, requireRole('admin', 'kaprodi'), upload.single('file'), importKurikulum);

// Create Kurikulum
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), createKurikulum);

// Update Kurikulum
router.put('/:id', authMiddleware, requireRole('admin', 'kaprodi'), updateKurikulum);

// Delete Kurikulum
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), deleteKurikulum);

export default router;
