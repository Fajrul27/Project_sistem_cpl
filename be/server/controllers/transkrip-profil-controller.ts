
import { Request, Response } from 'express';
import { TranskripService } from '../services/TranskripService.js';

// Get Transkrip Profil by Mahasiswa ID
export const getTranskripProfilByMahasiswa = async (req: Request, res: Response) => {
    try {
        const { mahasiswaId } = req.params;
        const result = await TranskripService.getTranskripProfil(mahasiswaId);
        res.json(result);
    } catch (error: any) {
        console.error('Error calculating profil lulusan attainment:', error);
        if (error.message === 'MAHASISWA_OR_PRODI_NOT_FOUND') return res.status(404).json({ error: 'Mahasiswa or Prodi not found' });
        res.status(500).json({ error: 'Internal server error' });
    }
};
