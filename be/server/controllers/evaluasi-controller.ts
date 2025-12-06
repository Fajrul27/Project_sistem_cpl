import { Request, Response } from 'express';
import { EvaluasiService } from '../services/EvaluasiService.js';

// Get Evaluasi by Mata Kuliah
export const getEvaluasiByMataKuliah = async (req: Request, res: Response) => {
    try {
        const { mataKuliahId } = req.params;
        const { semester, tahunAjaran } = req.query;

        const evaluasi = await EvaluasiService.getEvaluasiByMataKuliah(
            mataKuliahId,
            semester ? parseInt(semester as string) : undefined,
            tahunAjaran as string
        );

        res.json({ data: evaluasi });
    } catch (error) {
        console.error('Get evaluasi error:', error);
        res.status(500).json({ error: 'Gagal mengambil data evaluasi' });
    }
};

// Submit Evaluasi (Dosen)
export const submitEvaluasi = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const evaluasi = await EvaluasiService.submitEvaluasi(userId, req.body);

        res.json({ data: evaluasi, message: 'Evaluasi berhasil disimpan' });
    } catch (error: any) {
        console.error('Submit evaluasi error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'INVALID_DATA') {
            return res.status(400).json({ error: 'Data evaluasi tidak lengkap' });
        }
        res.status(500).json({ error: 'Gagal menyimpan evaluasi' });
    }
};

// Review Evaluasi (Kaprodi)
export const reviewEvaluasi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { feedbackKaprodi } = req.body;

        const evaluasi = await EvaluasiService.reviewEvaluasi(id, feedbackKaprodi);

        res.json({ data: evaluasi, message: 'Feedback berhasil disimpan' });
    } catch (error) {
        console.error('Review evaluasi error:', error);
        res.status(500).json({ error: 'Gagal menyimpan feedback' });
    }
};
