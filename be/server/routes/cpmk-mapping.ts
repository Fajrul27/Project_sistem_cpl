
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
    getAllMappings,
    getMappingsByCpmk,
    createMapping,
    updateMapping,
    batchCreateMappings,
    deleteMapping
} from '../controllers/cpmk-mapping-controller.js';

const router = Router();

// Get all CPMK-CPL mappings
router.get('/', authMiddleware, getAllMappings);

// Get mappings by CPMK ID
router.get('/cpmk/:cpmkId', authMiddleware, getMappingsByCpmk);

// Create CPMK-CPL mapping
router.post('/', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), createMapping);

// Update CPMK-CPL mapping (update bobot)
router.put('/:id', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), updateMapping);

// Batch create mappings
router.post('/batch', authMiddleware, requireRole('admin', 'dosen'), batchCreateMappings);

// Delete CPMK-CPL mapping
router.delete('/:id', authMiddleware, requireRole('admin', 'dosen', 'kaprodi'), deleteMapping);

export default router;


