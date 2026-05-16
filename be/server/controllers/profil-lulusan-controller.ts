import { Request, Response } from 'express';
import { ProfilLulusanService } from '../services/ProfilLulusanService.js';
import { prisma } from '../lib/prisma.js';
import ExcelJS from 'exceljs';
import { getCellValue } from '../utils/excel-utils.js';

// Get Profil Lulusan
export const getProfilLulusan = async (req: Request, res: Response) => {
    try {
        const { prodiId, page, limit, q, searchBy } = req.query;
        const result = await ProfilLulusanService.getProfilLulusan({
            prodiId: prodiId ? String(prodiId) : undefined,
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            q: q as string,
            searchBy: searchBy as 'all' | 'prodi'
        });
        res.json(result);
    } catch (error) {
        console.error('Error fetching Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal mengambil data Profil Lulusan' });
    }
};

// Create Profil Lulusan
export const createProfilLulusan = async (req: Request, res: Response) => {
    try {
        const profil = await ProfilLulusanService.createProfilLulusan(req.body);
        res.status(201).json(profil);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'DUPLICATE_KODE') {
            return res.status(400).json({ error: 'Kode Profil Lulusan sudah ada di prodi ini' });
        }
        console.error('Error creating Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal menyimpan Profil Lulusan' });
    }
};

// Update Profil Lulusan
export const updateProfilLulusan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const profil = await ProfilLulusanService.updateProfilLulusan(id, req.body);
        res.json(profil);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        if (error.message === 'DUPLICATE_KODE') {
            return res.status(400).json({ error: 'Kode Profil Lulusan sudah digunakan' });
        }
        console.error('Error updating Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal mengupdate Profil Lulusan' });
    }
};

// Delete Profil Lulusan
export const deleteProfilLulusan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ProfilLulusanService.deleteProfilLulusan(id);
        res.json({ message: 'Berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal menghapus Profil Lulusan' });
    }
};

// Export Profil Lulusan to Excel
export const exportProfilLulusan = async (req: Request, res: Response) => {
    try {
        const { prodiId } = req.query;

        const whereClause: any = { isActive: true };
        if (prodiId) whereClause.prodiId = String(prodiId);

        const profilList = await prisma.profilLulusan.findMany({
            where: whereClause,
            include: {
                prodi: true,
                kurikulum: true
            },
            orderBy: { kode: 'asc' }
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Profil Lulusan');

        worksheet.columns = [
            { header: 'Kode', key: 'kode', width: 15 },
            { header: 'Nama Profil', key: 'nama', width: 30 },
            { header: 'Deskripsi', key: 'deskripsi', width: 50 },
            { header: 'Target (%)', key: 'target', width: 15 },
            { header: 'Program Studi', key: 'prodi', width: 30 },
            { header: 'Kurikulum', key: 'kurikulum', width: 30 }
        ];

        profilList.forEach(p => {
            worksheet.addRow({
                kode: p.kode,
                nama: p.nama,
                deskripsi: p.deskripsi,
                target: p.targetKetercapaian,
                prodi: p.prodi?.nama,
                kurikulum: p.kurikulum?.nama
            });
        });

        worksheet.getRow(1).font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=profil_lulusan.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal export data' });
    }
};

// Download Template Profil Lulusan
export const downloadTemplateProfilLulusan = async (req: Request, res: Response) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Template Import PL');

        worksheet.columns = [
            { header: 'Kode', key: 'kode', width: 15 },
            { header: 'Nama Profil', key: 'nama', width: 30 },
            { header: 'Deskripsi', key: 'deskripsi', width: 50 },
            { header: 'Target Ketercapaian', key: 'target', width: 20 },
            { header: 'Nama Kurikulum', key: 'kurikulum', width: 30 }
        ];

        worksheet.addRow({
            kode: 'PL-01',
            nama: 'Software Engineer',
            deskripsi: 'Mampu merancang dan membangun sistem perangkat lunak',
            target: 75,
            kurikulum: 'Kurikulum 2024'
        });

        worksheet.getRow(1).font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Template_Import_ProfilLulusan.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error downloading template:', error);
        res.status(500).json({ error: 'Gagal download template' });
    }
};

// Import Profil Lulusan from Excel
export const importProfilLulusan = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Tidak ada file yang diupload' });
    }

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer as any);
        const worksheet = workbook.getWorksheet(1);

        if (!worksheet) {
            return res.status(400).json({ error: 'Worksheet tidak valid' });
        }

        const rows: any[] = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                const values = row.values as any[];
                rows.push({
                    kode: getCellValue(values[1]),
                    nama: getCellValue(values[2]),
                    deskripsi: getCellValue(values[3]),
                    target: getCellValue(values[4]),
                    kurikulumName: getCellValue(values[5])
                });
            }
        });

        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const profile = await prisma.profile.findUnique({
            where: { userId }
        });
        const prodiId = profile?.prodiId;

        if (!prodiId && userRole !== 'admin') {
            return res.status(403).json({ error: 'User tidak memiliki akses prodi' });
        }

        const results = {
            success: 0,
            errors: [] as string[]
        };

        for (const row of rows) {
            try {
                if (!row.kode || !row.nama) {
                    results.errors.push(`Baris ${rows.indexOf(row) + 2}: Kode dan Nama wajib diisi`);
                    continue;
                }

                // Find kurikulum by name
                let kurikulumId = null;
                if (row.kurikulumName) {
                    const kurikulum = await prisma.kurikulum.findFirst({
                        where: {
                            nama: String(row.kurikulumName)
                        }
                    });
                    if (kurikulum) {
                        kurikulumId = kurikulum.id;
                    } else {
                        results.errors.push(`Baris ${rows.indexOf(row) + 2}: Kurikulum "${row.kurikulumName}" tidak ditemukan`);
                        continue;
                    }
                } else {
                    // Fallback to active kurikulum if not specified
                    const activeKurikulum = await prisma.kurikulum.findFirst({
                        where: { isActive: true }
                    });
                    if (activeKurikulum) kurikulumId = activeKurikulum.id;
                }

                if (!kurikulumId) {
                    results.errors.push(`Baris ${rows.indexOf(row) + 2}: Kurikulum tidak valid`);
                    continue;
                }

                // Use the prodiId from the user profile, or if admin, they should have filtered by prodi in the UI?
                // Actually, the import request should probably include the target prodiId if the user is an admin.
                // For now, assume kaprodi.
                const targetProdiId = prodiId || req.body.prodiId;
                if (!targetProdiId) {
                    results.errors.push(`Baris ${rows.indexOf(row) + 2}: Prodi ID tidak ditemukan`);
                    continue;
                }

                await prisma.profilLulusan.upsert({
                    where: {
                        prodiId_kode: {
                            prodiId: targetProdiId,
                            kode: String(row.kode)
                        }
                    },
                    update: {
                        nama: String(row.nama),
                        deskripsi: row.deskripsi ? String(row.deskripsi) : null,
                        targetKetercapaian: row.target ? parseFloat(row.target) : 0,
                        kurikulumId: kurikulumId
                    },
                    create: {
                        kode: String(row.kode),
                        nama: String(row.nama),
                        deskripsi: row.deskripsi ? String(row.deskripsi) : null,
                        targetKetercapaian: row.target ? parseFloat(row.target) : 0,
                        prodiId: targetProdiId,
                        kurikulumId: kurikulumId
                    }
                });

                results.success++;
            } catch (err: any) {
                results.errors.push(`Baris ${rows.indexOf(row) + 2}: ${err.message}`);
            }
        }

        res.json({
            message: 'Import selesai',
            successCount: results.success,
            errors: results.errors
        });
    } catch (error) {
        console.error('Error importing Profil Lulusan:', error);
        res.status(500).json({ error: 'Gagal memproses file' });
    }
};
