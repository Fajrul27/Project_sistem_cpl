import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getAllAngkatan = async (req: Request, res: Response) => {
    try {
        const angkatan = await prisma.angkatan.findMany({
            orderBy: { tahun: 'desc' },
            include: {
                kurikulum: true
            }
        });
        res.json({ data: angkatan });
    } catch (error) {
        console.error('Get angkatan error:', error);
        res.status(500).json({ error: 'Gagal mengambil data angkatan' });
    }
};

export const createAngkatan = async (req: Request, res: Response) => {
    try {
        const { tahun, isActive, kurikulumId } = req.body;

        if (!tahun) {
            return res.status(400).json({ error: 'Tahun angkatan wajib diisi' });
        }

        const existing = await prisma.angkatan.findUnique({
            where: { tahun: parseInt(tahun) }
        });

        if (existing) {
            return res.status(400).json({ error: 'Angkatan dengan tahun ini sudah ada' });
        }

        const angkatan = await prisma.angkatan.create({
            data: {
                tahun: parseInt(tahun),
                isActive: isActive ?? true,
                kurikulumId: kurikulumId || null
            }
        });

        res.status(201).json({ data: angkatan });
    } catch (error) {
        console.error('Create angkatan error:', error);
        res.status(500).json({ error: 'Gagal membuat angkatan' });
    }
};

export const updateAngkatan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { tahun, isActive, kurikulumId } = req.body;

        const angkatan = await prisma.angkatan.update({
            where: { id },
            data: {
                tahun: tahun ? parseInt(tahun) : undefined,
                isActive,
                kurikulumId: kurikulumId || null
            }
        });

        res.json({ data: angkatan });
    } catch (error) {
        console.error('Update angkatan error:', error);
        res.status(500).json({ error: 'Gagal mengupdate angkatan' });
    }
};

export const deleteAngkatan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.angkatan.delete({
            where: { id }
        });

        res.json({ message: 'Angkatan berhasil dihapus' });
    } catch (error) {
        console.error('Delete angkatan error:', error);
        res.status(500).json({ error: 'Gagal menghapus angkatan' });
    }
};

// Export Angkatan as Excel
export const exportAngkatan = async (req: Request, res: Response) => {
    try {
        const angkatan = await prisma.angkatan.findMany({
            orderBy: { tahun: 'desc' },
            include: { kurikulum: true }
        });

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Angkatan');

        worksheet.columns = [
            { header: 'Tahun', key: 'tahun', width: 15 },
            { header: 'Status (Aktif/Non-aktif)', key: 'status', width: 20 },
            { header: 'Kurikulum', key: 'kurikulum', width: 30 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        angkatan.forEach((item: any) => {
            worksheet.addRow({
                tahun: item.tahun,
                status: item.isActive ? 'Aktif' : 'Non-aktif',
                kurikulum: item.kurikulum ? `${item.kurikulum.nama} (${item.kurikulum.tahunMulai})` : ''
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="data_angkatan_${timestamp}.xlsx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Gagal export data' });
    }
};

// Import Angkatan from Excel
export const importAngkatan = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.getWorksheet('Data Angkatan') || workbook.worksheets[0];

        const errors: string[] = [];
        const successes: any[] = [];
        let rowNumber = 1;

        const rows: any[] = [];
        worksheet.eachRow((row, num) => {
            if (num > 1) rows.push({ num, values: row.values });
        });

        // Preload kurikulum mapping
        const allKurikulum = await prisma.kurikulum.findMany();
        const kurikulumMap = new Map();
        allKurikulum.forEach(k => {
            kurikulumMap.set(k.nama.toLowerCase(), k.id);
            kurikulumMap.set(`${k.nama} (${k.tahunMulai})`.toLowerCase(), k.id);
        });

        for (const { num, values } of rows) {
            rowNumber = num;
            const [, tahun, status, namaKurikulum] = values as any[];

            if (!tahun) {
                errors.push(`Baris ${rowNumber}: Tahun wajib diisi`);
                continue;
            }

            try {
                const tahunInt = parseInt(String(tahun));
                if (isNaN(tahunInt)) {
                    errors.push(`Baris ${rowNumber}: Tahun tidak valid`);
                    continue;
                }

                let kurikulumId = null;
                if (namaKurikulum) {
                    kurikulumId = kurikulumMap.get(String(namaKurikulum).toLowerCase().trim()) || null;
                }

                const isActive = status ? String(status).toLowerCase().trim() === 'aktif' : true;

                // Check if exists
                const existing = await prisma.angkatan.findUnique({
                    where: { tahun: tahunInt }
                });

                if (existing) {
                    await prisma.angkatan.update({
                        where: { id: existing.id },
                        data: {
                            isActive,
                            kurikulumId
                        }
                    });
                    successes.push({ row: rowNumber, tahun: tahunInt, action: 'updated' });
                } else {
                    await prisma.angkatan.create({
                        data: {
                            tahun: tahunInt,
                            isActive,
                            kurikulumId
                        }
                    });
                    successes.push({ row: rowNumber, tahun: tahunInt, action: 'created' });
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

// Template Angkatan
export const getTemplateAngkatan = async (req: Request, res: Response) => {
    try {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Angkatan');

        worksheet.columns = [
            { header: 'Tahun', key: 'tahun', width: 15 },
            { header: 'Status (Aktif/Non-aktif)', key: 'status', width: 20 },
            { header: 'Kurikulum (Nama)', key: 'kurikulum', width: 30 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        worksheet.addRow({ tahun: 2024, status: 'Aktif', kurikulum: 'Kurikulum 2024' });
        worksheet.addRow({ tahun: 2023, status: 'Aktif', kurikulum: 'Kurikulum 2020' });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="template_angkatan.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Template error:', error);
        res.status(500).json({ error: 'Gagal membuat template' });
    }
};

