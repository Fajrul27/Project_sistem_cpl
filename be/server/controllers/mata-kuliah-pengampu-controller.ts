import { Request, Response } from 'express';
import { MataKuliahPengampuService } from '../services/MataKuliahPengampuService.js';
import { getCellValue } from '../utils/excel-utils.js';

// Get all pengampu for a mata kuliah
export const getPengampuByMataKuliah = async (req: Request, res: Response) => {
    try {
        const { mataKuliahId } = req.params;
        const pengampu = await MataKuliahPengampuService.getPengampuByMataKuliah(mataKuliahId);
        res.json({ data: pengampu });
    } catch (error) {
        console.error('Error fetching pengampu:', error);
        res.status(500).json({ error: 'Failed to fetch pengampu' });
    }
};

// Get all assignments (with filters)
export const getAllAssignments = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { prodiId, semester, fakultasId, page, limit } = req.query;

        const filters = {
            userId,
            userRole,
            prodiId: prodiId as string,
            semester: semester ? Number(semester) : undefined,
            fakultasId: fakultasId as string,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10
        };
        const result = await MataKuliahPengampuService.getAllAssignments(filters);
        res.json(result);
    } catch (error) {
        console.error('Error fetching all assignments:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
};

// Get all mata kuliah for a dosen
export const getAssignmentsByDosen = async (req: Request, res: Response) => {
    try {
        const { dosenId } = req.params;
        const assignments = await MataKuliahPengampuService.getAssignmentsByDosen(dosenId);
        res.json({ data: assignments });
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).json({ error: 'Failed to fetch assignments' });
    }
};

// Assign dosen to mata kuliah
export const assignDosenToMataKuliah = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const assignment = await MataKuliahPengampuService.assignDosen(req.body, userId, userRole);

        res.status(201).json({
            data: assignment,
            message: 'Dosen berhasil ditambahkan ke mata kuliah'
        });
    } catch (error: any) {
        if (error.message === 'ALREADY_EXISTS' || error.code === 'P2002') {
            return res.status(400).json({ error: 'Dosen sudah terdaftar pada mata kuliah ini' });
        }
        if (error.message === 'FORBIDDEN_ACCESS') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }
        console.error('Error assigning dosen:', error);
        res.status(500).json({ error: 'Failed to assign dosen' });
    }
};

// Remove dosen from mata kuliah
export const removeDosenFromMataKuliah = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        await MataKuliahPengampuService.removeAssignment(id, userId, userRole);

        res.json({ message: 'Dosen berhasil dihapus dari mata kuliah' });
    } catch (error: any) {
        console.error('Error removing dosen:', error);
        if (error.message === 'FORBIDDEN_ACCESS') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses untuk menghapus pengampu ini' });
        }
        if (error.message === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Pengampu tidak ditemukan' });
        }
        res.status(500).json({ error: 'Failed to remove dosen' });
    }
};

// Get daftar peserta (mahasiswa) untuk mata kuliah yang diampu dosen
export const getPesertaByMataKuliah = async (req: Request, res: Response) => {
    try {
        const { mataKuliahId } = req.params;
        const userId = (req as any).userId;

        const peserta = await MataKuliahPengampuService.getPesertaByMataKuliah(mataKuliahId, userId);

        res.json({
            data: peserta,
            total: peserta.length
        });
    } catch (error: any) {
        console.error('Error fetching peserta:', error);
        if (error.message === 'FORBIDDEN_ACCESS') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }
        res.status(500).json({ error: 'Failed to fetch peserta' });
    }
};

// Export Pengampu as Excel
export const exportPengampu = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { prodiId, semester, fakultasId } = req.query;

        const result = await MataKuliahPengampuService.getAllAssignments({
            userId,
            userRole,
            prodiId: prodiId as string,
            semester: semester ? Number(semester) : undefined,
            fakultasId: fakultasId as string,
            page: 1,
            limit: -1
        });

        const assignments = result.data || [];

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Dosen Pengampu');

        worksheet.columns = [
            { header: 'Kode MK', key: 'kodeMk', width: 15 },
            { header: 'Nama Mata Kuliah', key: 'namaMk', width: 30 },
            { header: 'Email Dosen', key: 'email', width: 30 },
            { header: 'Nama Dosen', key: 'namaDosen', width: 30 },
            { header: 'NIP/NIDN', key: 'nipNidn', width: 20 },
            { header: 'Kelas', key: 'kelas', width: 10 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        assignments.forEach((item: any) => {
            worksheet.addRow({
                kodeMk: item.mataKuliah?.kodeMk || '',
                namaMk: item.mataKuliah?.namaMk || '',
                email: item.dosen?.user?.email || '',
                namaDosen: item.dosen?.namaLengkap || '',
                nipNidn: item.dosen?.nip || item.dosen?.nidn || '',
                kelas: item.kelas?.nama || ''
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = new Date().toISOString().split('T')[0];
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="dosen_pengampu_${timestamp}.xlsx"`);
        res.send(buffer);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Gagal export data' });
    }
};

// Import Pengampu from Excel
export const importPengampu = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const ExcelJS = (await import('exceljs')).default;
        const { prisma } = await import('../lib/prisma.js');
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.getWorksheet('Dosen Pengampu') || workbook.worksheets[0];

        const errors: string[] = [];
        const successes: any[] = [];
        let rowNumber = 1;

        const rows: any[] = [];
        worksheet.eachRow((row, num) => {
            if (num > 1) rows.push({ num, values: row.values });
        });

        for (const { num, values } of rows) {
            rowNumber = num;
            const kodeMk = getCellValue(values[1]); // Column A is No, wait. 
            // Looking at the template: No, Kode MK, Nama MK, Email Dosen, Nama Dosen, NIP, Kelas.
            // No is Col 1, Kode MK is Col 2, Email Dosen is Col 4, Kelas is Col 7.
            
            const kodeMkVal = getCellValue(values[2]);
            const emailDosenVal = getCellValue(values[4]);
            const namaKelasVal = getCellValue(values[7]);

            if (!kodeMkVal || !emailDosenVal) {
                if (kodeMkVal || emailDosenVal) {
                    errors.push(`Baris ${rowNumber}: Kode MK dan Email Dosen wajib diisi`);
                }
                continue;
            }

            try {
                // Find Mata Kuliah
                const mk = await prisma.mataKuliah.findFirst({
                    where: { kodeMk: kodeMkVal }
                });
                if (!mk) {
                    errors.push(`Baris ${rowNumber}: Mata Kuliah dengan kode "${kodeMkVal}" tidak ditemukan`);
                    continue;
                }

                // Find Dosen (by Email)
                const user = await prisma.user.findUnique({
                    where: { email: emailDosenVal },
                    include: { profile: true }
                });
                if (!user || !user.profile) {
                    errors.push(`Baris ${rowNumber}: Dosen dengan email "${emailDosenVal}" tidak ditemukan`);
                    continue;
                }

                // Find Kelas (optional)
                let kelasId = null;
                if (namaKelasVal) {
                    const kelas = await prisma.kelas.findFirst({
                        where: { nama: namaKelasVal }
                    });
                    if (kelas) {
                        kelasId = kelas.id;
                    }
                }

                // Check assignment
                const existing = await prisma.mataKuliahPengampu.findFirst({
                    where: {
                        mataKuliahId: mk.id,
                        dosenId: user.id,
                        kelasId: kelasId
                    }
                });

                if (existing) {
                    successes.push({ row: rowNumber, mk: kodeMkVal, action: 'exists' });
                } else {
                    await MataKuliahPengampuService.assignDosen({
                        mataKuliahId: mk.id,
                        dosenId: user.id,
                        kelasId: kelasId
                    }, userId, userRole);
                    successes.push({ row: rowNumber, mk: kodeMkVal, action: 'created' });
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

// Template Pengampu
export const getTemplatePengampu = async (req: Request, res: Response) => {
    try {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Dosen Pengampu');

        worksheet.columns = [
            { header: 'Kode MK', key: 'kodeMk', width: 15 },
            { header: 'Nama Mata Kuliah (Opsional)', key: 'namaMk', width: 30 },
            { header: 'Email Dosen', key: 'email', width: 30 },
            { header: 'Nama Dosen (Opsional)', key: 'namaDosen', width: 30 },
            { header: 'NIP/NIDN (Opsional)', key: 'nipNidn', width: 20 },
            { header: 'Kelas (Opsional)', key: 'kelas', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        worksheet.addRow({
            kodeMk: 'MK001',
            namaMk: 'Contoh Mata Kuliah',
            email: 'dosen@example.com',
            namaDosen: 'Dr. John Doe',
            nipNidn: '12345678',
            kelas: 'A'
        });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="template_dosen_pengampu.xlsx"');
        res.send(buffer);
    } catch (error) {
        console.error('Template error:', error);
        res.status(500).json({ error: 'Gagal membuat template' });
    }
};

