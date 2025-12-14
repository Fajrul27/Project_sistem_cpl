
import { Router } from 'express';
import { getAllProdi } from '../controllers/prodi-controller.js';

const router = Router();

// Get all Prodi (Public access for registration)
router.get('/', getAllProdi);

export default router;
