
import { Request, Response } from 'express';
import { KuesionerService } from '../services/KuesionerService.js';

// Get current student's questionnaire
export const getMyKuesioner = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { semester, tahunAjaran } = req.query;


        if (!semester || !tahunAjaran) {
            return res.status(400).json({ error: 'Semester dan Tahun Ajaran wajib diisi' });
        }

        const data = await KuesionerService.getMyKuesioner(
            userId,
            Number(semester),
            String(tahunAjaran)
        );

        res.json(data);
    } catch (error) {
        console.error('Error fetching kuesioner:', error);
        res.status(500).json({ error: 'Gagal mengambil data kuesioner' });
    }
};

// Submit questionnaire
export const submitKuesioner = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;

        const result = await KuesionerService.submitKuesioner(userId, req.body);

        res.json({ message: 'Kuesioner berhasil disimpan' });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            console.error('[Kuesioner POST] Validation Error:', error.issues);
            return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Error submitting kuesioner:', error);
        res.status(500).json({ error: 'Gagal menyimpan kuesioner' });
    }
};

// Get stats for Kaprodi/Admin
export const getKuesionerStats = async (req: Request, res: Response) => {
    try {
        const { tahunAjaran, semester, prodiId, fakultasId } = req.query;
        const userId = (req as any).userId;
        const userRole = (req as any).user?.role;

        /*
        */

        const stats = await KuesionerService.getKuesionerStats({
            userId,
            userRole,
            prodiId: prodiId as string,
            fakultasId: fakultasId as string,
            tahunAjaranId: tahunAjaran as string,
            semester: semester as string
        });

        /*
        */

        res.json(stats);
    } catch (error: any) {
        console.error('Error fetching kuesioner stats:', error);
        if (error.message === 'INVALID_PRODI') {
            return res.status(403).json({ error: 'Profil Kaprodi tidak valid (tidak memiliki Prodi)' });
        }
        res.status(500).json({ error: 'Gagal mengambil statistik kuesioner' });
    }
};
