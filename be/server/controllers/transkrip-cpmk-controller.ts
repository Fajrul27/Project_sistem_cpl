
import { Request, Response } from 'express';
import { TranskripService } from '../services/TranskripService.js';

// Get Transkrip CPMK by Mahasiswa ID
export const getTranskripCpmkByMahasiswa = async (req: Request, res: Response) => {
    try {
        const { mahasiswaId } = req.params;
        const { semester, tahunAjaran } = req.query;

        const result = await TranskripService.getTranskripCpmk(
            mahasiswaId,
            semester && semester !== 'all' ? Number(semester) : undefined,
            tahunAjaran && tahunAjaran !== 'all' ? String(tahunAjaran) : undefined
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error fetching transkrip CPMK:', error);
        if (error.message === 'MAHASISWA_NOT_FOUND') return res.status(404).json({ success: false, error: 'Mahasiswa tidak ditemukan' });
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
