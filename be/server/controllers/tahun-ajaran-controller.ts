import { Request, Response } from "express";
import { TahunAjaranService } from "../services/TahunAjaranService.js";
import { z } from "zod";

const createSchema = z.object({
    nama: z.string().min(1, "Nama Tahun Ajaran wajib diisi"),
    isActive: z.boolean().optional()
});

const updateSchema = z.object({
    nama: z.string().optional(),
    isActive: z.boolean().optional()
});

export class TahunAjaranController {
    static async getAll(req: Request, res: Response) {
        try {
            const data = await TahunAjaranService.getAll();
            res.json(data);
        } catch (error) {
            console.error("Error fetching tahun ajaran:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const data = createSchema.parse(req.body);
            const result = await TahunAjaranService.create(data);
            res.status(201).json(result);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues });
            } else {
                console.error("Error creating tahun ajaran:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = updateSchema.parse(req.body);
            const result = await TahunAjaranService.update(id, data);
            res.json(result);
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({ error: error.issues });
            } else {
                console.error("Error updating tahun ajaran:", error);
                res.status(500).json({ error: "Internal server error" });
            }
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await TahunAjaranService.delete(id);
            res.json({ message: "Tahun Ajaran deleted successfully" });
        } catch (error: any) {
            console.error("Error deleting tahun ajaran:", error);
            if (error?.code === 'P2003' || (error?.message && error.message.includes('P2003'))) {
                return res.status(400).json({ error: "Data tidak bisa dihapus karena masih terikat dengan data lain (contoh: Nilai Mahasiswa, KRS)." });
            }
            // Fallback for manual thrown errors from service
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: "Gagal menghapus. Data mungkin sedang digunakan." });
        }
    }

    static async exportExcel(req: Request, res: Response) {
        try {
            const data = await TahunAjaranService.getAll();

            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data Tahun Ajaran');

            worksheet.columns = [
                { header: 'Nama Tahun Ajaran', key: 'nama', width: 25 },
                { header: 'Status (Aktif/Non-aktif)', key: 'status', width: 20 }
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
                    status: item.isActive ? 'Aktif' : 'Non-aktif'
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const timestamp = new Date().toISOString().split('T')[0];
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="data_tahun_ajaran_${timestamp}.xlsx"`);
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
            const worksheet = workbook.getWorksheet('Data Tahun Ajaran') || workbook.worksheets[0];

            const errors: string[] = [];
            const successes: any[] = [];
            let rowNumber = 1;

            const rows: any[] = [];
            worksheet.eachRow((row, num) => {
                if (num > 1) rows.push({ num, values: row.values });
            });

            const all = await TahunAjaranService.getAll();

            for (const { num, values } of rows) {
                rowNumber = num;
                const [, nama, status] = values as any[];

                if (!nama) {
                    errors.push(`Baris ${rowNumber}: Nama Tahun Ajaran wajib diisi`);
                    continue;
                }

                try {
                    const isActive = status ? String(status).toLowerCase().trim() === 'aktif' : true;
                    const existing = all.find((t: any) => t.nama.toLowerCase() === String(nama).trim().toLowerCase());

                    if (existing) {
                        await TahunAjaranService.update(existing.id, { isActive });
                        successes.push({ row: rowNumber, nama, action: 'updated' });
                    } else {
                        await TahunAjaranService.create({
                            nama: String(nama).trim(),
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
    }

    static async getTemplate(req: Request, res: Response) {
        try {
            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data Tahun Ajaran');

            worksheet.columns = [
                { header: 'Nama Tahun Ajaran', key: 'nama', width: 25 },
                { header: 'Status (Aktif/Non-aktif)', key: 'status', width: 20 }
            ];

            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };

            worksheet.addRow({ nama: '2023/2024 Ganjil', status: 'Aktif' });
            worksheet.addRow({ nama: '2023/2024 Genap', status: 'Aktif' });

            const buffer = await workbook.xlsx.writeBuffer();
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="template_tahun_ajaran.xlsx"');
            res.send(buffer);
        } catch (error) {
            console.error('Template error:', error);
            res.status(500).json({ error: 'Gagal membuat template' });
        }
    }
}

