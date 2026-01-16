import { Request, Response } from 'express';
import { EvaluasiCPLService } from '../services/EvaluasiCPLService.js';

// Get Targets
export const getTargets = async (req: Request, res: Response) => {
    try {
        const { prodiId, angkatan, tahunAjaran, tahunAjaranId, semester } = req.query;
        const ta = (tahunAjaran || tahunAjaranId) as string;

        if (!prodiId || !angkatan || !ta) {
            return res.status(400).json({ error: 'Missing required params: prodiId, angkatan, tahunAjaran' });
        }

        const targets = await EvaluasiCPLService.getTargets({
            prodiId: prodiId as string,
            angkatan: angkatan as string,
            tahunAjaran: ta,
            semester: semester ? Number(semester) : undefined
        });

        res.json({ data: targets });
    } catch (error) {
        console.error('Error fetching targets:', error);
        res.status(500).json({ error: 'Gagal mengambil data target CPL' });
    }
};

// Upsert Targets
export const upsertTargets = async (req: Request, res: Response) => {
    try {
        const { prodiId, angkatan, tahunAjaran, tahunAjaranId, semester, targets } = req.body;
        const ta = tahunAjaran || tahunAjaranId;

        if (!prodiId || !angkatan || !ta || !targets) {
            return res.status(400).json({ error: 'Missing required body params' });
        }

        const result = await EvaluasiCPLService.upsertTargets({
            prodiId,
            angkatan,
            tahunAjaran: ta,
            semester: semester ? Number(semester) : undefined,
            targets
        });

        res.json({ message: 'Target berhasil disimpan', data: result });
    } catch (error) {
        console.error('Error saving targets:', error);
        res.status(500).json({ error: 'Gagal menyimpan target CPL' });
    }
};

// Get Evaluation
export const getEvaluation = async (req: Request, res: Response) => {
    try {
        const { prodiId, angkatan, tahunAjaran, tahunAjaranId, semester } = req.query;
        const ta = (tahunAjaran || tahunAjaranId) as string;

        if (!prodiId || !angkatan || !ta) {
            return res.status(400).json({ error: 'Missing required params: prodiId, angkatan, tahunAjaran' });
        }

        const result = await EvaluasiCPLService.getEvaluation({
            prodiId: prodiId as string,
            angkatan: angkatan as string,
            tahunAjaran: ta,
            semester: semester ? Number(semester) : undefined
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching evaluation:', error);
        res.status(500).json({ error: 'Gagal melakukan evaluasi CPL' });
    }
};

// Create Tindak Lanjut
export const createTindakLanjut = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const data = req.body;

        const result = await EvaluasiCPLService.createTindakLanjut({
            ...data,
            createdBy: userId
        });

        res.status(201).json({ message: 'Tindak lanjut berhasil disimpan', data: result });
    } catch (error) {
        console.error('Error creating tindak lanjut:', error);
        res.status(500).json({ error: 'Gagal menyimpan tindak lanjut' });
    }
};

// Get Tindak Lanjut History
export const getTindakLanjutHistory = async (req: Request, res: Response) => {
    try {
        const { cplId, prodiId } = req.query;

        if (!cplId || !prodiId) {
            return res.status(400).json({ error: 'Missing required params: cplId, prodiId' });
        }

        const history = await EvaluasiCPLService.getTindakLanjutHistory(
            cplId as string,
            prodiId as string
        );

        res.json({ data: history });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Gagal mengambil riwayat tindak lanjut' });
    }
};
