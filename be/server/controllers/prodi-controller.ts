import { Request, Response } from 'express';
import { AcademicService } from '../services/AcademicService.js';

// Get all Prodi (Public access for registration)
export const getAllProdi = async (req: Request, res: Response) => {
    try {
        const { fakultasId } = req.query;
        const prodi = await AcademicService.getAllProdi(fakultasId as string);
        res.json({ data: prodi });
    } catch (error) {
        console.error('Get Prodi error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Prodi' });
    }
};

// Create Prodi
export const createProdi = async (req: Request, res: Response) => {
    try {
        const { kode, nama, jenjang, fakultasId } = req.body;
        if (!kode || !nama || !jenjang || !fakultasId) {
            return res.status(400).json({ error: 'Data Prodi tidak lengkap (kode, nama, jenjang, fakultasId)' });
        }

        const newProdi = await AcademicService.createProdi({ kode, nama, jenjang, fakultasId });
        res.status(201).json({ data: newProdi, message: 'Prodi berhasil dibuat' });
    } catch (error: any) {
        console.error('Create Prodi error:', error);
        res.status(500).json({ error: error.message || 'Gagal membuat Prodi' });
    }
};

// Update Prodi
export const updateProdi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { kode, nama, jenjang, fakultasId } = req.body;

        const updatedProdi = await AcademicService.updateProdi(id, { kode, nama, jenjang, fakultasId });
        res.json({ data: updatedProdi, message: 'Prodi berhasil diupdate' });
    } catch (error: any) {
        console.error('Update Prodi error:', error);
        res.status(500).json({ error: error.message || 'Gagal update Prodi' });
    }
};

// Delete Prodi
export const deleteProdi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await AcademicService.deleteProdi(id);
        res.json({ message: 'Prodi berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete Prodi error:', error);
        res.status(500).json({ error: error.message || 'Gagal menghapus Prodi' });
    }
};

// Export Prodi as Excel
export const exportProdi = async (req: Request, res: Response) => {
    try {
        const { fakultasId } = req.query;
        const prodi = await AcademicService.getAllProdi(fakultasId as string);

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Prodi');

        worksheet.columns = [
            { header: 'Kode', key: 'kode', width: 15 },
            { header: 'Nama Prodi', key: 'nama', width: 30 },
            { header: 'Jenjang', key: 'jenjang', width: 10 },
            { header: 'Fakultas', key: 'fakultas', width: 30 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        prodi.forEach((item: any) => {
            worksheet.addRow({
                kode: item.kode,
                nama: item.nama,
                jenjang: item.jenjang,
                fakultas: item.fakultas?.nama || ''
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="data_prodi_${timestamp}.xlsx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Gagal export data' });
    }
};

// Import Prodi from Excel
export const importProdi = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.getWorksheet('Data Prodi') || workbook.worksheets[0];

        const errors: string[] = [];
        const successes: any[] = [];
        let rowNumber = 1;

        const rows: any[] = [];
        worksheet.eachRow((row, num) => {
            if (num > 1) rows.push({ num, values: row.values });
        });

        // Preload fakultas mapping
        const fakultasMap = new Map();
        const allFakultas = await AcademicService.getAllFakultas();
        allFakultas.forEach((f: any) => {
            fakultasMap.set(f.nama.toLowerCase(), f.id);
            fakultasMap.set(f.kode.toLowerCase(), f.id);
        });

        for (const { num, values } of rows) {
            rowNumber = num;
            const [, kode, nama, jenjang, namaFakultas] = values as any[];

            if (!kode || !nama || !jenjang || !namaFakultas) {
                errors.push(`Baris ${rowNumber}: Semua kolom (Kode, Nama, Jenjang, Fakultas) wajib diisi`);
                continue;
            }

            try {
                // Find fakultasId
                const fakultasId = fakultasMap.get(String(namaFakultas).toLowerCase());
                if (!fakultasId) {
                    errors.push(`Baris ${rowNumber}: Fakultas "${namaFakultas}" tidak ditemukan`);
                    continue;
                }

                // Check if exists
                const existing = await AcademicService.getProdiByKode(String(kode).trim());
                if (existing) {
                    await AcademicService.updateProdi(existing.id, {
                        nama: String(nama).trim(),
                        jenjang: String(jenjang).trim(),
                        fakultasId
                    });
                    successes.push({ row: rowNumber, kode, action: 'updated' });
                } else {
                    await AcademicService.createProdi({
                        kode: String(kode).trim(),
                        nama: String(nama).trim(),
                        jenjang: String(jenjang).trim(),
                        fakultasId
                    });
                    successes.push({ row: rowNumber, kode, action: 'created' });
                }
            } catch (err: any) {
                errors.push(`Baris ${rowNumber}: ${err.message}`);
            }
        }

        res.json({
            message: `Import selesai. ${successes.length} data berhasil diproses.`,
            successCount: successes.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Gagal import data' });
    }
};

// Template Prodi
export const getTemplateProdi = async (req: Request, res: Response) => {
    try {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Prodi');

        worksheet.columns = [
            { header: 'Kode', key: 'kode', width: 15 },
            { header: 'Nama Prodi', key: 'nama', width: 30 },
            { header: 'Jenjang', key: 'jenjang', width: 10 },
            { header: 'Fakultas (Nama/Kode)', key: 'fakultas', width: 30 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        worksheet.addRow({ kode: 'TI', nama: 'Teknik Informatika', jenjang: 'S1', fakultas: 'Fakultas Teknik' });
        worksheet.addRow({ kode: 'SI', nama: 'Sistem Informasi', jenjang: 'S1', fakultas: 'FT' });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="template_prodi.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Template error:', error);
        res.status(500).json({ error: 'Gagal membuat template' });
    }
};

