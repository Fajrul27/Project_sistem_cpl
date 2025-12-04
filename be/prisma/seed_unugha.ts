import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding UNUGHA data...');

    // 1. Seed Fakultas & Prodi
    console.log('Seeding Fakultas & Prodi...');

    const faculties = [
        {
            kode: 'FMIKOM',
            nama: 'Fakultas Matematika dan Komputer',
            prodi: [
                { kode: 'TI', nama: 'Teknik Informatika', jenjang: 'S1' },
                { kode: 'SI', nama: 'Sistem Informasi', jenjang: 'S1' },
                { kode: 'MAT', nama: 'Matematika', jenjang: 'S1' },
            ]
        },
        {
            kode: 'FE',
            nama: 'Fakultas Ekonomi',
            prodi: [
                { kode: 'MNJ', nama: 'Manajemen', jenjang: 'S1' },
                { kode: 'EP', nama: 'Ekonomi Pembangunan', jenjang: 'S1' },
            ]
        },
        {
            kode: 'FTI',
            nama: 'Fakultas Teknologi Industri',
            prodi: [
                { kode: 'TIND', nama: 'Teknik Industri', jenjang: 'S1' },
                { kode: 'TMES', nama: 'Teknik Mesin', jenjang: 'S1' },
                { kode: 'TKIM', nama: 'Teknik Kimia', jenjang: 'S1' },
            ]
        },
        {
            kode: 'FKIP',
            nama: 'Fakultas Keguruan dan Ilmu Pendidikan',
            prodi: [
                { kode: 'PGSD', nama: 'Pendidikan Guru Sekolah Dasar', jenjang: 'S1' },
                { kode: 'BK', nama: 'Bimbingan Konseling', jenjang: 'S1' },
            ]
        },
        {
            kode: 'FKI',
            nama: 'Fakultas Keagamaan Islam',
            prodi: [
                { kode: 'PAI', nama: 'Pendidikan Agama Islam', jenjang: 'S1' },
                { kode: 'PGMI', nama: 'Pendidikan Guru Madrasah Ibtidaiyah', jenjang: 'S1' },
                { kode: 'PIAUD', nama: 'Pendidikan Islam Anak Usia Dini', jenjang: 'S1' },
                { kode: 'MPI', nama: 'Manajemen Pendidikan Islam', jenjang: 'S1' },
                { kode: 'HKI', nama: 'Hukum Keluarga Islam', jenjang: 'S1' },
                { kode: 'KPI', nama: 'Komunikasi Penyiaran Islam', jenjang: 'S1' },
            ]
        }
    ];

    for (const f of faculties) {
        const fakultas = await prisma.fakultas.upsert({
            where: { kode: f.kode },
            update: { nama: f.nama },
            create: { kode: f.kode, nama: f.nama }
        });

        for (const p of f.prodi) {
            await prisma.prodi.upsert({
                where: { nama: p.nama },
                update: { kode: p.kode, jenjang: p.jenjang, fakultasId: fakultas.id },
                create: { kode: p.kode, nama: p.nama, jenjang: p.jenjang, fakultasId: fakultas.id }
            });
        }
    }

    // Get Prodi TI for detailed data
    const prodiTI = await prisma.prodi.findUnique({ where: { nama: 'Teknik Informatika' } });
    if (!prodiTI) throw new Error('Prodi TI not found');

    // 2. Seed Users
    console.log('Seeding Users...');
    const passwordHash = await bcrypt.hash('123456', 10);

    // Admin
    const adminEmail = 'admin@unugha.ac.id';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
        await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash,
                role: { create: { role: 'admin' } },
                profile: { create: { namaLengkap: 'Administrator UNUGHA' } }
            }
        });
    }

    // Kaprodi TI
    const kaprodiEmail = 'kaprodi.ti@unugha.ac.id';
    const existingKaprodi = await prisma.user.findUnique({ where: { email: kaprodiEmail } });
    if (!existingKaprodi) {
        await prisma.user.create({
            data: {
                email: kaprodiEmail,
                passwordHash,
                role: { create: { role: 'kaprodi' } },
                profile: {
                    create: {
                        namaLengkap: 'Bapak Kaprodi TI, M.Kom',
                        prodiId: prodiTI.id
                    }
                }
            }
        });
    }

    // Dosen TI
    const dosenNames = ['Ahmad Dosen, M.Kom', 'Budi Pengajar, M.T', 'Siti Edukator, M.Cs'];
    for (let i = 0; i < dosenNames.length; i++) {
        const email = `dosen${i + 1}@unugha.ac.id`;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
            await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    role: { create: { role: 'dosen' } },
                    profile: {
                        create: {
                            namaLengkap: dosenNames[i],
                            prodiId: prodiTI.id,
                            nip: `1980010${i + 1}`
                        }
                    }
                }
            });
        }
    }

    // Mahasiswa TI
    const mhsNames = ['Fajrul Mahasiswa', 'Dewi Belajar', 'Rudi Skripsi'];
    for (let i = 0; i < mhsNames.length; i++) {
        const email = `mhs${i + 1}@student.unugha.ac.id`;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
            await prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    role: { create: { role: 'mahasiswa' } },
                    profile: {
                        create: {
                            namaLengkap: mhsNames[i],
                            prodiId: prodiTI.id,
                            nim: `20210100${i + 1}`,
                            tahunMasuk: 2021,
                            semester: 7
                        }
                    }
                }
            });
        }
    }

    // 3. Seed Visi Misi
    console.log('Seeding Visi Misi...');
    await prisma.visiMisi.deleteMany({ where: { prodiId: prodiTI.id } });

    await prisma.visiMisi.create({
        data: {
            prodiId: prodiTI.id,
            tipe: 'visi',
            teks: 'Menjadi Program Studi Teknik Informatika yang unggul dalam pengembangan teknologi cerdas berbasis nilai-nilai ke-NU-an pada tahun 2035.',
            urutan: 1
        }
    });

    const misis = [
        'Menyelenggarakan pendidikan berkualitas di bidang Teknik Informatika.',
        'Melakukan penelitian inovatif untuk memecahkan masalah masyarakat.',
        'Melaksanakan pengabdian kepada masyarakat berbasis teknologi tepat guna.'
    ];
    for (let i = 0; i < misis.length; i++) {
        await prisma.visiMisi.create({
            data: {
                prodiId: prodiTI.id,
                tipe: 'misi',
                teks: misis[i],
                urutan: i + 1
            }
        });
    }

    // 4. Seed Profil Lulusan
    console.log('Seeding Profil Lulusan...');
    const profiles = [
        { kode: 'PL-01', nama: 'Software Engineer', deskripsi: 'Mampu merancang, membangun, dan memelihara perangkat lunak.' },
        { kode: 'PL-02', nama: 'Data Analyst', deskripsi: 'Mampu menganalisis data untuk mendukung pengambilan keputusan.' },
        { kode: 'PL-03', nama: 'Network Administrator', deskripsi: 'Mampu mengelola infrastruktur jaringan komputer.' },
    ];

    for (const p of profiles) {
        await prisma.profilLulusan.upsert({
            where: { prodiId_kode: { prodiId: prodiTI.id, kode: p.kode } },
            update: {},
            create: {
                prodiId: prodiTI.id,
                kode: p.kode,
                nama: p.nama,
                deskripsi: p.deskripsi,
                isActive: true
            }
        });
    }

    // 5. Seed Kategori CPL
    console.log('Seeding Kategori CPL...');
    const kategoriCpl = [
        { nama: 'Sikap' },
        { nama: 'Pengetahuan' },
        { nama: 'Keterampilan Umum' },
        { nama: 'Keterampilan Khusus' }
    ];

    const kategoriMap: Record<string, string> = {};

    for (const k of kategoriCpl) {
        const kat = await prisma.kategoriCpl.upsert({
            where: { nama: k.nama },
            update: {},
            create: { nama: k.nama }
        });
        kategoriMap[k.nama] = kat.id;
    }

    // 6. Seed CPL (Capaian Pembelajaran Lulusan)
    console.log('Seeding CPL...');
    const cpls = [
        { kode: 'TI-CPL-01', deskripsi: 'Bertakwa kepada Tuhan Yang Maha Esa dan mampu menunjukkan sikap religius.', kategori: 'Sikap' },
        { kode: 'TI-CPL-02', deskripsi: 'Menjunjung tinggi nilai kemanusiaan dalam menjalankan tugas berdasarkan agama, moral, dan etika.', kategori: 'Sikap' },
        { kode: 'TI-CPL-03', deskripsi: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan IPTEK.', kategori: 'Keterampilan Umum' },
        { kode: 'TI-CPL-04', deskripsi: 'Mampu merancang dan mengimplementasikan solusi teknologi informasi yang efektif.', kategori: 'Keterampilan Khusus' },
        { kode: 'TI-CPL-05', deskripsi: 'Menguasai konsep teoritis bidang pengetahuan Ilmu Komputer/Informatika secara umum.', kategori: 'Pengetahuan' },
    ];

    for (const c of cpls) {
        await prisma.cpl.upsert({
            where: { kodeCpl: c.kode },
            update: {
                kategoriRef: { connect: { id: kategoriMap[c.kategori] } },
                kategori: c.kategori
            },
            create: {
                prodi: { connect: { id: prodiTI.id } },
                kodeCpl: c.kode,
                deskripsi: c.deskripsi,
                isActive: true,
                kategoriRef: { connect: { id: kategoriMap[c.kategori] } },
                kategori: c.kategori
            }
        });
    }

    // 6. Seed Mata Kuliah
    console.log('Seeding Mata Kuliah...');
    const matkuls = [
        { kode: 'TI101', nama: 'Pemrograman Dasar', sks: 3, semester: 1 },
        { kode: 'TI102', nama: 'Algoritma dan Struktur Data', sks: 3, semester: 2 },
        { kode: 'TI201', nama: 'Basis Data', sks: 3, semester: 3 },
        { kode: 'TI202', nama: 'Pemrograman Web', sks: 3, semester: 4 },
        { kode: 'TI301', nama: 'Kecerdasan Buatan', sks: 3, semester: 5 },
    ];

    for (const m of matkuls) {
        await prisma.mataKuliah.upsert({
            where: { kodeMk: m.kode },
            update: {},
            create: {
                prodi: { connect: { id: prodiTI.id } },
                kodeMk: m.kode,
                namaMk: m.nama,
                sks: m.sks,
                semester: m.semester,
                deskripsi: `Mata kuliah ${m.nama} untuk mahasiswa semester ${m.semester}`,
                // jenis: 'Wajib' 
            }
        });
    }

    // 7. Seed CPMK & Sub-CPMK (Example for Pemrograman Web)
    console.log('Seeding CPMK & Sub-CPMK...');
    const mkWeb = await prisma.mataKuliah.findUnique({
        where: { kodeMk: 'TI202' }
    });

    if (mkWeb) {
        // CPMK 1
        const cpmk1 = await prisma.cpmk.create({
            data: {
                mataKuliahId: mkWeb.id,
                kodeCpmk: 'CPMK-1',
                deskripsi: 'Mampu memahami konsep dasar web dan HTML/CSS.'
            }
        });

        await prisma.subCpmk.create({
            data: {
                cpmkId: cpmk1.id,
                kode: 'Sub-CPMK-1.1',
                deskripsi: 'Menjelaskan struktur dasar HTML5.',
                bobot: 50
            }
        });
        await prisma.subCpmk.create({
            data: {
                cpmkId: cpmk1.id,
                kode: 'Sub-CPMK-1.2',
                deskripsi: 'Menerapkan styling menggunakan CSS3.',
                bobot: 50
            }
        });

        // CPMK 2
        const cpmk2 = await prisma.cpmk.create({
            data: {
                mataKuliahId: mkWeb.id,
                kodeCpmk: 'CPMK-2',
                deskripsi: 'Mampu membangun aplikasi web dinamis dengan PHP/JS.'
            }
        });

        await prisma.subCpmk.create({
            data: {
                cpmkId: cpmk2.id,
                kode: 'Sub-CPMK-2.1',
                deskripsi: 'Membuat logika sisi klien dengan JavaScript.',
                bobot: 40
            }
        });
        await prisma.subCpmk.create({
            data: {
                cpmkId: cpmk2.id,
                kode: 'Sub-CPMK-2.2',
                deskripsi: 'Membangun backend sederhana dengan PHP.',
                bobot: 60
            }
        });
    }

    console.log('Seeding UNUGHA data completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
