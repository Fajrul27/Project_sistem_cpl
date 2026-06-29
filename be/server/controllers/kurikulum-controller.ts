
import { Request, Response } from 'express';
import { ReferenceService } from '../services/ReferenceService.js';

export const getAllKurikulum = async (req: Request, res: Response) => {
    try {
        const filters: { isActive?: boolean } = {};
        if (req.query.isActive !== undefined) {
            filters.isActive = req.query.isActive === 'true';
        }
        const kurikulum = await ReferenceService.getAllKurikulum(filters);
        res.json({ data: kurikulum });
    } catch (error) {
        console.error('Get kurikulum error:', error);
        res.status(500).json({ error: 'Gagal mengambil data kurikulum' });
    }
};

export const createKurikulum = async (req: Request, res: Response) => {
    try {
        const { nama, tahunMulai, tahunSelesai, isActive } = req.body;
        const kurikulum = await ReferenceService.createKurikulum({
            nama,
            tahunMulai: parseInt(tahunMulai),
            tahunSelesai: tahunSelesai ? parseInt(tahunSelesai) : undefined,
            isActive: isActive === true || isActive === 'true'
        });
        res.status(201).json({ data: kurikulum });
    } catch (error) {
        console.error('Create kurikulum error:', error);
        res.status(500).json({ error: 'Gagal membuat kurikulum' });
    }
};

export const updateKurikulum = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { nama, tahunMulai, tahunSelesai, isActive } = req.body;
        const kurikulum = await ReferenceService.updateKurikulum(id, {
            nama,
            tahunMulai: parseInt(tahunMulai),
            tahunSelesai: tahunSelesai ? parseInt(tahunSelesai) : undefined,
            isActive: isActive === true || isActive === 'true'
        });
        res.json({ data: kurikulum });
    } catch (error) {
        console.error('Update kurikulum error:', error);
        res.status(500).json({ error: 'Gagal mengupdate kurikulum' });
    }
};

export const deleteKurikulum = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ReferenceService.deleteKurikulum(id);
        res.json({ message: 'Kurikulum berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete kurikulum error:', error);
        if (error?.code === 'P2003' || (error?.message && error.message.includes('P2003'))) {
            return res.status(400).json({ error: 'Data tidak bisa dihapus karena masih terikat dengan data lain dalam sistem.' });
        }
        if (error?.message && error.message.includes('terhubung dengan')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal menghapus kurikulum' });
    }
};

// Export Kurikulum as Excel
export const exportKurikulum = async (req: Request, res: Response) => {
    try {
        const kurikulum = await ReferenceService.getAllKurikulum();

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Kurikulum');

        worksheet.columns = [
            { header: 'Nama Kurikulum', key: 'nama', width: 30 },
            { header: 'Tahun Mulai', key: 'tahunMulai', width: 15 },
            { header: 'Tahun Selesai', key: 'tahunSelesai', width: 15 },
            { header: 'Status (Aktif/Non-aktif)', key: 'status', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        kurikulum.forEach((item: any) => {
            worksheet.addRow({
                nama: item.nama,
                tahunMulai: item.tahunMulai,
                tahunSelesai: item.tahunSelesai || '',
                status: item.isActive ? 'Aktif' : 'Non-aktif'
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="data_kurikulum_${timestamp}.xlsx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Gagal export data' });
    }
};

// Import Kurikulum from Excel
export const importKurikulum = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.getWorksheet('Data Kurikulum') || workbook.worksheets[0];

        const errors: string[] = [];
        const successes: any[] = [];
        let rowNumber = 1;

        const rows: any[] = [];
        worksheet.eachRow((row, num) => {
            if (num > 1) rows.push({ num, values: row.values });
        });

        const all = await ReferenceService.getAllKurikulum();

        for (const { num, values } of rows) {
            rowNumber = num;
            const [, nama, tahunMulai, tahunSelesai, status] = values as any[];

            if (!nama || !tahunMulai) {
                errors.push(`Baris ${rowNumber}: Nama dan Tahun Mulai wajib diisi`);
                continue;
            }

            try {
                const isActive = status ? String(status).toLowerCase().trim() === 'aktif' : true;
                const existing = all.find((k: any) => k.nama.toLowerCase() === String(nama).trim().toLowerCase());

                if (existing) {
                    await ReferenceService.updateKurikulum(existing.id, {
                        nama: String(nama).trim(),
                        tahunMulai: parseInt(String(tahunMulai)),
                        tahunSelesai: tahunSelesai ? parseInt(String(tahunSelesai)) : undefined,
                        isActive
                    });
                    successes.push({ row: rowNumber, nama, action: 'updated' });
                } else {
                    await ReferenceService.createKurikulum({
                        nama: String(nama).trim(),
                        tahunMulai: parseInt(String(tahunMulai)),
                        tahunSelesai: tahunSelesai ? parseInt(String(tahunSelesai)) : undefined,
                        isActive
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

// Template Kurikulum
export const getTemplateKurikulum = async (req: Request, res: Response) => {
    try {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Kurikulum');

        worksheet.columns = [
            { header: 'Nama Kurikulum', key: 'nama', width: 30 },
            { header: 'Tahun Mulai', key: 'tahunMulai', width: 15 },
            { header: 'Tahun Selesai', key: 'tahunSelesai', width: 15 },
            { header: 'Status (Aktif/Non-aktif)', key: 'status', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        worksheet.addRow({ nama: 'Kurikulum 2024', tahunMulai: 2024, tahunSelesai: 2028, status: 'Aktif' });
        worksheet.addRow({ nama: 'Kurikulum 2020', tahunMulai: 2020, tahunSelesai: 2024, status: 'Non-aktif' });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="template_kurikulum.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Template error:', error);
        res.status(500).json({ error: 'Gagal membuat template' });
    }
};

