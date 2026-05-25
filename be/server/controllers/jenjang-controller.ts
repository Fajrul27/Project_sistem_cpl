import { Request, Response } from 'express';
import { JenjangService } from '../services/JenjangService.js';

export const getAllJenjang = async (req: Request, res: Response) => {
    try {
        const data = await JenjangService.getAllJenjang();
        res.json({ data });
    } catch (error) {
        console.error('Get Jenjang error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Jenjang' });
    }
};

export const createJenjang = async (req: Request, res: Response) => {
    try {
        const { nama, keterangan } = req.body;
        if (!nama) {
            return res.status(400).json({ error: 'Nama Jenjang harus diisi' });
        }

        const newItem = await JenjangService.createJenjang({ nama, keterangan });
        res.status(201).json({ data: newItem, message: 'Jenjang berhasil dibuat' });
    } catch (error: any) {
        console.error('Create Jenjang error:', error);
        res.status(500).json({ error: error.message || 'Gagal membuat Jenjang' });
    }
};

export const updateJenjang = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama, keterangan, isActive } = req.body;

        const updatedItem = await JenjangService.updateJenjang(id, { nama, keterangan, isActive });
        res.json({ data: updatedItem, message: 'Jenjang berhasil diupdate' });
    } catch (error: any) {
        console.error('Update Jenjang error:', error);
        res.status(500).json({ error: error.message || 'Gagal update Jenjang' });
    }
};

export const deleteJenjang = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await JenjangService.deleteJenjang(id);
        res.json({ message: 'Jenjang berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete Jenjang error:', error);
        res.status(500).json({ error: error.message || 'Gagal menghapus Jenjang' });
    }
};

// Export Jenjang as Excel
export const exportJenjang = async (req: Request, res: Response) => {
    try {
        const data = await JenjangService.getAllJenjang();

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Jenjang');

        worksheet.columns = [
            { header: 'Nama Jenjang', key: 'nama', width: 20 },
            { header: 'Keterangan', key: 'keterangan', width: 40 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        data.forEach((item: any) => {
            worksheet.addRow({
                nama: item.nama,
                keterangan: item.keterangan || ''
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="data_jenjang_${timestamp}.xlsx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Gagal export data' });
    }
};

// Import Jenjang from Excel
export const importJenjang = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.getWorksheet('Data Jenjang') || workbook.worksheets[0];

        const errors: string[] = [];
        const successes: any[] = [];
        let rowNumber = 1;

        const rows: any[] = [];
        worksheet.eachRow((row, num) => {
            if (num > 1) rows.push({ num, values: row.values });
        });

        for (const { num, values } of rows) {
            rowNumber = num;
            const [, nama, keterangan] = values as any[];

            if (!nama) {
                errors.push(`Baris ${rowNumber}: Nama Jenjang wajib diisi`);
                continue;
            }

            try {
                // Check if exists
                const all = await JenjangService.getAllJenjang();
                const existing = all.find((j: any) => j.nama.toLowerCase() === String(nama).trim().toLowerCase());
                
                if (existing) {
                    await JenjangService.updateJenjang(existing.id, {
                        keterangan: keterangan ? String(keterangan).trim() : (existing.keterangan ?? undefined)
                    });
                    successes.push({ row: rowNumber, nama, action: 'updated' });
                } else {
                    await JenjangService.createJenjang({
                        nama: String(nama).trim(),
                        keterangan: keterangan ? String(keterangan).trim() : ''
                    });
                    successes.push({ row: rowNumber, nama, action: 'created' });
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

// Template Jenjang
export const getTemplateJenjang = async (req: Request, res: Response) => {
    try {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Jenjang');

        worksheet.columns = [
            { header: 'Nama Jenjang', key: 'nama', width: 20 },
            { header: 'Keterangan', key: 'keterangan', width: 40 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        worksheet.addRow({ nama: 'S1', keterangan: 'Sarjana' });
        worksheet.addRow({ nama: 'D3', keterangan: 'Diploma 3' });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="template_jenjang.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Template error:', error);
        res.status(500).json({ error: 'Gagal membuat template' });
    }
};

