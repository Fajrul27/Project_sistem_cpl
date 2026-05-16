import { Request, Response } from 'express';
import { CPMKService } from '../services/CPMKService.js';
import ExcelJS from 'exceljs';
import * as xlsx from 'xlsx';
import { prisma } from '../lib/prisma.js';
import { getCellValue } from '../utils/excel-utils.js';

// Get all CPMK (with optional mata kuliah filter)
export const getAllCpmk = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { mataKuliahId, prodiId, fakultasId, semester, page, limit, q } = req.query;

        const result = await CPMKService.getAllCpmk({
            userId,
            userRole,
            mataKuliahId: mataKuliahId as string,
            prodiId: prodiId as string,
            fakultasId: fakultasId as string,
            semester: semester as string,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            q: q as string
        });

        res.json(result);
    } catch (error: any) {
        console.error('Get CPMK error:', error);
        if (error.message === 'FORBIDDEN_MK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }
        res.status(500).json({ error: 'Gagal mengambil data CPMK' });
    }
};

// Get CPMK by Mata Kuliah ID
export const getCpmkByMataKuliah = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { mkId } = req.params;

        const cpmk = await CPMKService.getCpmkByMataKuliah(mkId, userId, userRole);
        res.json({ data: cpmk });
    } catch (error: any) {
        console.error('Get CPMK by MK error:', error);
        if (error.message === 'FORBIDDEN_MK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }
        res.status(500).json({ error: 'Gagal mengambil data CPMK' });
    }
};

// Get CPMK by ID (with full details)
export const getCpmkById = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { id } = req.params;

        const cpmk = await CPMKService.getCpmkById(id, userId, userRole);
        res.json({ data: cpmk });
    } catch (error: any) {
        console.error('Get CPMK by ID error:', error);
        if (error.message === 'CPMK tidak ditemukan') return res.status(404).json({ error: error.message });
        if (error.message === 'FORBIDDEN_CPMK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke CPMK ini' });
        }
        res.status(500).json({ error: 'Gagal mengambil data CPMK' });
    }
};

// Create CPMK
export const createCpmk = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const cpmk = await CPMKService.createCpmk(req.body, userId, userRole);

        res.status(201).json({ data: cpmk, message: 'CPMK berhasil dibuat' });
    } catch (error: any) {
        console.error('Create CPMK error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'Kode CPMK dan Mata Kuliah harus diisi') return res.status(400).json({ error: error.message });
        if (error.message === 'FORBIDDEN_CREATE_CPMK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menambahkan CPMK ke mata kuliah ini' });
        }
        res.status(500).json({ error: 'Gagal membuat CPMK' });
    }
};

// Update CPMK
export const updateCpmk = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { id } = req.params;

        const cpmk = await CPMKService.updateCpmk(id, req.body, userId, userRole);

        res.json({ data: cpmk, message: 'CPMK berhasil diupdate' });
    } catch (error: any) {
        console.error('Update CPMK error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'CPMK tidak ditemukan') return res.status(404).json({ error: error.message });
        if (error.message === 'FORBIDDEN_EDIT_CPMK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk mengedit CPMK ini' });
        }
        if (error.message.startsWith('USED_IN_GRADES')) {
            const count = error.message.split(':')[1];
            return res.status(403).json({
                error: 'CPMK tidak dapat diedit karena sudah digunakan untuk penilaian',
                detail: `Terdapat ${count} nilai mahasiswa yang terkait dengan CPMK ini`
            });
        }
        res.status(500).json({ error: 'Gagal mengupdate CPMK' });
    }
};

// Delete CPMK (soft delete)
export const deleteCpmk = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { id } = req.params;

        await CPMKService.deleteCpmk(id, userId, userRole);

        res.json({ message: 'CPMK berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete CPMK error:', error);
        if (error.message === 'CPMK tidak ditemukan') return res.status(404).json({ error: error.message });
        if (error.message === 'FORBIDDEN_DELETE_CPMK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menghapus CPMK ini' });
        }
        if (error.message.startsWith('USED_IN_GRADES')) {
            const count = error.message.split(':')[1];
            return res.status(403).json({
                error: 'CPMK tidak dapat dihapus karena sudah digunakan untuk penilaian',
                detail: `Terdapat ${count} nilai mahasiswa yang terkait dengan CPMK ini`
            });
        }
        res.status(500).json({ error: 'Gagal menghapus CPMK' });
    }
};


// Export CPMK as Excel
export const exportCpmk = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { mataKuliahId, prodiId } = req.query;

        const result = await CPMKService.getAllCpmk({
            userId,
            userRole,
            mataKuliahId: mataKuliahId as string,
            prodiId: prodiId as string,
            page: 1,
            limit: -1,
            q: ''
        });

        const cpmkList = result.data || [];

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('CPMK');

        worksheet.columns = [
            { header: 'Kode CPMK', key: 'kodeCpmk', width: 15 },
            { header: 'Deskripsi', key: 'deskripsi', width: 50 },
            { header: 'Mata Kuliah', key: 'mataKuliah', width: 30 },
            { header: 'Level Taksonomi', key: 'levelTaksonomi', width: 20 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        cpmkList.forEach((cpmk: any) => {
            worksheet.addRow({
                kodeCpmk: cpmk.kodeCpmk,
                deskripsi: cpmk.deskripsi,
                mataKuliah: cpmk.mataKuliah?.namaMk || '',
                levelTaksonomi: cpmk.levelTaksonomi?.nama || ''
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `cpmk_${timestamp}.xlsx`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error('Export CPMK error:', error);
        res.status(500).json({ error: 'Gagal export data CPMK' });
    }
};

// Import CPMK from Excel  
export const importCpmk = async (req: Request, res: Response) => {
    console.log('--- CPMK Import Started (SheetJS Mode) ---');
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const file = req.file;

        if (!file) {
            console.log('Import failed: No file provided');
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }
        
        console.log(`Processing file: ${file.originalname} (${file.size} bytes)`);

        // Read workbook using SheetJS
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        
        // Find sheet named 'CPMK' case-insensitively, or use the first sheet
        const sheetName = workbook.SheetNames.find(n => n.toUpperCase() === 'CPMK') || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
            console.log('Import failed: No worksheet found');
            return res.status(400).json({ error: 'Sheet tidak ditemukan dalam file Excel' });
        }
        
        console.log(`Using worksheet: ${sheetName}`);

        // Convert worksheet to JSON (header: 1 means array of arrays)
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        const errors: string[] = [];
        const successes: any[] = [];

        console.log(`Total rows found: ${jsonData.length}`);

        // Process each row (skip header at index 0)
        for (let i = 1; i < jsonData.length; i++) {
            const rowValues = jsonData[i];
            if (!rowValues || rowValues.length < 2) continue;

            // SheetJS index is 0-based
            // Based on template: 0: No, 1: Kode, 2: Deskripsi, 3: MK Name, 4: Level
            const kodeCpmk = getCellValue(rowValues[1]);
            const deskripsi = getCellValue(rowValues[2]);
            const mataKuliah = getCellValue(rowValues[3]);
            const levelTaksonomi = getCellValue(rowValues[4]);

            if (!kodeCpmk || !mataKuliah) {
                if (kodeCpmk || mataKuliah) {
                    errors.push(`Baris ${i + 1}: Kode CPMK dan Mata Kuliah harus diisi`);
                }
                continue;
            }

            try {
                let mataKuliahId, levelTaksonomiId;

                // 1. Find Mata Kuliah
                const mkData = await prisma.mataKuliah.findFirst({
                    where: { 
                        namaMk: { equals: mataKuliah as string },
                        isActive: true
                    }
                });
                mataKuliahId = mkData?.id;

                if (!mataKuliahId) {
                    // Try by code if name doesn't match
                    const mkByCode = await prisma.mataKuliah.findFirst({
                        where: { 
                            kodeMk: { equals: mataKuliah as string },
                            isActive: true
                        }
                    });
                    mataKuliahId = mkByCode?.id;
                }

                if (!mataKuliahId) {
                    errors.push(`Baris ${i + 1}: Mata Kuliah "${mataKuliah}" tidak ditemukan di database`);
                    continue;
                }

                // 2. Find Level Taksonomi
                if (levelTaksonomi) {
                    const levelData = await prisma.levelTaksonomi.findFirst({
                        where: { 
                            OR: [
                                { kode: { equals: levelTaksonomi as string } },
                                { deskripsi: { contains: levelTaksonomi as string } }
                            ]
                        }
                    });
                    levelTaksonomiId = levelData?.id;
                }

                // 3. Check for existing CPMK
                const existingCPMK = await prisma.cpmk.findFirst({
                    where: { 
                        kodeCpmk: kodeCpmk as string, 
                        mataKuliahId,
                        isActive: true
                    }
                });

                const cpmkData = {
                    kodeCpmk: kodeCpmk as string,
                    deskripsi: (deskripsi as string || kodeCpmk as string).trim(),
                    mataKuliahId,
                    levelTaksonomiId
                };

                if (existingCPMK) {
                    await CPMKService.updateCpmk(existingCPMK.id, cpmkData, userId, userRole);
                    successes.push({ row: i + 1, kodeCpmk, action: 'updated' });
                } else {
                    await CPMKService.createCpmk(cpmkData, userId, userRole);
                    successes.push({ row: i + 1, kodeCpmk, action: 'created' });
                }

            } catch (error: any) {
                console.error(`Error processing row ${i + 1}:`, error);
                errors.push(`Baris ${i + 1} (${kodeCpmk}): ${error.message || 'Gagal menyimpan data'}`);
            }
        }

        res.json({
            message: `Import selesai. ${successes.length} data berhasil diproses.`,
            successCount: successes.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error('CRITICAL ERROR: Import CPMK failed at top level:', error);
        res.status(500).json({ 
            error: 'Gagal import data CPMK',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Generate Template Excel for CPMK
export const getTemplateCpmk = async (req: Request, res: Response) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('CPMK');

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Kode CPMK', key: 'kodeCpmk', width: 15 },
            { header: 'Deskripsi', key: 'deskripsi', width: 50 },
            { header: 'Mata Kuliah', key: 'mataKuliah', width: 30 },
            { header: 'Level Taksonomi', key: 'levelTaksonomi', width: 25 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        worksheet.addRow({
            no: 1,
            kodeCpmk: 'CPMK-1',
            deskripsi: 'Mahasiswa mampu memahami konsep dasar pemrograman',
            mataKuliah: 'Algoritma dan Pemrograman',
            levelTaksonomi: 'C2'
        });

        const noteRow = worksheet.addRow({
            no: '',
            kodeCpmk: '* Wajib Diisi',
            deskripsi: '* Wajib Diisi',
            mataKuliah: '* Wajib Sesuai Master Mata Kuliah',
            levelTaksonomi: '* Opsional (Kode Level)'
        });
        noteRow.font = { italic: true, color: { argb: 'FFFF0000' } };

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Template_Import_CPMK.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({ error: 'Gagal membuat file template' });
    }
};
