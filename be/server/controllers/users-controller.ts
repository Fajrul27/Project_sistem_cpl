import { Request, Response } from 'express';
import { UserService } from '../services/UserService.js';

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const { role, page = 1, limit = 10, q, sortBy, sortOrder, kelasId, fakultasId, mataKuliahId, semester, prodi, prodiId, kelas } = req.query;
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;

        const result = await UserService.getAllUsers({
            role: role as string,
            page: Number(page),
            limit: Number(limit),
            q: q as string,
            userId,
            userRole,
            kelasId: kelasId as string,
            fakultasId: fakultasId as string,
            mataKuliahId: mataKuliahId as string,
            semester: semester ? Number(semester) : undefined,
            prodi: prodi as string,
            prodiId: prodiId as string,
            kelas: kelas as string,
            sortBy: sortBy as string,
            sortOrder: sortOrder as string
        });

        res.json(result);
    } catch (error: any) {
        console.error('Get users error:', error);

        if (error.message === 'FORBIDDEN_ACCESS_MK') {
            return res.status(403).json({ error: 'Anda tidak memiliki akses ke mata kuliah ini' });
        }
        if (error.message === 'MK_NOT_FOUND') {
            return res.status(404).json({ error: 'Mata kuliah tidak ditemukan' });
        }

        res.status(500).json({ error: 'Gagal mengambil data users' });
    }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await UserService.getUserById(id);
        res.json({ data: user });
    } catch (error: any) {
        console.error('Get user error:', error);
        if (error.message === 'User tidak ditemukan') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal mengambil data user' });
    }
};

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const updatedUser = await UserService.updateUserRole(id, role);

        res.json({
            message: 'Role user berhasil diperbarui',
            data: updatedUser
        });
    } catch (error: any) {
        console.error('Update user role error:', error);
        if (error.message === 'Role tidak valid' || error.message === 'User tidak ditemukan') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Gagal memperbarui role user' });
    }
};

// Update user basic info (admin only)
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const updatedUser = await UserService.updateUser(id, req.body);

        res.json({
            message: 'User berhasil diperbarui',
            data: updatedUser
        });
    } catch (error: any) {
        console.error('Update user error:', error);
        if (error.message === 'Tidak ada data untuk diperbarui' || error.message === 'User tidak ditemukan') {
            return res.status(400).json({ error: error.message });
        }
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.issues[0].message });
        }
        res.status(500).json({ error: 'Gagal memperbarui user' });
    }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await UserService.deleteUser(id);
        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Gagal menghapus user' });
    }
};

// Export Mahasiswa as Excel
export const exportMahasiswa = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const userRole = (req as any).userRole;
        const { kelasId, prodiId, semester } = req.query;

        const result = await UserService.getAllUsers({
            role: 'mahasiswa',
            page: 1,
            limit: -1,
            q: '',
            userId,
            userRole,
            kelasId: kelasId as string,
            prodiId: prodiId as string,
            semester: semester ? Number(semester) : undefined,
            sortBy: 'nim',
            sortOrder: 'asc'
        });

        const mahasiswaList = result.data || [];

        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mahasiswa');

        worksheet.columns = [
            { header: 'Email', key: 'email', width: 30 },
            { header: 'NIM', key: 'nim', width: 20 },
            { header: 'Nama Lengkap', key: 'namaLengkap', width: 35 },
            { header: 'Semester', key: 'semester', width: 10 },
            { header: 'Program Studi', key: 'programStudi', width: 30 },
            { header: 'Kelas', key: 'kelas', width: 15 }
        ];

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        mahasiswaList.forEach((mhs: any) => {
            worksheet.addRow({
                email: mhs.email,
                nim: mhs.profile?.nim || '',
                namaLengkap: mhs.profile?.namaLengkap || '',
                semester: mhs.profile?.semester || '',
                programStudi: mhs.profile?.prodi?.nama || '',
                kelas: mhs.profile?.kelasRef?.nama || ''
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `mahasiswa_${timestamp}.xlsx`;

        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);

    } catch (error) {
        console.error('Export Mahasiswa error:', error);
        res.status(500).json({ error: 'Gagal export data Mahasiswa' });
    }
};

// Import Mahasiswa from Excel
export const importMahasiswa = async (req: Request, res: Response) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const ExcelJS = (await import('exceljs')).default;
        const prisma = (await import('../lib/prisma.js')).prisma;
        const bcrypt = (await import('bcrypt')).default;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer);
        const worksheet = workbook.getWorksheet('Mahasiswa');

        if (!worksheet) {
            return res.status(400).json({ error: 'Sheet "Mahasiswa" tidak ditemukan dalam file Excel' });
        }

        const errors: string[] = [];
        const successes: any[] = [];
        let rowNumber = 1;

        for (const row of worksheet.getSheetValues() as any[]) {
            rowNumber++;
            if (rowNumber === 2) continue;
            if (!row || row.length === 0) continue;

            const [, email, nim, namaLengkap, semester, programStudi, kelas] = row;

            if (!email || !nim || !namaLengkap) {
                errors.push(`Baris ${rowNumber}: Email, NIM, dan Nama Lengkap harus diisi`);
                continue;
            }

            try {
                let prodiId, kelasId;

                if (programStudi) {
                    const prodiData = await prisma.prodi.findFirst({
                        where: { nama: programStudi as string }
                    });
                    prodiId = prodiData?.id;
                }

                if (kelas) {
                    const kelasData = await prisma.kelas.findFirst({
                        where: { nama: kelas as string }
                    });
                    kelasId = kelasData?.id;
                }

                const existingUser = await prisma.user.findUnique({
                    where: { email: email as string }
                });

                if (existingUser) {
                    // Update existing
                    await prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            profile: {
                                update: {
                                    nim: nim as string,
                                    namaLengkap: namaLengkap as string,
                                    semester: semester ? Number(semester) : undefined,
                                    prodiId,
                                    kelasId
                                }
                            }
                        }
                    });
                    successes.push({ row: rowNumber, email, action: 'updated' });
                } else {
                    // Create new
                    const hashedPassword = await bcrypt.hash('password123', 10); // Default password
                    await prisma.user.create({
                        data: {
                            email: email as string,
                            password: hashedPassword,
                            role: 'mahasiswa',
                            profile: {
                                create: {
                                    nim: nim as string,
                                    namaLengkap: namaLengkap as string,
                                    semester: semester ? Number(semester) : undefined,
                                    prodiId,
                                    kelasId
                                }
                            }
                        }
                    });
                    successes.push({ row: rowNumber, email, action: 'created' });
                }

            } catch (error: any) {
                errors.push(`Baris ${rowNumber} (${email}): ${error.message || 'Gagal menyimpan data'}`);
            }
        }

        res.json({
            message: `Import selesai. ${successes.length} data berhasil diproses.`,
            success: successes.length,
            errors: errors.length > 0 ? errors : undefined,
            note: 'Password default untuk mahasiswa baru: password123'
        });

    } catch (error) {
        console.error('Import Mahasiswa error:', error);
        res.status(500).json({ error: 'Gagal import data Mahasiswa' });
    }
};
