// ============================================
// Prisma Seed Script
// ============================================
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding database...\n');
    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    // Create admin user
    console.log('Creating admin user...');
    const admin = await prisma.user.create({
        data: {
            email: 'admin@sistem-cpl.ac.id',
            passwordHash: hashedPassword,
            emailVerified: true,
            role: {
                create: {
                    role: 'admin'
                }
            },
            profile: {
                create: {
                    namaLengkap: 'Administrator System',
                    nip: '198800000001',
                    noTelepon: '081234567890',
                    alamat: 'Jl. Administrasi No. 1, Jakarta'
                }
            }
        }
    });
    console.log('✅ Admin created\n');
    // 2. Create Dosen
    console.log('\nCreating dosen users...');
    const dosen1 = await prisma.user.create({
        data: {
            email: 'dosen1@sistem-cpl.ac.id',
            passwordHash: hashedPassword,
            emailVerified: true,
            role: {
                create: { role: 'dosen' }
            },
            profile: {
                create: {
                    namaLengkap: 'Dr. Budi Santoso, M.Kom',
                    nip: '198801010001',
                    programStudi: 'Teknik Informatika'
                }
            }
        }
    });
    const dosen2 = await prisma.user.create({
        data: {
            email: 'dosen2@sistem-cpl.ac.id',
            passwordHash: hashedPassword,
            emailVerified: true,
            role: {
                create: { role: 'dosen' }
            },
            profile: {
                create: {
                    namaLengkap: 'Dr. Siti Aisyah, M.T',
                    nip: '198802020002',
                    programStudi: 'Teknik Informatika'
                }
            }
        }
    });
    console.log('✅ Dosen users created');
    // 3. Create Mahasiswa
    console.log('\nCreating mahasiswa users...');
    const mhs1 = await prisma.user.create({
        data: {
            email: 'mahasiswa1@sistem-cpl.ac.id',
            passwordHash: hashedPassword,
            emailVerified: true,
            role: {
                create: { role: 'mahasiswa' }
            },
            profile: {
                create: {
                    namaLengkap: 'Ahmad Rizki Wijaya',
                    nim: '2101010001',
                    programStudi: 'Teknik Informatika',
                    semester: 5,
                    tahunMasuk: 2021
                }
            }
        }
    });
    const mhs2 = await prisma.user.create({
        data: {
            email: 'mahasiswa2@sistem-cpl.ac.id',
            passwordHash: hashedPassword,
            emailVerified: true,
            role: {
                create: { role: 'mahasiswa' }
            },
            profile: {
                create: {
                    namaLengkap: 'Siti Nurhaliza',
                    nim: '2101010002',
                    programStudi: 'Teknik Informatika',
                    semester: 5,
                    tahunMasuk: 2021
                }
            }
        }
    });
    const mhs3 = await prisma.user.create({
        data: {
            email: 'mahasiswa3@sistem-cpl.ac.id',
            passwordHash: hashedPassword,
            emailVerified: true,
            role: {
                create: { role: 'mahasiswa' }
            },
            profile: {
                create: {
                    namaLengkap: 'Budi Hartono',
                    nim: '2101010003',
                    programStudi: 'Teknik Informatika',
                    semester: 5,
                    tahunMasuk: 2021
                }
            }
        }
    });
    console.log('✅ Mahasiswa users created');
    // 4. Create CPL
    console.log('\nCreating CPL...');
    const cpl1 = await prisma.cpl.create({
        data: {
            kodeCpl: 'CPL-01',
            deskripsi: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi',
            kategori: 'Sikap',
            createdBy: admin.id
        }
    });
    const cpl2 = await prisma.cpl.create({
        data: {
            kodeCpl: 'CPL-02',
            deskripsi: 'Menguasai konsep teoretis dan prinsip rekayasa perangkat lunak',
            kategori: 'Pengetahuan',
            createdBy: admin.id
        }
    });
    const cpl3 = await prisma.cpl.create({
        data: {
            kodeCpl: 'CPL-03',
            deskripsi: 'Mampu merancang dan mengimplementasikan sistem informasi',
            kategori: 'Keterampilan Umum',
            createdBy: admin.id
        }
    });
    const cpl4 = await prisma.cpl.create({
        data: {
            kodeCpl: 'CPL-04',
            deskripsi: 'Mampu bekerja sama dalam tim multidisiplin',
            kategori: 'Keterampilan Khusus',
            createdBy: admin.id
        }
    });
    const cpl5 = await prisma.cpl.create({
        data: {
            kodeCpl: 'CPL-05',
            deskripsi: 'Mampu mengidentifikasi, menganalisis, dan merumuskan solusi permasalahan',
            kategori: 'Keterampilan Umum',
            createdBy: admin.id
        }
    });
    console.log('✅ CPL created');
    // 5. Create Mata Kuliah
    console.log('\nCreating Mata Kuliah...');
    const mk1 = await prisma.mataKuliah.create({
        data: {
            kodeMk: 'IF-101',
            namaMk: 'Pemrograman Dasar',
            sks: 3,
            semester: 1,
            createdBy: dosen1.id
        }
    });
    const mk2 = await prisma.mataKuliah.create({
        data: {
            kodeMk: 'IF-102',
            namaMk: 'Algoritma dan Struktur Data',
            sks: 3,
            semester: 2,
            createdBy: dosen1.id
        }
    });
    const mk3 = await prisma.mataKuliah.create({
        data: {
            kodeMk: 'IF-201',
            namaMk: 'Basis Data',
            sks: 3,
            semester: 3,
            createdBy: dosen2.id
        }
    });
    const mk4 = await prisma.mataKuliah.create({
        data: {
            kodeMk: 'IF-202',
            namaMk: 'Pemrograman Web',
            sks: 3,
            semester: 4,
            createdBy: dosen2.id
        }
    });
    const mk5 = await prisma.mataKuliah.create({
        data: {
            kodeMk: 'IF-301',
            namaMk: 'Rekayasa Perangkat Lunak',
            sks: 3,
            semester: 5,
            createdBy: dosen1.id
        }
    });
    const mk6 = await prisma.mataKuliah.create({
        data: {
            kodeMk: 'IF-302',
            namaMk: 'Sistem Informasi',
            sks: 3,
            semester: 5,
            createdBy: dosen2.id
        }
    });
    const mk7 = await prisma.mataKuliah.create({
        data: {
            kodeMk: 'IF-401',
            namaMk: 'Machine Learning',
            sks: 3,
            semester: 7,
            createdBy: dosen1.id
        }
    });
    console.log('✅ Mata Kuliah created');
    // 6. Create CPL - Mata Kuliah Mapping
    console.log('\nCreating CPL-MK mappings...');
    await prisma.cplMataKuliah.createMany({
        data: [
            // IF-101: Pemrograman Dasar
            { cplId: cpl1.id, mataKuliahId: mk1.id, bobotKontribusi: 1.0 },
            { cplId: cpl3.id, mataKuliahId: mk1.id, bobotKontribusi: 1.0 },
            // IF-102: Algoritma
            { cplId: cpl1.id, mataKuliahId: mk2.id, bobotKontribusi: 1.0 },
            { cplId: cpl2.id, mataKuliahId: mk2.id, bobotKontribusi: 1.0 },
            { cplId: cpl5.id, mataKuliahId: mk2.id, bobotKontribusi: 1.0 },
            // IF-201: Basis Data
            { cplId: cpl2.id, mataKuliahId: mk3.id, bobotKontribusi: 1.0 },
            { cplId: cpl3.id, mataKuliahId: mk3.id, bobotKontribusi: 1.0 },
            // IF-202: Web
            { cplId: cpl2.id, mataKuliahId: mk4.id, bobotKontribusi: 1.0 },
            { cplId: cpl3.id, mataKuliahId: mk4.id, bobotKontribusi: 1.0 },
            { cplId: cpl4.id, mataKuliahId: mk4.id, bobotKontribusi: 1.0 },
            // IF-301: RPL
            { cplId: cpl2.id, mataKuliahId: mk5.id, bobotKontribusi: 1.5 },
            { cplId: cpl3.id, mataKuliahId: mk5.id, bobotKontribusi: 1.5 },
            { cplId: cpl4.id, mataKuliahId: mk5.id, bobotKontribusi: 1.0 },
            { cplId: cpl5.id, mataKuliahId: mk5.id, bobotKontribusi: 1.0 },
            // IF-302: SI
            { cplId: cpl3.id, mataKuliahId: mk6.id, bobotKontribusi: 1.0 },
            { cplId: cpl4.id, mataKuliahId: mk6.id, bobotKontribusi: 1.0 },
            // IF-401: ML
            { cplId: cpl2.id, mataKuliahId: mk7.id, bobotKontribusi: 1.0 },
            { cplId: cpl5.id, mataKuliahId: mk7.id, bobotKontribusi: 1.5 },
        ]
    });
    console.log('✅ CPL-MK mappings created');
    // 7. Create Nilai CPL
    console.log('\nCreating Nilai CPL...');
    await prisma.nilaiCpl.createMany({
        data: [
            // Mahasiswa 1 - Semester 1-5
            { mahasiswaId: mhs1.id, cplId: cpl1.id, mataKuliahId: mk1.id, nilai: 85.00, semester: 1, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs1.id, cplId: cpl3.id, mataKuliahId: mk1.id, nilai: 82.00, semester: 1, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs1.id, cplId: cpl1.id, mataKuliahId: mk2.id, nilai: 88.00, semester: 2, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs1.id, cplId: cpl2.id, mataKuliahId: mk2.id, nilai: 85.00, semester: 2, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs1.id, cplId: cpl5.id, mataKuliahId: mk2.id, nilai: 87.00, semester: 2, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs1.id, cplId: cpl2.id, mataKuliahId: mk3.id, nilai: 90.00, semester: 3, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs1.id, cplId: cpl3.id, mataKuliahId: mk3.id, nilai: 88.00, semester: 3, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs1.id, cplId: cpl2.id, mataKuliahId: mk4.id, nilai: 85.00, semester: 4, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs1.id, cplId: cpl3.id, mataKuliahId: mk4.id, nilai: 87.00, semester: 4, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs1.id, cplId: cpl4.id, mataKuliahId: mk4.id, nilai: 90.00, semester: 4, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs1.id, cplId: cpl2.id, mataKuliahId: mk5.id, nilai: 92.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
            { mahasiswaId: mhs1.id, cplId: cpl3.id, mataKuliahId: mk5.id, nilai: 90.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
            { mahasiswaId: mhs1.id, cplId: cpl4.id, mataKuliahId: mk5.id, nilai: 88.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
            { mahasiswaId: mhs1.id, cplId: cpl5.id, mataKuliahId: mk5.id, nilai: 89.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
            // Mahasiswa 2 - Semester 1-5
            { mahasiswaId: mhs2.id, cplId: cpl1.id, mataKuliahId: mk1.id, nilai: 78.00, semester: 1, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs2.id, cplId: cpl3.id, mataKuliahId: mk1.id, nilai: 80.00, semester: 1, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs2.id, cplId: cpl1.id, mataKuliahId: mk2.id, nilai: 82.00, semester: 2, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs2.id, cplId: cpl2.id, mataKuliahId: mk2.id, nilai: 79.00, semester: 2, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs2.id, cplId: cpl5.id, mataKuliahId: mk2.id, nilai: 81.00, semester: 2, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs2.id, cplId: cpl2.id, mataKuliahId: mk3.id, nilai: 85.00, semester: 3, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs2.id, cplId: cpl3.id, mataKuliahId: mk3.id, nilai: 83.00, semester: 3, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs2.id, cplId: cpl2.id, mataKuliahId: mk4.id, nilai: 80.00, semester: 4, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs2.id, cplId: cpl3.id, mataKuliahId: mk4.id, nilai: 82.00, semester: 4, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs2.id, cplId: cpl4.id, mataKuliahId: mk4.id, nilai: 85.00, semester: 4, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs2.id, cplId: cpl2.id, mataKuliahId: mk5.id, nilai: 87.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
            { mahasiswaId: mhs2.id, cplId: cpl3.id, mataKuliahId: mk5.id, nilai: 85.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
            { mahasiswaId: mhs2.id, cplId: cpl4.id, mataKuliahId: mk5.id, nilai: 83.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
            { mahasiswaId: mhs2.id, cplId: cpl5.id, mataKuliahId: mk5.id, nilai: 84.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
            // Mahasiswa 3 - Semester 1-5
            { mahasiswaId: mhs3.id, cplId: cpl1.id, mataKuliahId: mk1.id, nilai: 92.00, semester: 1, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs3.id, cplId: cpl3.id, mataKuliahId: mk1.id, nilai: 90.00, semester: 1, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs3.id, cplId: cpl1.id, mataKuliahId: mk2.id, nilai: 95.00, semester: 2, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs3.id, cplId: cpl2.id, mataKuliahId: mk2.id, nilai: 93.00, semester: 2, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs3.id, cplId: cpl5.id, mataKuliahId: mk2.id, nilai: 94.00, semester: 2, tahunAjaran: '2021/2022', createdBy: dosen1.id },
            { mahasiswaId: mhs3.id, cplId: cpl2.id, mataKuliahId: mk3.id, nilai: 96.00, semester: 3, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs3.id, cplId: cpl3.id, mataKuliahId: mk3.id, nilai: 94.00, semester: 3, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs3.id, cplId: cpl2.id, mataKuliahId: mk4.id, nilai: 92.00, semester: 4, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs3.id, cplId: cpl3.id, mataKuliahId: mk4.id, nilai: 93.00, semester: 4, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs3.id, cplId: cpl4.id, mataKuliahId: mk4.id, nilai: 95.00, semester: 4, tahunAjaran: '2022/2023', createdBy: dosen2.id },
            { mahasiswaId: mhs3.id, cplId: cpl2.id, mataKuliahId: mk5.id, nilai: 97.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
            { mahasiswaId: mhs3.id, cplId: cpl3.id, mataKuliahId: mk5.id, nilai: 95.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
            { mahasiswaId: mhs3.id, cplId: cpl4.id, mataKuliahId: mk5.id, nilai: 93.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
            { mahasiswaId: mhs3.id, cplId: cpl5.id, mataKuliahId: mk5.id, nilai: 94.00, semester: 5, tahunAjaran: '2023/2024', createdBy: dosen1.id },
        ]
    });
    console.log('✅ Nilai CPL created');
    // 8. Create CPMK (Capaian Pembelajaran Mata Kuliah)
    console.log('\nCreating CPMK...');
    // CPMK untuk IF-101: Pemrograman Dasar
    const cpmk1 = await prisma.cpmk.create({
        data: {
            kodeCpmk: 'CPMK 1',
            deskripsi: 'Mahasiswa mampu memahami konsep dasar pemrograman',
            mataKuliahId: mk1.id,
            createdBy: dosen1.id
        }
    });
    const cpmk2 = await prisma.cpmk.create({
        data: {
            kodeCpmk: 'CPMK 2',
            deskripsi: 'Mahasiswa mampu membuat program sederhana menggunakan bahasa pemrograman',
            mataKuliahId: mk1.id,
            createdBy: dosen1.id
        }
    });
    // CPMK untuk IF-102: Algoritma dan Struktur Data
    const cpmk3 = await prisma.cpmk.create({
        data: {
            kodeCpmk: 'CPMK 1',
            deskripsi: 'Mahasiswa mampu menganalisis kompleksitas algoritma',
            mataKuliahId: mk2.id,
            createdBy: dosen1.id
        }
    });
    const cpmk4 = await prisma.cpmk.create({
        data: {
            kodeCpmk: 'CPMK 2',
            deskripsi: 'Mahasiswa mampu mengimplementasikan struktur data dasar',
            mataKuliahId: mk2.id,
            createdBy: dosen1.id
        }
    });
    // CPMK untuk IF-201: Basis Data
    const cpmk5 = await prisma.cpmk.create({
        data: {
            kodeCpmk: 'CPMK 1',
            deskripsi: 'Mahasiswa mampu merancang database yang terstruktur',
            mataKuliahId: mk3.id,
            createdBy: dosen2.id
        }
    });
    const cpmk6 = await prisma.cpmk.create({
        data: {
            kodeCpmk: 'CPMK 2',
            deskripsi: 'Mahasiswa mampu menggunakan SQL untuk manipulasi data',
            mataKuliahId: mk3.id,
            createdBy: dosen2.id
        }
    });
    console.log('✅ CPMK created');
    // 9. Create CPMK-CPL Mapping
    console.log('\nCreating CPMK-CPL mappings...');
    await prisma.cpmkCplMapping.createMany({
        data: [
            // CPMK 1 (IF-101) -> CPL 1 (60%), CPL 3 (40%) = 100%
            { cpmkId: cpmk1.id, cplId: cpl1.id, bobotPersentase: 60 },
            { cpmkId: cpmk1.id, cplId: cpl3.id, bobotPersentase: 40 },
            // CPMK 2 (IF-101) -> CPL 1 (30%), CPL 3 (70%) = 100%
            { cpmkId: cpmk2.id, cplId: cpl1.id, bobotPersentase: 30 },
            { cpmkId: cpmk2.id, cplId: cpl3.id, bobotPersentase: 70 },
            // CPMK 1 (IF-102) -> CPL 1 (50%), CPL 5 (50%) = 100%
            { cpmkId: cpmk3.id, cplId: cpl1.id, bobotPersentase: 50 },
            { cpmkId: cpmk3.id, cplId: cpl5.id, bobotPersentase: 50 },
            // CPMK 2 (IF-102) -> CPL 2 (40%), CPL 5 (60%) = 100%
            { cpmkId: cpmk4.id, cplId: cpl2.id, bobotPersentase: 40 },
            { cpmkId: cpmk4.id, cplId: cpl5.id, bobotPersentase: 60 },
            // CPMK 1 (IF-201) -> CPL 2 (70%), CPL 3 (30%) = 100%
            { cpmkId: cpmk5.id, cplId: cpl2.id, bobotPersentase: 70 },
            { cpmkId: cpmk5.id, cplId: cpl3.id, bobotPersentase: 30 },
            // CPMK 2 (IF-201) -> CPL 2 (50%), CPL 3 (50%) = 100%
            { cpmkId: cpmk6.id, cplId: cpl2.id, bobotPersentase: 50 },
            { cpmkId: cpmk6.id, cplId: cpl3.id, bobotPersentase: 50 },
        ]
    });
    console.log('✅ CPMK-CPL mappings created');
    // 10. Create Teknik Penilaian
    console.log('\nCreating Teknik Penilaian...');
    await prisma.teknikPenilaian.createMany({
        data: [
            // Teknik Penilaian untuk CPMK 1 (IF-101) = 100%
            { cpmkId: cpmk1.id, namaTeknik: 'Tes tertulis', bobotPersentase: 50, deskripsi: 'Ujian tengah semester' },
            { cpmkId: cpmk1.id, namaTeknik: 'Observasi', bobotPersentase: 30, deskripsi: 'Observasi praktikum' },
            { cpmkId: cpmk1.id, namaTeknik: 'Tugas', bobotPersentase: 20, deskripsi: 'Tugas mingguan' },
            // Teknik Penilaian untuk CPMK 2 (IF-101) = 100%
            { cpmkId: cpmk2.id, namaTeknik: 'Unjuk kerja', bobotPersentase: 60, deskripsi: 'Project akhir pemrograman' },
            { cpmkId: cpmk2.id, namaTeknik: 'Tes tertulis', bobotPersentase: 40, deskripsi: 'Ujian akhir semester' },
            // Teknik Penilaian untuk CPMK 1 (IF-102) = 100%
            { cpmkId: cpmk3.id, namaTeknik: 'Angket', bobotPersentase: 20, deskripsi: 'Penilaian pemahaman konsep' },
            { cpmkId: cpmk3.id, namaTeknik: 'Tes tertulis', bobotPersentase: 50, deskripsi: 'Ujian tengah semester' },
            { cpmkId: cpmk3.id, namaTeknik: 'Tugas', bobotPersentase: 30, deskripsi: 'Analisis algoritma' },
            // Teknik Penilaian untuk CPMK 2 (IF-102) = 100%
            { cpmkId: cpmk4.id, namaTeknik: 'Praktikum', bobotPersentase: 70, deskripsi: 'Implementasi struktur data' },
            { cpmkId: cpmk4.id, namaTeknik: 'Tes tertulis', bobotPersentase: 30, deskripsi: 'Ujian akhir' },
            // Teknik Penilaian untuk CPMK 1 (IF-201) = 100%
            { cpmkId: cpmk5.id, namaTeknik: 'Project', bobotPersentase: 50, deskripsi: 'Desain database untuk kasus nyata' },
            { cpmkId: cpmk5.id, namaTeknik: 'Tes tertulis', bobotPersentase: 30, deskripsi: 'Ujian normalisasi database' },
            { cpmkId: cpmk5.id, namaTeknik: 'Presentasi', bobotPersentase: 20, deskripsi: 'Presentasi rancangan ERD' },
            // Teknik Penilaian untuk CPMK 2 (IF-201) = 100%
            { cpmkId: cpmk6.id, namaTeknik: 'Praktikum', bobotPersentase: 60, deskripsi: 'Query SQL kompleks' },
            { cpmkId: cpmk6.id, namaTeknik: 'Kuis', bobotPersentase: 20, deskripsi: 'Kuis mingguan SQL' },
            { cpmkId: cpmk6.id, namaTeknik: 'Tes tertulis', bobotPersentase: 20, deskripsi: 'Ujian akhir SQL' },
        ]
    });
    console.log('✅ Teknik Penilaian created');
    console.log('\n✅ Seeding completed successfully!\n');
    console.log('Summary:');
    console.log('- 6 users (1 admin, 2 dosen, 3 mahasiswa)');
    console.log('- 5 CPL');
    console.log('- 7 Mata Kuliah');
    console.log('- 18 CPL-MK mappings');
    console.log('- 6 CPMK');
    console.log('- 12 CPMK-CPL mappings');
    console.log('- 16 Teknik Penilaian');
    console.log('- 42 Nilai CPL records\n');
    console.log('Default credentials:');
    console.log('Email: admin@sistem-cpl.ac.id | Password: admin123');
    console.log('Email: dosen1@sistem-cpl.ac.id | Password: admin123');
    console.log('Email: mahasiswa1@sistem-cpl.ac.id | Password: admin123');
    console.log('Email: mahasiswa2@sistem-cpl.ac.id | Password: admin123');
    console.log('Email: mahasiswa3@sistem-cpl.ac.id | Password: admin123\n');
}
main()
    .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
