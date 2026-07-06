import { Request, Response } from 'express';
import { UserService } from '../services/UserService.js';
import { getCellValue } from '../utils/excel-utils.js';

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
            { header: 'Kelas', key: 'kelas', width: 15 },
            { header: 'Angkatan', key: 'angkatan', width: 15 }
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
                kelas: mhs.profile?.kelasRef?.nama || '',
                angkatan: mhs.profile?.angkatanRef?.tahun || ''
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
        const bcrypt = (await import('bcryptjs')).default;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
            return res.status(400).json({ error: 'Tidak ada sheet yang ditemukan dalam file Excel' });
        }

        const errors: string[] = [];
        const successes: any[] = [];

        for (const worksheet of workbook.worksheets) {
            let rowNumber = 1;
            let isFirstRow = true;

            let emailIdx = 2, nimIdx = 3, namaIdx = 4, semesterIdx = 5, prodiIdx = 6, kelasIdx = 7, angkatanIdx = 8;

            for (const row of worksheet.getSheetValues() as any[]) {
                rowNumber++;
                if (!row || row.length === 0) continue;

            if (isFirstRow) {
                isFirstRow = false;
                // Try to parse headers dynamically
                let hasHeader = false;
                for (let i = 1; i < row.length; i++) {
                    const val = String(getCellValue(row[i])).toLowerCase().trim();
                    if (val.includes('email') || val.includes('e-mail')) { emailIdx = i; hasHeader = true; }
                    else if (val.includes('nim') || val.includes('nomor induk')) { nimIdx = i; hasHeader = true; }
                    else if (val.includes('nama')) { namaIdx = i; hasHeader = true; }
                    else if (val.includes('semester')) { semesterIdx = i; hasHeader = true; }
                    else if (val.includes('program studi') || val === 'prodi') { prodiIdx = i; hasHeader = true; }
                    else if (val === 'kelas') { kelasIdx = i; hasHeader = true; }
                    else if (val.includes('angkatan')) { angkatanIdx = i; hasHeader = true; }
                }
                if (hasHeader) continue; // Skip header row
            }

            const email = getCellValue(row[emailIdx]);
            const nim = getCellValue(row[nimIdx]);
            const namaLengkap = getCellValue(row[namaIdx]);
            const semester = getCellValue(row[semesterIdx]);
            const programStudi = getCellValue(row[prodiIdx]);
            const kelas = getCellValue(row[kelasIdx]);
            const angkatan = getCellValue(row[angkatanIdx]);

            if (!email || !nim || !namaLengkap) {
                if (email || nim || namaLengkap) {
                    errors.push(`Baris ${rowNumber}: Email, NIM, dan Nama harus diisi (Terbaca -> Email: "${email}", NIM: "${nim}", Nama: "${namaLengkap}")`);
                }
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

                let angkatanId;
                if (angkatan) {
                    const angkatanNum = Number(angkatan);
                    if (!isNaN(angkatanNum)) {
                        let angkatanData = await prisma.angkatan.findUnique({
                            where: { tahun: angkatanNum }
                        });
                        if (!angkatanData) {
                            angkatanData = await prisma.angkatan.create({
                                data: { tahun: angkatanNum, isActive: true }
                            });
                        }
                        angkatanId = angkatanData.id;
                    }
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
                                    kelasId,
                                    angkatanId
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
                            passwordHash: hashedPassword,
                            role: {
                                create: {
                                    role: {
                                        connect: { name: 'mahasiswa' }
                                    }
                                }
                            },
                            profile: {
                                create: {
                                    nim: nim as string,
                                    namaLengkap: namaLengkap as string,
                                    semester: semester ? Number(semester) : undefined,
                                    prodiId,
                                    kelasId,
                                    angkatanId
                                }
                            }
                        }
                    });
                    successes.push({ row: rowNumber, email, action: 'created' });
                }

} catch (error: any) {
                errors.push(`Sheet ${worksheet.name} Baris ${rowNumber} (${email}): ${error.message || 'Gagal menyimpan data'}`);
            }
        }
        } // end of worksheet loop

        res.json({
            message: `Import selesai. ${successes.length} data berhasil diproses.`,
            successCount: successes.length,
            errors: errors.length > 0 ? errors : undefined,
            note: 'Password default untuk mahasiswa baru: password123'
        });

    } catch (error: any) {
        console.error('Import Mahasiswa error:', error);
        res.status(500).json({ error: 'Gagal import data Mahasiswa: ' + (error.message || String(error)) });
    }
};

// Generate Template Excel for Mahasiswa
export const getTemplateMahasiswa = async (req: Request, res: Response) => {
    try {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mahasiswa');

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'NIM', key: 'nim', width: 20 },
            { header: 'Nama Lengkap', key: 'namaLengkap', width: 40 },
            { header: 'Semester', key: 'semester', width: 10 },
            { header: 'Program Studi', key: 'programStudi', width: 30 },
            { header: 'Kelas', key: 'kelas', width: 15 },
            { header: 'Angkatan', key: 'angkatan', width: 15 }
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
            email: 'mahasiswa@example.com',
            nim: '123456789',
            namaLengkap: 'Budi Santoso',
            semester: 1,
            programStudi: 'S1 Teknik Informatika',
            kelas: 'TI-A',
            angkatan: 2023
        });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Disposition', `attachment; filename="template_mahasiswa.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Get Template Mahasiswa error:', error);
        res.status(500).json({ error: 'Gagal generate template' });
    }
};

// Generate Template Excel for Staff
export const getTemplateStaff = async (req: Request, res: Response) => {
    try {
        const ExcelJS = (await import('exceljs')).default;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Staff');

        worksheet.columns = [
            { header: 'No', key: 'no', width: 5 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'NIP/NIDN', key: 'nip', width: 20 },
            { header: 'Nama Lengkap', key: 'namaLengkap', width: 40 },
            { header: 'Role', key: 'role', width: 20 },
            { header: 'Program Studi', key: 'programStudi', width: 30 },
            { header: 'Fakultas', key: 'fakultas', width: 30 }
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
            email: 'dosen@example.com',
            nip: '198001012005011001',
            namaLengkap: 'Dr. Joko, S.T., M.T.',
            role: 'dosen',
            programStudi: 'S1 Teknik Informatika',
            fakultas: 'Fakultas Teknik'
        });

        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Disposition', `attachment; filename="template_staff.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Get Template Staff error:', error);
        res.status(500).json({ error: 'Gagal generate template' });
    }
};

// Import Staff from Excel
export const importStaff = async (req: Request, res: Response) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'File Excel harus diupload' });
        }

        const ExcelJS = (await import('exceljs')).default;
        const prisma = (await import('../lib/prisma.js')).prisma;
        const bcrypt = (await import('bcryptjs')).default;

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
            return res.status(400).json({ error: 'Tidak ada sheet yang ditemukan dalam file Excel' });
        }

        const errors: string[] = [];
        const successes: any[] = [];

        for (const worksheet of workbook.worksheets) {
            let rowNumber = 1;
            let isFirstRow = true;

            let emailIdx = 2, nipIdx = 3, namaIdx = 4, roleIdx = 5, prodiIdx = 6, fakultasIdx = 7;

            for (const row of worksheet.getSheetValues() as any[]) {
                rowNumber++;
                if (!row || row.length === 0) continue;

            if (isFirstRow) {
                isFirstRow = false;
                // Try to parse headers dynamically
                let hasHeader = false;
                for (let i = 1; i < row.length; i++) {
                    const val = String(getCellValue(row[i])).toLowerCase().trim();
                    if (val.includes('email') || val.includes('e-mail')) { emailIdx = i; hasHeader = true; }
                    else if (val.includes('nip') || val.includes('nidn')) { nipIdx = i; hasHeader = true; }
                    else if (val.includes('nama')) { namaIdx = i; hasHeader = true; }
                    else if (val.includes('role')) { roleIdx = i; hasHeader = true; }
                    else if (val.includes('program studi') || val === 'prodi') { prodiIdx = i; hasHeader = true; }
                    else if (val.includes('fakultas')) { fakultasIdx = i; hasHeader = true; }
                }
                if (hasHeader) continue; // Skip header row
            }

            const email = getCellValue(row[emailIdx]);
            const nip = getCellValue(row[nipIdx]);
            const namaLengkap = getCellValue(row[namaIdx]);
            const role = getCellValue(row[roleIdx]);
            const programStudi = getCellValue(row[prodiIdx]);
            const fakultas = getCellValue(row[fakultasIdx]);

            if (!email || !namaLengkap || !role) {
                if (email || namaLengkap || role) {
                    errors.push(`Baris ${rowNumber}: Email, Nama Lengkap, dan Role harus diisi (Terbaca -> Email: "${email}", Nama: "${namaLengkap}", Role: "${role}")`);
                }
                continue;
            }

            try {
                let prodiId, fakultasId;

                if (programStudi) {
                    const prodiData = await prisma.prodi.findFirst({
                        where: { nama: programStudi as string }
                    });
                    prodiId = prodiData?.id;
                }

                if (fakultas) {
                    const fakultasData = await prisma.fakultas.findFirst({
                        where: { nama: fakultas as string }
                    });
                    fakultasId = fakultasData?.id;
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
                                    nip: nip as string,
                                    nidn: nip as string,
                                    namaLengkap: namaLengkap as string,
                                    prodiId,
                                    fakultasId
                                }
                            }
                        }
                    });
                    successes.push({ row: rowNumber, email, action: 'updated' });
                } else {
                    // Create new
                    const hashedPassword = await bcrypt.hash('password123', 10);
                    // Check if role exists
                    const roleData = await prisma.role.findUnique({
                        where: { name: (role as string).toLowerCase() }
                    });
                    if (!roleData) {
                        errors.push(`Baris ${rowNumber}: Role ${role} tidak valid`);
                        continue;
                    }

                    await prisma.user.create({
                        data: {
                            email: email as string,
                            passwordHash: hashedPassword,
                            role: {
                                create: {
                                    role: {
                                        connect: { name: (role as string).toLowerCase() }
                                    }
                                }
                            },
                            profile: {
                                create: {
                                    nip: nip as string,
                                    nidn: nip as string,
                                    namaLengkap: namaLengkap as string,
                                    prodiId,
                                    fakultasId
                                }
                            }
                        }
                    });
                    successes.push({ row: rowNumber, email, action: 'created' });
                }

} catch (error: any) {
                errors.push(`Sheet ${worksheet.name} Baris ${rowNumber} (${email}): ${error.message || 'Gagal menyimpan data'}`);
            }
        }
        } // end of worksheet loop

        res.json({
            message: `Import selesai. ${successes.length} data berhasil diproses.`,
            successCount: successes.length,
            errors: errors.length > 0 ? errors : undefined,
            note: 'Password default untuk staff baru: password123'
        });

    } catch (error: any) {
        console.error('Import Staff error:', error);
        res.status(500).json({ error: 'Gagal import data Staff: ' + (error.message || String(error)) });
    }
};
