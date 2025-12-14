import { Request, Response } from 'express';
import { DashboardService } from '../services/DashboardService.js';

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { semester, angkatan, kelasId, mataKuliahId, prodiId } = req.query;

        const result = await DashboardService.getDashboardStats({
            userId,
            userRole,
            semester: semester as string,
            angkatan: angkatan as string,
            kelasId: kelasId as string,
            mataKuliahId: mataKuliahId as string,
            prodiId: prodiId as string
        });

        res.json({ data: result });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Gagal mengambil statistik' });
    }
};

// Get Dosen Analysis
export const getDosenAnalysis = async (req: Request, res: Response) => {
    try {
        const { prodiId } = req.query;
        const analysis = await DashboardService.getDosenAnalysis(prodiId as string);
        res.json({ data: analysis });
    } catch (error) {
        console.error('Get dosen analysis error:', error);
        res.status(500).json({ error: 'Gagal mengambil analisis dosen' });
    }
};

// Get Student Evaluation
export const getStudentEvaluation = async (req: Request, res: Response) => {
    try {
        const { prodiId, angkatan, semester } = req.query;
        const evaluation = await DashboardService.getStudentEvaluation({
            prodiId: prodiId as string,
            angkatan: angkatan as string,
            semester: semester as string
        });

        res.json({ data: evaluation });
    } catch (error) {
        console.error('Get student evaluation error:', error);
        res.status(500).json({ error: 'Gagal mengambil evaluasi mahasiswa' });
    }
};
