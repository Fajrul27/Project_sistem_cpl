import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export class SkalaNilaiController {

    // Get all grade scales
    static async getAll(req: Request, res: Response) {
        try {
            const data = await prisma.skalaNilai.findMany({
                orderBy: { nilaiMin: 'desc' }
            });
            return res.json(data);
        } catch (error) {
            console.error('Get Skala Nilai Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Create new grade scale
    static async create(req: Request, res: Response) {
        try {
            const { huruf, nilaiMin, nilaiMax, isLulus } = req.body;

            // Basic validation
            if (!huruf || nilaiMin === undefined || nilaiMax === undefined) {
                return res.status(400).json({ error: 'Semua field harus diisi' });
            }

            const data = await prisma.skalaNilai.create({
                data: {
                    huruf,
                    nilaiMin,
                    nilaiMax,
                    isLulus: isLulus !== undefined ? isLulus : true,
                    isSystem: false,
                    isActive: true
                }
            });
            return res.status(201).json(data);
        } catch (error) {
            console.error('Create Skala Nilai Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Update grade scale
    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { huruf, nilaiMin, nilaiMax, isActive, isLulus } = req.body;

            const existing = await prisma.skalaNilai.findUnique({ where: { id } });
            if (!existing) return res.status(404).json({ error: 'Data not found' });

            // If system default, prevent changing the letter (identity)
            if (existing.isSystem && huruf !== existing.huruf) {
                return res.status(403).json({ error: 'Cannot change letter grade of system default data' });
            }

            const data = await prisma.skalaNilai.update({
                where: { id },
                data: {
                    huruf,
                    nilaiMin,
                    nilaiMax,
                    isActive,
                    isLulus
                }
            });
            return res.json(data);
        } catch (error) {
            console.error('Update Skala Nilai Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // Delete grade scale
    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const existing = await prisma.skalaNilai.findUnique({ where: { id } });

            if (!existing) {
                return res.status(404).json({ error: 'Data not found' });
            }

            if (existing.isSystem) {
                return res.status(403).json({ error: 'Cannot delete system default data' });
            }

            await prisma.skalaNilai.delete({
                where: { id }
            });
            return res.json({ message: 'Deleted successfully' });
        } catch (error) {
            console.error('Delete Skala Nilai Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    static async exportExcel(req: Request, res: Response) {
        try {
            const data = await prisma.skalaNilai.findMany({
                orderBy: { nilaiMin: 'desc' }
            });

            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Skala Nilai');

            worksheet.columns = [
                { header: 'Huruf', key: 'huruf', width: 10 },
                { header: 'Nilai Minimal', key: 'nilaiMin', width: 15 },
                { header: 'Nilai Maksimal', key: 'nilaiMax', width: 15 },
                { header: 'Lulus? (Ya/Tidak)', key: 'isLulus', width: 15 }
            ];

            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            data.forEach((item: any) => {
                worksheet.addRow({
                    huruf: item.huruf,
                    nilaiMin: item.nilaiMin,
                    nilaiMax: item.nilaiMax,
                    isLulus: item.isLulus ? 'Ya' : 'Tidak'
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const timestamp = new Date().toISOString().split('T')[0];
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="skala_nilai_${timestamp}.xlsx"`);
            res.send(buffer);
        } catch (error) {
            console.error('Export error:', error);
            res.status(500).json({ error: 'Gagal export data' });
        }
    }

    static async importExcel(req: Request, res: Response) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'File Excel harus diupload' });
            }

            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(file.buffer as any);
            const worksheet = workbook.getWorksheet('Skala Nilai') || workbook.worksheets[0];

            const errors: string[] = [];
            const successes: any[] = [];
            let rowNumber = 1;

            const rows: any[] = [];
            worksheet.eachRow((row, num) => {
                if (num > 1) rows.push({ num, values: row.values });
            });

            for (const { num, values } of rows) {
                rowNumber = num;
                const [, huruf, nilaiMin, nilaiMax, isLulusText] = values as any[];

                if (!huruf || nilaiMin === undefined || nilaiMax === undefined) {
                    errors.push(`Baris ${rowNumber}: Huruf, Nilai Min, dan Nilai Max wajib diisi`);
                    continue;
                }

                try {
                    const isLulus = isLulusText ? String(isLulusText).toLowerCase().trim() === 'ya' : true;

                    // Check if exists
                    const existing = await prisma.skalaNilai.findFirst({
                        where: { huruf: String(huruf).trim() }
                    });

                    if (existing) {
                        // Prevent updating system records if they are protected
                        if (existing.isSystem) {
                            await prisma.skalaNilai.update({
                                where: { id: existing.id },
                                data: {
                                    nilaiMin: Number(nilaiMin),
                                    nilaiMax: Number(nilaiMax),
                                    isLulus
                                }
                            });
                        } else {
                            await prisma.skalaNilai.update({
                                where: { id: existing.id },
                                data: {
                                    huruf: String(huruf).trim(),
                                    nilaiMin: Number(nilaiMin),
                                    nilaiMax: Number(nilaiMax),
                                    isLulus
                                }
                            });
                        }
                        successes.push({ row: rowNumber, huruf, action: 'updated' });
                    } else {
                        await prisma.skalaNilai.create({
                            data: {
                                huruf: String(huruf).trim(),
                                nilaiMin: Number(nilaiMin),
                                nilaiMax: Number(nilaiMax),
                                isLulus,
                                isSystem: false,
                                isActive: true
                            }
                        });
                        successes.push({ row: rowNumber, huruf, action: 'created' });
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
    }

    static async getTemplate(req: Request, res: Response) {
        try {
            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Skala Nilai');

            worksheet.columns = [
                { header: 'Huruf', key: 'huruf', width: 10 },
                { header: 'Nilai Minimal', key: 'nilaiMin', width: 15 },
                { header: 'Nilai Maksimal', key: 'nilaiMax', width: 15 },
                { header: 'Lulus? (Ya/Tidak)', key: 'isLulus', width: 15 }
            ];

            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            worksheet.addRow({ huruf: 'A', nilaiMin: 80, nilaiMax: 100, isLulus: 'Ya' });
            worksheet.addRow({ huruf: 'B', nilaiMin: 70, nilaiMax: 79.99, isLulus: 'Ya' });
            worksheet.addRow({ huruf: 'C', nilaiMin: 60, nilaiMax: 69.99, isLulus: 'Ya' });
            worksheet.addRow({ huruf: 'D', nilaiMin: 50, nilaiMax: 59.99, isLulus: 'Ya' });
            worksheet.addRow({ huruf: 'E', nilaiMin: 0, nilaiMax: 49.99, isLulus: 'Tidak' });

            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="template_skala_nilai.xlsx"');
            res.send(buffer);
        } catch (error) {
            console.error('Template error:', error);
            res.status(500).json({ error: 'Gagal membuat template' });
        }
    }
}

