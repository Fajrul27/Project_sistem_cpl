
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  getAllMappings,
  getMappingsByMataKuliah,
  createMapping,
  updateMapping,
  batchCreateMappings,
  deleteMapping
} from '../controllers/cpl-mapping-controller.js';

const router = Router();

// Get all mappings
router.get('/', authMiddleware, getAllMappings);

// Get mappings by Mata Kuliah
router.get('/mata-kuliah/:mkId', authMiddleware, getMappingsByMataKuliah);

// Create mapping
router.post('/', authMiddleware, requireRole('admin', 'kaprodi'), createMapping);

// Update mapping
router.put('/:id', authMiddleware, requireRole('admin', 'kaprodi'), updateMapping);

// Batch create mappings
router.post('/batch', authMiddleware, requireRole('admin', 'kaprodi'), batchCreateMappings);

// Delete mapping
router.delete('/:id', authMiddleware, requireRole('admin', 'kaprodi'), deleteMapping);

export default router;
