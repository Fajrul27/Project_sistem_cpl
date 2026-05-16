import { Request, Response } from 'express';
import { AcademicService } from '../services/AcademicService.js';

// Get all Fakultas
export const getAllFakultas = async (req: Request, res: Response) => {
    try {
        const fakultas = await AcademicService.getAllFakultas();
        res.json({ data: fakultas });
    } catch (error) {
        console.error('Get Fakultas error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Fakultas' });
    }
};

// Create Fakultas
export const createFakultas = async (req: Request, res: Response) => {
    try {
        const { kode, nama } = req.body;
        if (!kode || !nama) {
            return res.status(400).json({ error: 'Kode dan Nama Fakultas harus diisi' });
        }

        const newFakultas = await AcademicService.createFakultas({ kode, nama });
        res.status(201).json({ data: newFakultas, message: 'Fakultas berhasil dibuat' });
    } catch (error: any) {
        console.error('Create Fakultas error:', error);
        res.status(500).json({ error: error.message || 'Gagal membuat Fakultas' });
    }
};

// Update Fakultas
export const updateFakultas = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { kode, nama } = req.body;

        const updatedFakultas = await AcademicService.updateFakultas(id, { kode, nama });
        res.json({ data: updatedFakultas, message: 'Fakultas berhasil diupdate' });
    } catch (error: any) {
        console.error('Update Fakultas error:', error);
        res.status(500).json({ error: error.message || 'Gagal update Fakultas' });
    }
};

// Delete Fakultas
export const deleteFakultas = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await AcademicService.deleteFakultas(id);
        res.json({ message: 'Fakultas berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete Fakultas error:', error);
        res.status(500).json({ error: error.message || 'Gagal menghapus Fakultas' });
    }
};

// Export Fakultas as Excel
export const exportFakultas = async (req: Request, res: Response) => {
    try {
        const fakultas = await AcademicService.getAllFakultas();

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Fakultas');

        worksheet.columns = [
            { header: 'Kode', key: 'kode', width: 15 },
            { header: 'Nama Fakultas', key: 'nama', width: 40 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        fakultas.forEach((item: any) => {
            worksheet.addRow({
                kode: item.kode,
                nama: item.nama
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="data_fakultas_${timestamp}.xlsx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Gagal export data' });
    }
};

// Import Fakultas from Excel
export const importFakultas = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.getWorksheet('Data Fakultas') || workbook.worksheets[0];

        const errors: string[] = [];
        const successes: any[] = [];
        let rowNumber = 1;

        const rows: any[] = [];
        worksheet.eachRow((row, num) => {
            if (num > 1) rows.push({ num, values: row.values });
        });

        for (const { num, values } of rows) {
            rowNumber = num;
            const [, kode, nama] = values as any[];

            if (!kode || !nama) {
                errors.push(`Baris ${rowNumber}: Kode dan Nama wajib diisi`);
                continue;
            }

            try {
                // Check if exists
                const existing = await AcademicService.getFakultasByKode(String(kode).trim());
                if (existing) {
                    await AcademicService.updateFakultas(existing.id, {
                        nama: String(nama).trim()
                    });
                    successes.push({ row: rowNumber, kode, action: 'updated' });
                } else {
                    await AcademicService.createFakultas({
                        kode: String(kode).trim(),
                        nama: String(nama).trim()
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

// Template Fakultas
export const getTemplateFakultas = async (req: Request, res: Response) => {
    try {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Fakultas');

        worksheet.columns = [
            { header: 'Kode', key: 'kode', width: 15 },
            { header: 'Nama Fakultas', key: 'nama', width: 40 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        worksheet.addRow({ kode: 'FT', nama: 'Fakultas Teknik' });
        worksheet.addRow({ kode: 'FE', nama: 'Fakultas Ekonomi' });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="template_fakultas.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Template error:', error);
        res.status(500).json({ error: 'Gagal membuat template' });
    }
};

