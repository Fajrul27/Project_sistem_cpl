
import { Request, Response } from 'express';
import { ReferenceService } from '../services/ReferenceService.js';

export const getAllLevelTaksonomi = async (req: Request, res: Response) => {
    try {
        const levels = await ReferenceService.getAllLevelTaksonomi();
        res.json({ data: levels });
    } catch (error) {
        console.error('Get level taksonomi error:', error);
        res.status(500).json({ error: 'Gagal mengambil data level taksonomi' });
    }
};
