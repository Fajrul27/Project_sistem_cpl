import { Request, Response } from 'express';
import { CPMKService } from '../services/CPMKService.js';

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

        const ExcelJS = (await import('exceljs')).default;
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
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const ExcelJS = (await import('exceljs')).default;
        const prisma = (await import('../lib/prisma.js')).prisma;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);
        const worksheet = workbook.getWorksheet('CPMK');

        if (!worksheet) {
            return res.status(400).json({ error: 'Sheet "CPMK" tidak ditemukan dalam file Excel' });
        }

        const errors: string[] = [];
        const successes: any[] = [];
        let rowNumber = 1;

        for (const row of worksheet.getSheetValues() as any[]) {
            rowNumber++;
            if (rowNumber === 2) continue;
            if (!row || row.length === 0) continue;

            const [, kodeCpmk, deskripsi, mataKuliah, levelTaksonomi] = row;

            if (!kodeCpmk || !mataKuliah) {
                errors.push(`Baris ${rowNumber}: Kode CPMK dan Mata Kuliah harus diisi`);
                continue;
            }

            try {
                let mataKuliahId, levelTaksonomiId;

                const mkData = await prisma.mataKuliah.findFirst({
                    where: { namaMk: mataKuliah as string, deletedAt: null }
                });
                mataKuliahId = mkData?.id;

                if (!mataKuliahId) {
                    errors.push(`Baris ${rowNumber}: Mata Kuliah "${mataKuliah}" tidak ditemukan`);
                    continue;
                }

                if (levelTaksonomi) {
                    const levelData = await prisma.levelTaksonomi.findFirst({
                        where: { nama: levelTaksonomi as string }
                    });
                    levelTaksonomiId = levelData?.id;
                }

                const existingCPMK = await prisma.cpmk.findFirst({
                    where: { kodeCpmk: kodeCpmk as string, mataKuliahId, deletedAt: null }
                });

                const cpmkData = {
                    kodeCpmk: kodeCpmk as string,
                    deskripsi: deskripsi as string || '',
                    mataKuliahId,
                    levelTaksonomiId
                };

                if (existingCPMK) {
                    await CPMKService.updateCpmk(existingCPMK.id, cpmkData, userId, userRole);
                    successes.push({ row: rowNumber, kodeCpmk, action: 'updated' });
                } else {
                    await CPMKService.createCpmk(cpmkData, userId, userRole);
                    successes.push({ row: rowNumber, kodeCpmk, action: 'created' });
                }

            } catch (error: any) {
                errors.push(`Baris ${rowNumber} (${kodeCpmk}): ${error.message || 'Gagal menyimpan data'}`);
            }
        }

        res.json({
            message: `Import selesai. ${successes.length} data berhasil diproses.`,
            success: successes.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import CPMK error:', error);
        res.status(500).json({ error: 'Gagal import data CPMK' });
    }
};
