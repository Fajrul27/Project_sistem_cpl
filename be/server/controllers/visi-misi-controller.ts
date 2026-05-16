
import { Request, Response } from 'express';
import { VisiMisiService } from '../services/VisiMisiService.js';
import { getCellValue } from '../utils/excel-utils.js';

// Get Visi Misi
export const getVisiMisi = async (req: Request, res: Response) => {
    try {
        const { prodiId } = req.query;
        const data = await VisiMisiService.getVisiMisi(prodiId ? String(prodiId) : undefined);
        res.json({ data });
    } catch (error) {
        console.error('Error fetching Visi Misi:', error);
        res.status(500).json({ error: 'Gagal mengambil data Visi Misi' });
    }
};

// Create Visi Misi
export const createVisiMisi = async (req: Request, res: Response) => {
    try {
        const newItem = await VisiMisiService.createVisiMisi(req.body);
        res.status(201).json(newItem);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Error creating Visi Misi:', error);
        res.status(500).json({ error: 'Gagal menyimpan Visi Misi' });
    }
};

// Update Visi Misi
export const updateVisiMisi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedItem = await VisiMisiService.updateVisiMisi(id, req.body);
        res.json(updatedItem);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        console.error('Error updating Visi Misi:', error);
        res.status(500).json({ error: 'Gagal mengupdate Visi Misi' });
    }
};

// Delete Visi Misi
export const deleteVisiMisi = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await VisiMisiService.deleteVisiMisi(id);
        res.json({ message: 'Berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting Visi Misi:', error);
        res.status(500).json({ error: 'Gagal menghapus Visi Misi' });
    }
};

// Export Visi Misi as Excel
export const exportVisiMisi = async (req: Request, res: Response) => {
    try {
        const { prodiId } = req.query;
        const data = await VisiMisiService.getVisiMisi(prodiId ? String(prodiId) : undefined);

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Visi & Misi');

        worksheet.columns = [
            { header: 'Tipe', key: 'tipe', width: 10 },
            { header: 'Teks', key: 'teks', width: 50 },
            { header: 'Urutan', key: 'urutan', width: 10 },
            { header: 'Prodi', key: 'prodi', width: 30 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        data.forEach((item: any) => {
            worksheet.addRow({
                tipe: item.tipe,
                teks: item.teks,
                urutan: item.urutan,
                prodi: item.prodi?.nama || ''
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="visi_misi_${timestamp}.xlsx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Gagal export data' });
    }
};

// Import Visi Misi from Excel
export const importVisiMisi = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.getWorksheet('Visi & Misi') || workbook.worksheets[0];

        const errors: string[] = [];
        const successes: any[] = [];
        let rowNumber = 1;

        const rows: any[] = [];
        worksheet.eachRow((row, num) => {
            if (num > 1) rows.push({ num, values: row.values });
        });

        // Preload prodi mapping
        const { prisma } = await import('../lib/prisma.js');
        const allProdi = await prisma.prodi.findMany();
        const prodiMap = new Map();
        allProdi.forEach(p => {
            if (p.nama) prodiMap.set(p.nama.toLowerCase(), p.id);
            if (p.kode) prodiMap.set(p.kode.toLowerCase(), p.id);
        });

        for (const { num, values } of rows) {
            rowNumber = num;
            const tipe = getCellValue(values[1]);
            const teks = getCellValue(values[2]);
            const urutan = getCellValue(values[3]);
            const namaProdi = getCellValue(values[4]);

            if (!tipe || !teks || !namaProdi) {
                if (tipe || teks || namaProdi) {
                    errors.push(`Baris ${rowNumber}: Tipe, Teks, dan Prodi wajib diisi`);
                }
                continue;
            }

            const normalizedTipe = String(tipe).toLowerCase().trim();
            if (normalizedTipe !== 'visi' && normalizedTipe !== 'misi') {
                errors.push(`Baris ${rowNumber}: Tipe harus "visi" atau "misi"`);
                continue;
            }

            try {
                const prodiId = prodiMap.get(String(namaProdi).toLowerCase().trim());
                if (!prodiId) {
                    errors.push(`Baris ${rowNumber}: Prodi "${namaProdi}" tidak ditemukan`);
                    continue;
                }

                // For 'visi', usually only one per prodi
                if (normalizedTipe === 'visi') {
                    const existingVisi = await prisma.visiMisi.findFirst({
                        where: { prodiId, tipe: 'visi' }
                    });
                    if (existingVisi) {
                        await VisiMisiService.updateVisiMisi(existingVisi.id, { teks: String(teks).trim() });
                        successes.push({ row: rowNumber, type: 'visi', action: 'updated' });
                        continue;
                    }
                }

                await VisiMisiService.createVisiMisi({
                    tipe: normalizedTipe as 'visi' | 'misi',
                    teks: String(teks).trim(),
                    urutan: urutan ? Number(urutan) : 1,
                    prodiId
                });
                successes.push({ row: rowNumber, type: normalizedTipe, action: 'created' });
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

// Template Visi Misi
export const getTemplateVisiMisi = async (req: Request, res: Response) => {
    try {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Visi & Misi');

        worksheet.columns = [
            { header: 'Tipe (visi/misi)', key: 'tipe', width: 15 },
            { header: 'Teks', key: 'teks', width: 50 },
            { header: 'Urutan (Khusus Misi)', key: 'urutan', width: 20 },
            { header: 'Prodi (Nama/Kode)', key: 'prodi', width: 30 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        worksheet.addRow({ tipe: 'visi', teks: 'Menjadi program studi yang unggul...', urutan: 1, prodi: 'Teknik Informatika' });
        worksheet.addRow({ tipe: 'misi', teks: 'Menyelenggarakan pendidikan berkualitas...', urutan: 1, prodi: 'TI' });
        worksheet.addRow({ tipe: 'misi', teks: 'Melaksanakan penelitian...', urutan: 2, prodi: 'TI' });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="template_visi_misi.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Template error:', error);
        res.status(500).json({ error: 'Gagal membuat template' });
    }
};

