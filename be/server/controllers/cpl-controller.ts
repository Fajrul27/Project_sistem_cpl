import { Request, Response } from 'express';
import { CPLService } from '../services/CPLService.js';
import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma.js';

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
        await workbook.xlsx.load(file.buffer);
        const worksheet = workbook.getWorksheet('CPL');

        if (!worksheet) {
            return res.status(400).json({ error: 'Sheet "CPL" tidak ditemukan dalam file Excel' });
        }

        const errors: string[] = [];
        const successes: any[] = [];
        let rowNumber = 1;

        for (const row of worksheet.getSheetValues() as any[]) {
            rowNumber++;
            if (rowNumber === 2) continue;
            if (!row || row.length === 0) continue;

            const [, kodeCpl, deskripsi, kategori, programStudi] = row;

            if (!kodeCpl || !deskripsi) {
                errors.push(`Baris ${rowNumber}: Kode CPL dan Deskripsi harus diisi`);
                continue;
            }

            try {
                let kategoriId, prodiId;

                if (kategori) {
                    const kategoriData = await prisma.kategoriCpl.findFirst({
                        where: { nama: kategori as string }
                    });
                    kategoriId = kategoriData?.id;
                }

                if (programStudi) {
                    const prodiData = await prisma.prodi.findFirst({
                        where: { nama: programStudi as string }
                    });
                    prodiId = prodiData?.id;
                }

                const existingCPL = await prisma.cpl.findFirst({
                    where: { kodeCpl: kodeCpl as string, deletedAt: null }
                });

                const cplData = {
                    kodeCpl: kodeCpl as string,
                    deskripsi: deskripsi as string,
                    kategoriCplId: kategoriId,
                    prodiId
                };

                if (existingCPL) {
                    await CPLService.updateCpl(existingCPL.id, cplData, userId, userRole);
                    successes.push({ row: rowNumber, kodeCpl, action: 'updated' });
                } else {
                    await CPLService.createCpl(cplData, userId, userRole);
                    successes.push({ row: rowNumber, kodeCpl, action: 'created' });
                }

            } catch (error: any) {
                errors.push(`Baris ${rowNumber} (${kodeCpl}): ${error.message || 'Gagal menyimpan data'}`);
            }
        }

        res.json({
            message: `Import selesai. ${successes.length} data berhasil diproses.`,
            success: successes.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('Import CPL error:', error);
        res.status(500).json({ error: 'Gagal import data CPL' });
    }
};
