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

export const exportKrs = async (req: Request, res: Response) => {
    try {
        const { prodiId, semesterId, tahunAjaranId, kelasId, q } = req.query;
        // Fetch all without pagination for export
        const result = await KrsService.getAllKrs({
            limit: 1000000, 
            prodiId: prodiId as string,
            semesterId: semesterId as string,
            tahunAjaranId: tahunAjaranId as string,
            kelasId: kelasId as string,
            q: q as string
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data KRS');

        worksheet.columns = [
            { header: 'NIM', key: 'nim', width: 15 },
            { header: 'Nama Mahasiswa', key: 'namaMahasiswa', width: 30 },
            { header: 'Kode MK', key: 'kodeMk', width: 15 },
            { header: 'Nama Mata Kuliah', key: 'namaMk', width: 30 },
            { header: 'SKS', key: 'sks', width: 10 },
            { header: 'Semester', key: 'semester', width: 10 },
            { header: 'Tahun Ajaran', key: 'tahunAjaran', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        result.data.forEach((krs: any) => {
            worksheet.addRow({
                nim: krs.mahasiswa.nim,
                namaMahasiswa: krs.mahasiswa.namaLengkap,
                kodeMk: krs.mataKuliah.kodeMk,
                namaMk: krs.mataKuliah.namaMk,
                sks: krs.mataKuliah.sks,
                semester: krs.semester.angka,
                tahunAjaran: krs.tahunAjaran.nama
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="data_krs_${timestamp}.xlsx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Export KRS error:', error);
        res.status(500).json({ error: 'Gagal export data KRS' });
    }
};

