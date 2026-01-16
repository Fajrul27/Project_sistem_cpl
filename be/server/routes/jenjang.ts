import { Router } from 'express';
import * as JenjangController from '../controllers/jenjang-controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', JenjangController.getAllJenjang);
router.post('/', JenjangController.createJenjang);
router.put('/:id', JenjangController.updateJenjang);
router.delete('/:id', JenjangController.deleteJenjang);

export default router;
