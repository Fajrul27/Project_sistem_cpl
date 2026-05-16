import { Request, Response } from 'express';
import { MataKuliahService } from '../services/MataKuliahService.js';
import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma.js';
import { getCellValue } from '../utils/excel-utils.js';

// Get all Mata Kuliah (filtered by access)
// Get all Mata Kuliah (filtered by access)
export const getAllMataKuliah = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { semester, fakultasId, prodiId, kurikulumId, page, limit, q } = req.query;

        const result = await MataKuliahService.getAllMataKuliah({
            userId,
            userRole,
            semester: semester as string,
            fakultasId: fakultasId as string,
            prodiId: prodiId as string,
            kurikulumId: kurikulumId as string,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            q: q as string
        });

        res.json(result);
    } catch (error) {
        console.error('Get Mata Kuliah error:', error);
        res.status(500).json({ error: 'Gagal mengambil data Mata Kuliah' });
    }
};

// Get available semesters for accessible Mata Kuliah
export const getMataKuliahSemesters = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const semesters = await MataKuliahService.getMataKuliahSemesters(userId, userRole);
        res.json({ data: semesters });
    } catch (error) {
        console.error('Get Semesters error:', error);
        res.status(500).json({ error: 'Gagal mengambil data semester' });
    }
};

// Get single Mata Kuliah details
export const getMataKuliahById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const mataKuliah = await MataKuliahService.getMataKuliahById(id);

        if (!mataKuliah) {
            // If null (e.g. 'semesters' check), treat as 404 or just return
            return res.status(404).json({ error: 'Not found' });
        }

        res.json({ data: mataKuliah });
    } catch (error: any) {
        console.error('Get Mata Kuliah Detail error:', error);
        if (error.message === 'Mata Kuliah tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mengambil data Mata Kuliah' });
    }
};

// Get classes for a specific Mata Kuliah (assigned to user)
export const getMataKuliahKelas = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const kelasList = await MataKuliahService.getMataKuliahKelas(id, userId, userRole);
        res.json({ data: kelasList });
    } catch (error) {
        console.error('Get Kelas for MK error:', error);
        res.status(500).json({ error: 'Gagal mengambil data kelas' });
    }
};

// Create Mata Kuliah
export const createMataKuliah = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const mataKuliah = await MataKuliahService.createMataKuliah(req.body, userId, userRole);

        res.status(201).json({ data: mataKuliah, message: 'Mata Kuliah berhasil dibuat' });
    } catch (error: any) {
        console.error('Create Mata Kuliah error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'Profil Kaprodi tidak memiliki Program Studi') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal membuat Mata Kuliah' });
    }
};

// Update Mata Kuliah
export const updateMataKuliah = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const mataKuliah = await MataKuliahService.updateMataKuliah(id, req.body, userId, userRole);

        res.json({ data: mataKuliah, message: 'Mata Kuliah berhasil diupdate' });
    } catch (error: any) {
        console.error('Update Mata Kuliah error:', error);
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'Mata Kuliah tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk mengedit mata kuliah ini' });
        }
        res.status(500).json({ error: 'Gagal mengupdate Mata Kuliah' });
    }
};

// Delete Mata Kuliah (soft delete)
export const deleteMataKuliah = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        await MataKuliahService.deleteMataKuliah(id, userId, userRole);

        res.json({ message: 'Mata Kuliah berhasil dihapus' });
    } catch (error: any) {
        console.error('Delete Mata Kuliah error:', error);
        if (error.message === 'Mata Kuliah tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'FORBIDDEN') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menghapus mata kuliah ini' });
        }
        res.status(500).json({ error: 'Gagal menghapus Mata Kuliah' });
    }
};

// Export Mata Kuliah as Excel
export const exportMataKuliah = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { semester, fakultasId, prodiId, kurikulumId } = req.query;

        // Fetch all mata kuliah data (no pagination)
        const result = await MataKuliahService.getAllMataKuliah({
            userId,
            userRole,
            semester: semester as string,
            fakultasId: fakultasId as string,
            prodiId: prodiId as string,
            kurikulumId: kurikulumId as string,
            page: 1,
            limit: -1, // Get all
            q: ''
        });

        const mataKuliahList = result.data || [];

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mata Kuliah');

        // Define columns
        worksheet.columns = [
            { header: 'Kode MK', key: 'kodeMk', width: 15 },
            { header: 'Nama MK', key: 'namaMk', width: 40 },
            { header: 'SKS', key: 'sks', width: 8 },
            { header: 'Semester', key: 'semester', width: 10 },
            { header: 'Jenis MK', key: 'jenisMk', width: 20 },
            { header: 'Program Studi', key: 'programStudi', width: 30 },
            { header: 'Kurikulum', key: 'kurikulum', width: 20 }
        ];

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add data rows
        mataKuliahList.forEach((mk: any) => {
            worksheet.addRow({
                kodeMk: mk.kodeMk,
                namaMk: mk.namaMk,
                sks: mk.sks,
                semester: mk.semester,
                jenisMk: mk.jenisMataKuliah?.nama || '',
                programStudi: mk.prodi?.nama || '',
                kurikulum: mk.kurikulum?.nama || ''
            });
        });

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Create filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `mata_kuliah_${timestamp}.xlsx`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error('Export Mata Kuliah error:', error);
        res.status(500).json({ error: 'Gagal export data Mata Kuliah' });
    }
};

// Import Mata Kuliah from Excel
export const importMataKuliah = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        // Read Excel file
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.getWorksheet('Mata Kuliah');

        if (!worksheet) {
            return res.status(400).json({ error: 'Sheet "Mata Kuliah" tidak ditemukan dalam file Excel' });
        }

        const errors: string[] = [];
        const successes: any[] = [];
        const sheetValues = worksheet.getSheetValues() as any[];

        // Process each row (skip header)
        for (let i = 2; i < sheetValues.length; i++) {
            const row = sheetValues[i];
            if (!row || row.length === 0) continue; // Skip empty rows

            const kodeMk = getCellValue(row[2]);
            const namaMk = getCellValue(row[3]);
            const sks = getCellValue(row[4]);
            const semester = getCellValue(row[5]);
            const jenisMk = getCellValue(row[6]);
            const programStudi = getCellValue(row[7]);
            const kurikulum = getCellValue(row[8]);

            // Validate required fields
            if (!kodeMk || !namaMk) {
                if (kodeMk || namaMk) {
                    errors.push(`Baris ${i}: Kode MK dan Nama MK harus diisi`);
                }
                continue;
            }

            try {
                // Find references if needed
                let jenisMkId, prodiId, kurikulumId;

                if (jenisMk) {
                    const jenisMkData = await prisma.jenisMataKuliah.findFirst({
                        where: { nama: jenisMk }
                    });
                    jenisMkId = jenisMkData?.id;
                }

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

                if (kurikulum) {
                    const kurikulumData = await prisma.kurikulum.findFirst({
                        where: { nama: { equals: kurikulum.trim() } }
                    });
                    kurikulumId = kurikulumData?.id;
                    if (!kurikulumId) {
                        // Fallback case-insensitive
                        const allKurikulum = await prisma.kurikulum.findMany();
                        const match = allKurikulum.find(k => k.nama.toLowerCase() === kurikulum.toLowerCase().trim());
                        kurikulumId = match?.id;
                    }
                }

                // 4. Find Semester Reference
                let semesterId;
                if (semester) {
                    const semesterData = await prisma.semester.findFirst({
                        where: { angka: Number(semester) }
                    });
                    semesterId = semesterData?.id;
                }

                // Check if mata kuliah exists
                const existingMK = await prisma.mataKuliah.findFirst({
                    where: { kodeMk: kodeMk }
                });

                const mkData = {
                    kodeMk: kodeMk,
                    namaMk: namaMk,
                    sks: sks ? Number(sks) : undefined,
                    semester: semester ? Number(semester) : undefined,
                    semesterId: semesterId || null,
                    jenisMataKuliahId: jenisMkId,
                    prodiId,
                    kurikulumId
                };

                if (existingMK) {
                    // Update existing
                    await MataKuliahService.updateMataKuliah(existingMK.id, mkData, userId, userRole);
                    successes.push({ row: i, kodeMk, action: 'updated' });
                } else {
                    // Create new
                    await MataKuliahService.createMataKuliah(mkData, userId, userRole);
                    successes.push({ row: i, kodeMk, action: 'created' });
                }

            } catch (error: any) {
                errors.push(`Baris ${i} (${kodeMk}): ${error.message || 'Gagal menyimpan data'}`);
            }
        }

        res.json({
            message: `Import selesai. ${successes.length} data berhasil diproses.`,
            successCount: successes.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import Mata Kuliah error:', error);
        res.status(500).json({ error: 'Gagal import data Mata Kuliah' });
    }
};

// Generate Template Excel for Mata Kuliah
export const getTemplateMataKuliah = async (req: Request, res: Response) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mata Kuliah');

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Kode MK', key: 'kodeMk', width: 15 },
            { header: 'Nama MK', key: 'namaMk', width: 40 },
            { header: 'SKS', key: 'sks', width: 10 },
            { header: 'Semester', key: 'semester', width: 10 },
            { header: 'Jenis MK', key: 'jenisMk', width: 25 },
            { header: 'Program Studi', key: 'programStudi', width: 30 },
            { header: 'Kurikulum', key: 'kurikulum', width: 30 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Add dummy row for example
        worksheet.addRow({
            no: 1,
            kodeMk: 'IF-101',
            namaMk: 'Algoritma dan Pemrograman',
            sks: 3,
            semester: 1,
            jenisMk: 'Mata Kuliah Wajib',
            programStudi: 'S1 Teknik Informatika',
            kurikulum: 'Kurikulum 2024'
        });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Disposition', `attachment; filename="template_mata_kuliah.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Get Template Mata Kuliah error:', error);
        res.status(500).json({ error: 'Gagal generate template' });
    }
};

