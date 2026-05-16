import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { 
    getAllFakultas, 
    createFakultas, 
    updateFakultas, 
    deleteFakultas,
    exportFakultas,
    importFakultas,
    getTemplateFakultas
} from '../controllers/fakultas-controller.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Get all Fakultas
router.get('/', authMiddleware, getAllFakultas);
router.post('/', authMiddleware, requireRole('admin'), createFakultas);
router.put('/:id', authMiddleware, requireRole('admin'), updateFakultas);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteFakultas);

// Export/Import
router.get('/export/excel', authMiddleware, requireRole('admin'), exportFakultas);
router.get('/template/excel', authMiddleware, requireRole('admin'), getTemplateFakultas);
router.post('/import/excel', authMiddleware, requireRole('admin'), upload.single('file'), importFakultas);

export default router;
