import { Router } from 'express';
import { 
    getAllProdi, 
    createProdi, 
    updateProdi, 
    deleteProdi,
    exportProdi,
    importProdi,
    getTemplateProdi
} from '../controllers/prodi-controller.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Get all Prodi (Public access for registration)
router.get('/', getAllProdi);

// Protected routes
router.post('/', authMiddleware, requireRole('admin'), createProdi);
router.put('/:id', authMiddleware, requireRole('admin'), updateProdi);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteProdi);

// Export/Import
router.get('/export/excel', authMiddleware, requireRole('admin'), exportProdi);
router.get('/template/excel', authMiddleware, requireRole('admin'), getTemplateProdi);
router.post('/import/excel', authMiddleware, requireRole('admin'), upload.single('file'), importProdi);

export default router;
