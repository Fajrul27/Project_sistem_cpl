
import { Request, Response } from 'express';
import { TranskripService } from '../services/TranskripService.js';

// Get CPL Analysis Charts
export const getAnalysis = async (req: Request, res: Response) => {
    try {
        const { semester } = req.query;
        const result = await TranskripService.getAnalysis(semester ? Number(semester) : undefined);
        res.json(result);
    } catch (error) {
        console.error('Error fetching analysis:', error);
        res.status(500).json({ error: 'Gagal mengambil data analisis' });
    }
};

// Get Full Transcript by Mahasiswa
export const getTranskripByMahasiswa = async (req: Request, res: Response) => {
    try {
        const { mahasiswaId } = req.params;
        const { semester, tahunAjaran } = req.query;

        const result = await TranskripService.getTranskripCpl(
            mahasiswaId,
            semester && semester !== 'all' ? Number(semester) : undefined,
            tahunAjaran && tahunAjaran !== 'all' ? String(tahunAjaran) : undefined
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error: any) {
        console.error('Error fetching data transkrip:', error);
        if (error.message === 'MAHASISWA_NOT_FOUND') {
            return res.status(404).json({ error: 'Mahasiswa tidak ditemukan' });
        }
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Calculate Transcript
export const calculateTranskrip = async (req: Request, res: Response) => {
    try {
        const { mahasiswaId } = req.body;
        if (!mahasiswaId) {
            return res.status(400).json({ success: false, error: 'mahasiswaId required' });
        }
        const processed = await TranskripService.calculateTranskrip(mahasiswaId);
        res.json({ success: true, message: `Berhasil menghitung ulang nilai untuk ${processed} mata kuliah` });
    } catch (error) {
        console.error('Error calculating transkrip:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
