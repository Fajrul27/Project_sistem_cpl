import { Request, Response } from 'express';
import { CPLService } from '../services/CPLService.js';
import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma.js';

import { getCellValue } from '../utils/excel-utils.js';

// Get all CPL
export const getAllCpl = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { prodiId, page, limit, q } = req.query;

        const result = await CPLService.getAllCpl({
            userId,
            userRole,
            prodiId: prodiId as string,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            q: q as string,
            kategori: (req.query.kategori as string),
            kurikulumId: (req.query.kurikulumId as string)
        });

        res.json(result);
    } catch (error) {
        console.error('Get CPL error:', error);
        res.status(500).json({ error: 'Gagal mengambil data CPL' });
    }
};

// Get CPL by ID
export const getCplById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cpl = await CPLService.getCplById(id);
        res.json({ data: cpl });
    } catch (error: any) {
        console.error('Get CPL by ID error:', error);
        if (error.message === 'CPL tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mengambil data CPL' });
    }
};

// Get CPL Stats
export const getCplStats = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const stats = await CPLService.getCplStats(id);
        res.json(stats);
    } catch (error) {
        console.error('Get CPL Stats error:', error);
        res.status(500).json({ error: 'Gagal mengambil statistik CPL' });
    }
};

// Create CPL
export const createCpl = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const cpl = await CPLService.createCpl(req.body, userId, userRole);

        res.status(201).json({
            data: cpl,
            message: 'CPL berhasil dibuat'
        });
    } catch (error: any) {
        console.error('Create CPL error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'Profil Kaprodi tidak memiliki Program Studi') {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal membuat CPL' });
    }
};

// Update CPL
export const updateCpl = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const cpl = await CPLService.updateCpl(id, req.body, userId, userRole);

        res.json({
            data: cpl,
            message: 'CPL berhasil diupdate'
        });
    } catch (error: any) {
        console.error('Update CPL error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'CPL tidak ditemukan') return res.status(404).json({ error: error.message });
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ error: 'Anda hanya dapat mengubah CPL dari program studi Anda' });
        }
        res.status(500).json({ error: 'Gagal mengupdate CPL' });
    }
};

// Delete CPL
export const deleteCpl = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        await CPLService.deleteCpl(id, userId, userRole);

        res.json({ message: 'CPL berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete CPL error:', error);
        if (error.message === 'CPL tidak ditemukan') return res.status(404).json({ error: error.message });
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ error: 'Anda hanya dapat menghapus CPL dari program studi Anda' });
        }
        if (error.message.startsWith('USED_IN_GRADES')) {
            const count = error.message.split(':')[1];
            return res.status(403).json({
                error: 'CPL tidak dapat dihapus karena sudah digunakan untuk penilaian',
                detail: `Terdapat ${count} nilai mahasiswa yang terkait dengan CPL ini`
            });
        }
        res.status(500).json({ error: 'Gagal menghapus CPL' });
    }
};

// Export CPL as Excel
export const exportCpl = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { prodiId, kategori, kurikulumId } = req.query;

        const result = await CPLService.getAllCpl({
            userId,
            userRole,
            prodiId: prodiId as string,
            kategori: kategori as string,
            kurikulumId: kurikulumId as string,
            page: 1,
            limit: -1,
            q: ''
        });

        const cplList = result.data || [];

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('CPL');

        worksheet.columns = [
            { header: 'Kode CPL', key: 'kodeCpl', width: 15 },
            { header: 'Deskripsi', key: 'deskripsi', width: 50 },
            { header: 'Kategori', key: 'kategori', width: 20 },
            { header: 'Program Studi', key: 'programStudi', width: 30 },
            { header: 'Profil Lulusan', key: 'profilLulusan', width: 40 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        cplList.forEach((cpl: any) => {
            worksheet.addRow({
                kodeCpl: cpl.kodeCpl,
                deskripsi: cpl.deskripsi,
                kategori: cpl.kategoriCpl?.nama || '',
                programStudi: cpl.prodi?.nama || '',
                profilLulusan: cpl.profilLulusan?.map((pl: any) => pl.deskripsi).join('; ') || ''
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `cpl_${timestamp}.xlsx`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error('Export CPL error:', error);
        res.status(500).json({ error: 'Gagal export data CPL' });
    }
};

// Import CPL from Excel
export const importCpl = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.getWorksheet('CPL');

        if (!worksheet) {
            return res.status(400).json({ error: 'Sheet "CPL" tidak ditemukan dalam file Excel' });
        }

        const errors: string[] = [];
        const successes: any[] = [];

        const sheetValues = worksheet.getSheetValues() as any[];
        
        for (let i = 2; i < sheetValues.length; i++) {
            const rowData = sheetValues[i];
            if (!rowData || rowData.length === 0) continue;
            
            // rowData is 1-indexed from ExcelJS getSheetValues
            // Col A: No, Col B: Kode CPL, Col C: Deskripsi, Col D: Kategori, Col E: Prodi, Col F: Kurikulum
            const kodeCpl = getCellValue(rowData[2]);
            const deskripsi = getCellValue(rowData[3]);
            const kategori = getCellValue(rowData[4]);
            const programStudi = getCellValue(rowData[5]);
            const kurikulum = getCellValue(rowData[6]);

            if (!kodeCpl && !deskripsi) continue; // Skip empty rows

            if (!kodeCpl || !deskripsi) {
                errors.push(`Baris ${i}: Kode CPL dan Deskripsi harus diisi`);
                continue;
            }

            try {
                let kategoriId, prodiId, kurikulumId;

                // 1. Find Kategori
                if (kategori) {
                    const kategoriData = await prisma.kategoriCpl.findFirst({
                        where: { nama: { equals: kategori.trim() } }
                    });
                    kategoriId = kategoriData?.id;
                    if (!kategoriId) {
                        // Fallback case-insensitive
                        const allKategori = await prisma.kategoriCpl.findMany();
                        const match = allKategori.find(k => k.nama.toLowerCase() === kategori.toLowerCase().trim());
                        kategoriId = match?.id;
                    }
                }

                // 2. Find Prodi
                if (programStudi) {
                    const trimmedProdi = programStudi.trim();
                    const prodiData = await prisma.prodi.findFirst({
                        where: {
                            OR: [
                                { nama: { equals: trimmedProdi } },
                                { kode: { equals: trimmedProdi } },
                                // Match combined "Jenjang Nama" e.g. "S1 Informatika"
                                { 
                                    AND: [
                                        { jenjang: { equals: trimmedProdi.split(' ')[0] } },
                                        { nama: { contains: trimmedProdi.split(' ').slice(1).join(' ') } }
                                    ]
                                }
                            ]
                        }
                    });
                    prodiId = prodiData?.id;

                    if (!prodiId) {
                        // Advanced fallback: check all prodis manually for "Jenjang Nama"
                        const allProdis = await prisma.prodi.findMany();
                        const match = allProdis.find(p => {
                            const full = `${p.jenjang} ${p.nama}`.toLowerCase();
                            return full === trimmedProdi.toLowerCase() || p.nama.toLowerCase() === trimmedProdi.toLowerCase();
                        });
                        prodiId = match?.id;
                    }
                }

                // 3. Find Kurikulum
                if (kurikulum) {
                    const kurikulumData = await prisma.kurikulum.findFirst({
                        where: { nama: { contains: kurikulum.trim() } }
                    });
                    kurikulumId = kurikulumData?.id;
                }

                const existingCPL = await prisma.cpl.findFirst({
                    where: { kodeCpl: kodeCpl }
                });

                const cplData = {
                    kodeCpl: kodeCpl,
                    deskripsi: deskripsi,
                    kategori: kategori, // Save string for display
                    kategoriId: kategoriId || null,
                    prodiId: prodiId || null,
                    kurikulumId: kurikulumId || null
                };

                if (existingCPL) {
                    await CPLService.updateCpl(existingCPL.id, cplData, userId, userRole);
                    successes.push({ row: i, kodeCpl, action: 'updated' });
                } else {
                    await CPLService.createCpl(cplData, userId, userRole);
                    successes.push({ row: i, kodeCpl, action: 'created' });
                }

            } catch (error: any) {
                console.error(`Error at row ${i}:`, error);
                errors.push(`Baris ${i} (${kodeCpl}): ${error.message || 'Gagal menyimpan data'}`);
            }
        }

        res.json({
            message: `Import selesai. ${successes.length} data berhasil diproses.`,
            successCount: successes.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import CPL error:', error);
        res.status(500).json({ error: 'Gagal import data CPL' });
    }
};

// Generate Template Excel for CPL
export const getTemplateCpl = async (req: Request, res: Response) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('CPL');

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Kode CPL', key: 'kodeCpl', width: 15 },
            { header: 'Deskripsi', key: 'deskripsi', width: 50 },
            { header: 'Kategori', key: 'kategori', width: 25 },
            { header: 'Program Studi', key: 'programStudi', width: 30 },
            { header: 'Kurikulum', key: 'kurikulum', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add dummy data for first row
        worksheet.addRow({
            no: 1,
            kodeCpl: 'CPL-01',
            deskripsi: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif',
            kategori: 'Sikap',
            programStudi: 'Teknik Informatika',
            kurikulum: 'Kurikulum 2024'
        });

        // Add notes or data validation
        const noteRow = worksheet.addRow({
            no: '',
            kodeCpl: '* Wajib Diisi',
            deskripsi: '* Wajib Diisi',
            kategori: '* Opsional (Gunakan nama kategori)',
            programStudi: '* Wajib Sesuai Master Data',
            kurikulum: '* Wajib Sesuai Master Data'
        });
        noteRow.font = { italic: true, color: { argb: 'FFFF0000' } };

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Template_Import_CPL.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({ error: 'Gagal membuat file template' });
    }
};
