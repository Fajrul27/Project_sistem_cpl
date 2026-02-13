import { Request, Response } from 'express';
import { KrsService } from '../services/KrsService.js';
import ExcelJS from 'exceljs';

export const getAllKrs = async (req: Request, res: Response) => {
    try {
        const { page, limit, prodiId, semesterId, tahunAjaranId, kelasId, q } = req.query;
        const result = await KrsService.getAllKrs({
            page: page ? parseInt(page as string) : 1,
            limit: limit ? parseInt(limit as string) : 10,
            prodiId: prodiId as string,
            semesterId: semesterId as string,
            tahunAjaranId: tahunAjaranId as string,
            kelasId: kelasId as string,
            q: q as string
        });
        res.json(result);
    } catch (error: any) {
        console.error('Get KRS error:', error);
        res.status(500).json({ error: 'Gagal mengambil data KRS' });
    }
};

export const importKrs = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.getWorksheet(1); // Use first sheet

        if (!worksheet) {
            return res.status(400).json({ error: 'Sheet tidak ditemukan' });
        }

        const jsonData: any[] = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            const values = row.values as any[];
            jsonData.push({
                nim: values[1],
                // values[2] is Nama Mahasiswa, not needed for lookup but present in template
                kodeMk: values[3],
                semesterAngka: values[4],
                tahunAjaranNama: values[5]
            });
        });

        const result = await KrsService.importKrs(jsonData, userId, userRole);
        res.json(result);
    } catch (error: any) {
        console.error('Import KRS error:', error);
        res.status(500).json({ error: 'Gagal mengimport data KRS' });
    }
};

export const deleteKrs = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await KrsService.deleteKrs(id);
        res.json({ message: 'Data KRS berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete KRS error:', error);
        res.status(500).json({ error: 'Gagal menghapus data KRS' });
    }
};

export const createKrs = async (req: Request, res: Response) => {
    try {
        const result = await KrsService.createKrs(req.body);
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Create KRS error:', error);
        res.status(500).json({ error: 'Gagal menambahkan data KRS' });
    }
};
