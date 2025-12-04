import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const randomString = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomDecimal = (min: number, max: number, precision: number = 2) => {
    const val = Math.random() * (max - min) + min;
    return parseFloat(val.toFixed(precision));
};

// Data Nama Indonesia
const firstNames = [
    'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko',
    'Kartika', 'Lestari', 'Muhammad', 'Nur', 'Oki', 'Putri', 'Qori', 'Rina', 'Siti', 'Tono',
    'Umar', 'Vina', 'Wahyu', 'Xena', 'Yudi', 'Zainal', 'Adi', 'Bayu', 'Candra', 'Dian',
    'Faisal', 'Gilang', 'Hendra', 'Irfan', 'Jaya', 'Kurnia', 'Lina', 'Maulana', 'Nanda', 'Olivia',
    'Rizky', 'Sarah', 'Taufik', 'Utari', 'Vicky', 'Wulan', 'Yoga', 'Zahra', 'Agus', 'Bambang'
];

const lastNames = [
    'Saputra', 'Wibowo', 'Lestari', 'Kusuma', 'Pratama', 'Santoso', 'Hidayat', 'Nugroho', 'Pertiwi', 'Wijaya',
    'Ramadhan', 'Kurniawan', 'Setiawan', 'Utami', 'Mulyani', 'Rahayu', 'Susanti', 'Handayani', 'Sari', 'Putra',
    'Firmansyah', 'Aditya', 'Pradana', 'Kusumawardhani', 'Anggraini', 'Permata', 'Dewi', 'Suryana', 'Wahyudi', 'Irawan',
    'Siregar', 'Nasution', 'Lubis', 'Harahap', 'Hasibuan', 'Ritonga', 'Simanjuntak', 'Sihombing', 'Situmorang', 'Panjaitan'
];

const generateName = () => `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;

// ==========================================
// MAIN SEED FUNCTION
// ==========================================

async function main() {
    console.log('🌱 Memulai Seeding Simulasi Penuh UNUGHA...\n');
    const passwordHash = await bcrypt.hash('123456', 10);

    try {
        // 1. Data Referensi (Tahun Ajaran, Kurikulum, Jenis MK)
        console.log('📦 Membuat Data Referensi...');

        const tahunAjaran = await prisma.tahunAjaran.upsert({
            where: { nama: '2024/2025 Ganjil' },
            update: { isActive: true },
            create: { nama: '2024/2025 Ganjil', isActive: true }
        });

        const kurikulum = await prisma.kurikulum.upsert({
            where: { nama: 'Kurikulum OBE 2024' },
            update: { tahunMulai: 2024, isActive: true },
            create: { nama: 'Kurikulum OBE 2024', tahunMulai: 2024, isActive: true }
        });

        const jenisMkMap = new Map();
        for (const jenis of ['Wajib', 'Pilihan', 'Skripsi', 'PKL', 'KKN']) {
            const j = await prisma.jenisMataKuliah.upsert({
                where: { nama: jenis },
                update: {},
                create: { nama: jenis }
            });
            jenisMkMap.set(jenis, j.id);
        }

        // 2. Data Fakultas & Prodi (Lengkap)
        console.log('🏛️ Membuat Data Fakultas & Prodi...');

        const faculties = [
            {
                nama: 'Fakultas Matematika dan Ilmu Komputer',
                kode: 'FMIKOM',
                prodi: [
                    { nama: 'Teknik Informatika', kode: 'TI', jenjang: 'S1' },
                    { nama: 'Sistem Informasi', kode: 'SI', jenjang: 'S1' },
                    { nama: 'Matematika', kode: 'MAT', jenjang: 'S1' }
                ]
            },
            {
                nama: 'Fakultas Ekonomi',
                kode: 'FE',
                prodi: [
                    { nama: 'Manajemen', kode: 'MNJ', jenjang: 'S1' },
                    { nama: 'Ekonomi Pembangunan', kode: 'EP', jenjang: 'S1' }
                ]
            },
            {
                nama: 'Fakultas Teknologi Industri',
                kode: 'FTI',
                prodi: [
                    { nama: 'Teknik Industri', kode: 'TIND', jenjang: 'S1' },
                    { nama: 'Teknik Mesin', kode: 'TMES', jenjang: 'S1' },
                    { nama: 'Teknik Kimia', kode: 'TKIM', jenjang: 'S1' }
                ]
            },
            {
                nama: 'Fakultas Keguruan dan Ilmu Pendidikan',
                kode: 'FKIP',
                prodi: [
                    { nama: 'Pendidikan Guru SD', kode: 'PGSD', jenjang: 'S1' },
                    { nama: 'Bimbingan Konseling', kode: 'BK', jenjang: 'S1' }
                ]
            },
            {
                nama: 'Fakultas Keislaman',
                kode: 'FKI',
                prodi: [
                    { nama: 'Pendidikan Agama Islam', kode: 'PAI', jenjang: 'S1' },
                    { nama: 'Pendidikan Guru MI', kode: 'PGMI', jenjang: 'S1' },
                    { nama: 'Pendidikan Islam Anak Usia Dini', kode: 'PIAUD', jenjang: 'S1' },
                    { nama: 'Manajemen Pendidikan Islam', kode: 'MPI', jenjang: 'S1' },
                    { nama: 'Hukum Keluarga Islam', kode: 'HKI', jenjang: 'S1' },
                    { nama: 'Komunikasi Penyiaran Islam', kode: 'KPI', jenjang: 'S1' }
                ]
            }
        ];

        const prodiMap = new Map(); // Store prodi objects for later use

        for (const f of faculties) {
            const fakultas = await prisma.fakultas.upsert({
                where: { kode: f.kode },
                update: { nama: f.nama },
                create: { nama: f.nama, kode: f.kode }
            });

            for (const p of f.prodi) {
                const prodi = await prisma.prodi.upsert({
                    where: { nama: p.nama },
                    update: { kode: p.kode, jenjang: p.jenjang, fakultasId: fakultas.id },
                    create: { nama: p.nama, kode: p.kode, jenjang: p.jenjang, fakultasId: fakultas.id }
                });
                prodiMap.set(p.kode, prodi);
            }
        }

        const prodiTI = prodiMap.get('TI');
        console.log('DEBUG: prodiTI', prodiTI);




        // 1b. Data Referensi Tambahan (Angkatan, Semester, Kelas)
        console.log('📦 Membuat Data Referensi Tambahan (Angkatan, Semester, Kelas)...');

        const angkatanMap = new Map();
        for (let year = 2020; year <= 2024; year++) {
            const angkatan = await prisma.angkatan.upsert({
                where: { tahun: year },
                update: {},
                create: { tahun: year, isActive: true }
            });
            angkatanMap.set(year, angkatan.id);
        }

        const semesterMap = new Map();
        for (let i = 1; i <= 8; i++) {
            const sem = await prisma.semester.upsert({
                where: { angka: i },
                update: {},
                create: { nama: `Semester ${i}`, angka: i, isActive: true }
            });
            semesterMap.set(i, sem.id);
        }

        const kelasMap = new Map();
        for (const nama of ['A', 'B', 'C']) {
            const kls = await prisma.kelas.upsert({
                where: { nama },
                update: {},
                create: { nama }
            });
            kelasMap.set(nama, kls.id);
        }

        const cities = ['Jakarta', 'Surabaya', 'Bandung', 'Semarang', 'Yogyakarta', 'Malang', 'Solo', 'Bogor', 'Depok', 'Tangerang'];




        // 3. Visi Misi & Profil Lulusan
        console.log('🎯 Membuat Visi Misi & Profil Lulusan...');

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
        misis.forEach(async (teks, i) => {
            await prisma.visiMisi.create({
                data: { prodiId: prodiTI.id, tipe: 'misi', teks, urutan: i + 1 }
            });
        });

        const profilLulusanData = [
            { kode: 'PL-01', nama: 'Software Engineer', deskripsi: 'Mampu merancang, membangun, dan memelihara perangkat lunak.' },
            { kode: 'PL-02', nama: 'Data Analyst', deskripsi: 'Mampu menganalisis data untuk mendukung pengambilan keputusan.' },
            { kode: 'PL-03', nama: 'Network Administrator', deskripsi: 'Mampu mengelola infrastruktur jaringan komputer.' },
        ];

        const plMap = new Map();
        for (const pl of profilLulusanData) {
            const profil = await prisma.profilLulusan.upsert({
                where: { prodiId_kode: { prodiId: prodiTI.id, kode: pl.kode } },
                update: {},
                create: { ...pl, prodiId: prodiTI.id }
            });
            plMap.set(pl.kode, profil.id);
        }

        // 4. Kategori CPL & CPL
        console.log('📜 Membuat CPL...');
        const kategoriCpl = ['Sikap', 'Pengetahuan', 'Keterampilan Umum', 'Keterampilan Khusus'];
        const kategoriMap = new Map();

        for (const nama of kategoriCpl) {
            const kat = await prisma.kategoriCpl.upsert({
                where: { nama },
                update: {},
                create: { nama }
            });
            kategoriMap.set(nama, kat.id);
        }

        const cpls = [
            { kode: 'CPL-01', deskripsi: 'Bertakwa kepada Tuhan Yang Maha Esa dan mampu menunjukkan sikap religius.', kategori: 'Sikap' },
            { kode: 'CPL-02', deskripsi: 'Menjunjung tinggi nilai kemanusiaan dalam menjalankan tugas berdasarkan agama, moral, dan etika.', kategori: 'Sikap' },
            { kode: 'CPL-03', deskripsi: 'Menguasai konsep teoritis bidang pengetahuan Ilmu Komputer/Informatika secara umum.', kategori: 'Pengetahuan' },
            { kode: 'CPL-04', deskripsi: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan IPTEK.', kategori: 'Keterampilan Umum' },
            { kode: 'CPL-05', deskripsi: 'Mampu merancang dan mengimplementasikan solusi teknologi informasi yang efektif.', kategori: 'Keterampilan Khusus' },
            { kode: 'CPL-06', deskripsi: 'Mampu bekerja sama dan memiliki kepekaan sosial serta kepedulian terhadap masyarakat dan lingkungan.', kategori: 'Sikap' },
            { kode: 'CPL-07', deskripsi: 'Mampu mengambil keputusan secara tepat dalam konteks penyelesaian masalah di bidang keahliannya.', kategori: 'Keterampilan Umum' },
            { kode: 'CPL-08', deskripsi: 'Mampu mendokumentasikan, menyimpan, mengamankan, dan menemukan kembali data untuk menjamin kesahihan dan mencegah plagiasi.', kategori: 'Keterampilan Umum' },
        ];

        const cplMap = new Map();
        const cplIds: string[] = [];
        for (const c of cpls) {
            const cpl = await prisma.cpl.upsert({
                where: { kodeCpl: c.kode },
                update: { deskripsi: c.deskripsi, kategoriId: kategoriMap.get(c.kategori), prodiId: prodiTI.id },
                create: {
                    kodeCpl: c.kode,
                    deskripsi: c.deskripsi,
                    kategoriId: kategoriMap.get(c.kategori),
                    prodiId: prodiTI.id
                }
            });
            cplMap.set(c.kode, cpl.id);
            cplIds.push(cpl.id);
        }

        // Mapping Profil Lulusan -> CPL (Rigorous)
        console.log('🔗 Mapping Profil Lulusan ke CPL...');
        const plCplMap = [
            { pl: 'PL-01', cpls: ['CPL-03', 'CPL-04', 'CPL-05', 'CPL-06'] }, // Software Engineer
            { pl: 'PL-02', cpls: ['CPL-03', 'CPL-04', 'CPL-07', 'CPL-08'] }, // Data Analyst
            { pl: 'PL-03', cpls: ['CPL-03', 'CPL-05', 'CPL-06', 'CPL-07'] }, // Network Administrator
        ];

        for (const map of plCplMap) {
            const plId = plMap.get(map.pl);
            if (!plId) continue;

            for (const cplKode of map.cpls) {
                const cplId = cplMap.get(cplKode);
                if (!cplId) continue;

                const existing = await prisma.profilLulusanCpl.findFirst({
                    where: { profilLulusanId: plId, cplId: cplId }
                });

                if (!existing) {
                    await prisma.profilLulusanCpl.create({
                        data: { profilLulusanId: plId, cplId: cplId }
                    });
                }
            }
        }


        // Kaprodi
        const kaprodiEmail = 'kaprodi.ti@unugha.ac.id';
        let kaprodiUser = await prisma.user.findUnique({ where: { email: kaprodiEmail } });
        if (!kaprodiUser) {
            kaprodiUser = await prisma.user.create({
                data: {
                    email: kaprodiEmail,
                    passwordHash,
                    emailVerified: true,
                    role: { create: { role: 'kaprodi' } },
                    profile: {
                        create: {
                            namaLengkap: 'Bapak Kaprodi TI, M.Kom',
                            nidn: '0612345678',
                            prodiId: prodiTI.id
                        }
                    }
                }
            });

            // Kaprodi Data
            await prisma.kaprodiData.upsert({
                where: { prodiId: prodiTI.id },
                update: {},
                create: {
                    prodiId: prodiTI.id,
                    programStudi: prodiTI.nama,
                    namaKaprodi: 'Bapak Kaprodi TI, M.Kom',
                    nidnKaprodi: '0612345678'
                }
            });
        }

        // Dosen (Buat 10 Dosen)
        const dosenIds: string[] = [];
        for (let i = 1; i <= 10; i++) {
            const email = `dosen${i}@unugha.ac.id`;
            let dosen = await prisma.user.findUnique({ where: { email } });
            if (!dosen) {
                dosen = await prisma.user.create({
                    data: {
                        email,
                        passwordHash,
                        emailVerified: true,
                        role: { create: { role: 'dosen' } },
                        profile: {
                            create: {
                                namaLengkap: `Dosen ${generateName()}, M.Kom`,
                                nidn: `07${randomNumber(10000000, 99999999)}`,
                                nip: `198${randomNumber(0, 9)}01${randomNumber(1000, 9999)}`,
                                prodiId: prodiTI.id
                            }
                        }
                    }
                });
            }
            dosenIds.push(dosen.id);
        }

        // 6. Mata Kuliah & Courseware (CPMK, Rubrik, dll)
        console.log('📚 Membuat Mata Kuliah & Perangkat Pembelajaran...');

        const mkList = [
            // Semester 1
            { kode: 'TI-101', nama: 'Pengantar Teknologi Informasi', sks: 2, semester: 1 },
            { kode: 'TI-102', nama: 'Algoritma dan Pemrograman Dasar', sks: 4, semester: 1 },
            { kode: 'TI-103', nama: 'Matematika Diskrit', sks: 3, semester: 1 },
            { kode: 'TI-104', nama: 'Bahasa Inggris 1', sks: 2, semester: 1 },
            { kode: 'TI-105', nama: 'Pendidikan Agama', sks: 2, semester: 1 },
            // Semester 2
            { kode: 'TI-201', nama: 'Struktur Data', sks: 4, semester: 2 },
            { kode: 'TI-202', nama: 'Arsitektur Komputer', sks: 3, semester: 2 },
            { kode: 'TI-203', nama: 'Aljabar Linear', sks: 3, semester: 2 },
            { kode: 'TI-204', nama: 'Bahasa Inggris 2', sks: 2, semester: 2 },
            { kode: 'TI-205', nama: 'Pendidikan Kewarganegaraan', sks: 2, semester: 2 },
            // Semester 3
            { kode: 'TI-301', nama: 'Basis Data', sks: 4, semester: 3 },
            { kode: 'TI-302', nama: 'Pemrograman Berorientasi Objek', sks: 4, semester: 3 },
            { kode: 'TI-303', nama: 'Sistem Operasi', sks: 3, semester: 3 },
            { kode: 'TI-304', nama: 'Statistika Probabilitas', sks: 3, semester: 3 },
            { kode: 'TI-305', nama: 'Interaksi Manusia dan Komputer', sks: 3, semester: 3 },
            // Semester 4
            { kode: 'TI-401', nama: 'Pemrograman Web', sks: 4, semester: 4 },
            { kode: 'TI-402', nama: 'Jaringan Komputer', sks: 4, semester: 4 },
            { kode: 'TI-403', nama: 'Rekayasa Perangkat Lunak', sks: 3, semester: 4 },
            { kode: 'TI-404', nama: 'Kecerdasan Buatan', sks: 3, semester: 4 },
            { kode: 'TI-405', nama: 'Analisis Desain Sistem', sks: 3, semester: 4 },
            // Semester 5
            { kode: 'TI-501', nama: 'Pemrograman Mobile', sks: 4, semester: 5 },
            { kode: 'TI-502', nama: 'Keamanan Jaringan', sks: 3, semester: 5 },
            { kode: 'TI-503', nama: 'Data Mining', sks: 3, semester: 5 },
            { kode: 'TI-504', nama: 'Metodologi Penelitian', sks: 2, semester: 5 },
            { kode: 'TI-505', nama: 'Sistem Terdistribusi', sks: 3, semester: 5 },
            // Semester 6
            { kode: 'TI-601', nama: 'Kerja Praktik', sks: 2, semester: 6 },
            { kode: 'TI-602', nama: 'Manajemen Proyek TI', sks: 3, semester: 6 },
            { kode: 'TI-603', nama: 'Technopreneurship', sks: 2, semester: 6 },
            { kode: 'TI-604', nama: 'Machine Learning', sks: 3, semester: 6 },
            { kode: 'TI-605', nama: 'Cloud Computing', sks: 3, semester: 6 },
            // Semester 7
            { kode: 'TI-701', nama: 'Kuliah Kerja Nyata (KKN)', sks: 4, semester: 7 },
            { kode: 'TI-702', nama: 'Etika Profesi', sks: 2, semester: 7 },
            { kode: 'TI-703', nama: 'Kapita Selekta', sks: 2, semester: 7 },
            // Semester 8
            { kode: 'TI-801', nama: 'Skripsi', sks: 6, semester: 8 },
        ];

        const mkIds: { id: string, semester: number }[] = [];

        for (const m of mkList) {
            console.log(`   Processing MK: ${m.kode} - ${m.nama}`);

            const dosenPengampuId = getRandomItem(dosenIds);

            const mk = await prisma.mataKuliah.upsert({
                where: { kodeMk: m.kode },
                update: {},
                create: {
                    prodi: { connect: { id: prodiTI.id } },
                    kodeMk: m.kode,
                    namaMk: m.nama,
                    sks: m.sks,
                    semester: m.semester,
                    semesterRef: { connect: { id: semesterMap.get(m.semester) } },
                    programStudi: 'Teknik Informatika',
                    deskripsi: `Mata kuliah ${m.nama}`,
                    jenisMk: { connect: { id: jenisMkMap.get('Wajib') } },
                    kurikulum: { connect: { id: kurikulum.id } },
                    creator: { connect: { id: dosenPengampuId } }
                }
            });
            mkIds.push({ id: mk.id, semester: m.semester });

            // Assign Dosen Pengampu
            await prisma.mataKuliahPengampu.deleteMany({
                where: {
                    mataKuliahId: mk.id,
                    dosenId: dosenPengampuId,
                    kelasId: null
                }
            });

            await prisma.mataKuliahPengampu.create({
                data: {
                    mataKuliahId: mk.id,
                    dosenId: dosenPengampuId,
                    isPengampu: true
                }
            });

            // Clean up existing data for this MK to avoid duplicates on re-run
            await prisma.nilaiCpmk.deleteMany({ where: { mataKuliahId: mk.id } });
            await prisma.nilaiTeknikPenilaian.deleteMany({ where: { mataKuliahId: mk.id } });
            await prisma.cpmk.deleteMany({ where: { mataKuliahId: mk.id } });

            // Create CPMK (2 per MK)
            const cpmk1 = await prisma.cpmk.create({
                data: {
                    mataKuliahId: mk.id,
                    kodeCpmk: 'CPMK-1',
                    deskripsi: `Mampu memahami konsep dasar ${m.nama}.`,
                    createdBy: dosenPengampuId
                }
            });

            const cpmk2 = await prisma.cpmk.create({
                data: {
                    mataKuliahId: mk.id,
                    kodeCpmk: 'CPMK-2',
                    deskripsi: `Mampu mengimplementasikan ${m.nama} dalam studi kasus.`,
                    createdBy: dosenPengampuId
                }
            });

            // Map CPMK to CPL (Random)
            await prisma.cpmkCplMapping.create({
                data: { cpmkId: cpmk1.id, cplId: getRandomItem(cplIds), bobotPersentase: 100 }
            });
            await prisma.cpmkCplMapping.create({
                data: { cpmkId: cpmk2.id, cplId: getRandomItem(cplIds), bobotPersentase: 100 }
            });

            // Create Sub-CPMK (2 per CPMK)
            const subCpmk1 = await prisma.subCpmk.create({
                data: { cpmkId: cpmk1.id, kode: 'Sub-CPMK-1.1', deskripsi: 'Menjelaskan definisi dan teori.', bobot: 50 }
            });
            await prisma.subCpmk.create({
                data: { cpmkId: cpmk1.id, kode: 'Sub-CPMK-1.2', deskripsi: 'Menguraikan komponen utama.', bobot: 50 }
            });
            const subCpmk2 = await prisma.subCpmk.create({
                data: { cpmkId: cpmk2.id, kode: 'Sub-CPMK-2.1', deskripsi: 'Melakukan analisis masalah.', bobot: 50 }
            });
            await prisma.subCpmk.create({
                data: { cpmkId: cpmk2.id, kode: 'Sub-CPMK-2.2', deskripsi: 'Merancang solusi.', bobot: 50 }
            });

            // Create Teknik Penilaian (2 per CPMK)
            const teknik1 = await prisma.teknikPenilaian.create({
                data: { cpmkId: cpmk1.id, namaTeknik: 'Ujian Tulis', bobotPersentase: 60, deskripsi: 'UTS' }
            });
            const teknik2 = await prisma.teknikPenilaian.create({
                data: { cpmkId: cpmk1.id, namaTeknik: 'Tugas', bobotPersentase: 40, deskripsi: 'Tugas Individu' }
            });
            const teknik3 = await prisma.teknikPenilaian.create({
                data: { cpmkId: cpmk2.id, namaTeknik: 'Proyek', bobotPersentase: 70, deskripsi: 'Proyek Akhir' }
            });
            const teknik4 = await prisma.teknikPenilaian.create({
                data: { cpmkId: cpmk2.id, namaTeknik: 'Presentasi', bobotPersentase: 30, deskripsi: 'Presentasi Proyek' }
            });

            // Create Rubrik (Only for CPMK 2 - Proyek)
            const rubrik = await prisma.rubrik.create({
                data: { cpmkId: cpmk2.id, deskripsi: 'Rubrik Penilaian Proyek' }
            });

            const kriteria = await prisma.rubrikKriteria.create({
                data: { rubrikId: rubrik.id, deskripsi: 'Kelengkapan Fitur', bobot: 100 }
            });

            await prisma.rubrikLevel.createMany({
                data: [
                    { kriteriaId: kriteria.id, deskripsi: 'Fitur lengkap dan berjalan sempurna', nilai: 100, label: 'Sangat Baik' },
                    { kriteriaId: kriteria.id, deskripsi: 'Fitur lengkap tapi ada bug kecil', nilai: 80, label: 'Baik' },
                    { kriteriaId: kriteria.id, deskripsi: 'Fitur kurang lengkap', nilai: 60, label: 'Cukup' },
                    { kriteriaId: kriteria.id, deskripsi: 'Fitur tidak berjalan', nilai: 40, label: 'Kurang' },
                ]
            });
        }

        // 7. Mahasiswa & Nilai (Generasi per Angkatan)
        console.log('🎓 Membuat Mahasiswa & Nilai...');

        const angkatanConfig = [
            { tahun: 2024, semesterSaatIni: 1, jumlah: 20 },
            { tahun: 2023, semesterSaatIni: 3, jumlah: 20 },
            { tahun: 2022, semesterSaatIni: 5, jumlah: 20 },
            { tahun: 2021, semesterSaatIni: 7, jumlah: 20 },
            { tahun: 2020, semesterSaatIni: 8, jumlah: 10 }, // Skripsi
        ];

        let totalMhs = 0;

        for (const cfg of angkatanConfig) {
            console.log(`   -> Angkatan ${cfg.tahun} (Semester ${cfg.semesterSaatIni})...`);

            for (let i = 1; i <= cfg.jumlah; i++) {
                const nim = `${String(cfg.tahun).slice(2)}TI${String(i).padStart(4, '0')}`;
                const email = `mhs${nim}@student.unugha.ac.id`;

                let mhs = await prisma.user.findUnique({ where: { email } });
                if (!mhs) {
                    mhs = await prisma.user.create({
                        data: {
                            email,
                            passwordHash,
                            emailVerified: true,
                            role: { create: { role: 'mahasiswa' } },
                            profile: {
                                create: {
                                    prodi: { connect: { id: prodiTI.id } },
                                    fakultas: { connect: { id: prodiTI.fakultasId } },
                                    namaLengkap: generateName(),
                                    nim,
                                    programStudi: 'Teknik Informatika',
                                    semester: cfg.semesterSaatIni,
                                    tahunMasuk: cfg.tahun,
                                    alamat: `Jl. Raya No. ${randomNumber(1, 100)}, Semarang`,
                                    noTelepon: `08${randomNumber(1000000000, 9999999999)}`,
                                    fotoProfile: `https://ui-avatars.com/api/?name=${generateName()}&background=random`
                                }
                            }
                        }
                    });
                    totalMhs++;
                }

                const mksInSemester = mkIds.filter(m => m.semester <= cfg.semesterSaatIni);

                for (const mkData of mksInSemester) {
                    const sem = mkData.semester;
                    // Ambil detail MK (CPMK, Teknik, Sub-CPMK)
                    const mkFull = await prisma.mataKuliah.findUnique({
                        where: { id: mkData.id },
                        include: {
                            cpmk: {
                                include: {
                                    teknikPenilaian: true,
                                    cplMappings: true,
                                    subCpmk: { include: { asesmenMappings: true } }
                                }
                            }
                        }
                    });

                    if (!mkFull) continue;

                    // Generate Nilai Teknik & CPMK (Rigorous OBE)
                    for (const cpmk of mkFull.cpmk) {
                        let totalNilaiCpmk = 0;
                        let totalBobotCpmk = 0;

                        // A. Generate Nilai Teknik Penilaian
                        const nilaiTeknikMap = new Map<string, number>();
                        for (const teknik of cpmk.teknikPenilaian) {
                            const nilai = randomDecimal(60, 100);
                            await prisma.nilaiTeknikPenilaian.create({
                                data: {
                                    mahasiswaId: mhs.id,
                                    teknikPenilaianId: teknik.id,
                                    mataKuliahId: mkFull.id,
                                    nilai: nilai,
                                    semester: sem,
                                    tahunAjaran: `${cfg.tahun + Math.floor((sem - 1) / 2)}/${cfg.tahun + Math.floor((sem - 1) / 2) + 1} ${sem % 2 === 1 ? 'Ganjil' : 'Genap'}`
                                }
                            });
                            nilaiTeknikMap.set(teknik.id, nilai);
                        }

                        // B. Calculate Nilai Sub-CPMK
                        if (cpmk.subCpmk && cpmk.subCpmk.length > 0) {
                            for (const sub of cpmk.subCpmk) {
                                let nilaiSub = 0;
                                let totalBobotSub = 0;

                                if (sub.asesmenMappings.length > 0) {
                                    for (const map of sub.asesmenMappings) {
                                        const nilaiTeknik = nilaiTeknikMap.get(map.teknikPenilaianId) || 0;
                                        nilaiSub += nilaiTeknik * (Number(map.bobot) / 100);
                                        totalBobotSub += Number(map.bobot);
                                    }
                                    if (totalBobotSub > 0 && totalBobotSub !== 100) {
                                        nilaiSub = (nilaiSub / totalBobotSub) * 100;
                                    }
                                } else {
                                    nilaiSub = randomDecimal(60, 100);
                                }

                                await prisma.nilaiSubCpmk.create({
                                    data: {
                                        mahasiswaId: mhs.id,
                                        subCpmkId: sub.id,
                                        mataKuliahId: mkFull.id,
                                        nilai: nilaiSub,
                                        semester: sem,
                                        tahunAjaran: `${cfg.tahun + Math.floor((sem - 1) / 2)}/${cfg.tahun + Math.floor((sem - 1) / 2) + 1} ${sem % 2 === 1 ? 'Ganjil' : 'Genap'}`
                                    }
                                });

                                totalNilaiCpmk += nilaiSub * (Number(sub.bobot) / 100);
                                totalBobotCpmk += Number(sub.bobot);
                            }
                        } else {
                            for (const teknik of cpmk.teknikPenilaian) {
                                const n = nilaiTeknikMap.get(teknik.id) || 0;
                                totalNilaiCpmk += n * (Number(teknik.bobotPersentase) / 100);
                                totalBobotCpmk += Number(teknik.bobotPersentase);
                            }
                        }

                        // C. Save Nilai CPMK
                        if (totalBobotCpmk > 0 && totalBobotCpmk !== 100) {
                            totalNilaiCpmk = (totalNilaiCpmk / totalBobotCpmk) * 100;
                        }

                        await prisma.nilaiCpmk.create({
                            data: {
                                mahasiswaId: mhs.id,
                                cpmkId: cpmk.id,
                                mataKuliahId: mkFull.id,
                                nilaiAkhir: totalNilaiCpmk,
                                semester: sem,
                                tahunAjaran: `${cfg.tahun + Math.floor((sem - 1) / 2)}/${cfg.tahun + Math.floor((sem - 1) / 2) + 1} ${sem % 2 === 1 ? 'Ganjil' : 'Genap'}`
                            }
                        });

                        // D. Save Nilai CPL
                        for (const map of cpmk.cplMappings) {
                            await prisma.nilaiCpl.upsert({
                                where: {
                                    mahasiswaId_cplId_mataKuliahId_semester_tahunAjaran: {
                                        mahasiswaId: mhs.id,
                                        cplId: map.cplId,
                                        mataKuliahId: mkFull.id,
                                        semester: sem,
                                        tahunAjaran: `${cfg.tahun + Math.floor((sem - 1) / 2)}/${cfg.tahun + Math.floor((sem - 1) / 2) + 1} ${sem % 2 === 1 ? 'Ganjil' : 'Genap'}`
                                    }
                                },
                                update: { nilai: totalNilaiCpmk },
                                create: {
                                    mahasiswaId: mhs.id,
                                    cplId: map.cplId,
                                    mataKuliahId: mkFull.id,
                                    nilai: totalNilaiCpmk,
                                    semester: sem,
                                    tahunAjaran: `${cfg.tahun + Math.floor((sem - 1) / 2)}/${cfg.tahun + Math.floor((sem - 1) / 2) + 1} ${sem % 2 === 1 ? 'Ganjil' : 'Genap'}`
                                }
                            });
                        }
                    }
                }
            }

            // Generate Kuesioner (Penilaian Tidak Langsung) untuk semester lalu
            if (cfg.semesterSaatIni > 1) {
                const semLalu = cfg.semesterSaatIni - 1;
                // We need mhs list for this angkatan to generate kuesioner. 
                // But we just iterated them. We should have done it inside the loop or fetch them again.
                // Since we are outside the student loop now, we can't access `mhs`.
                // Let's move this logic INSIDE the student loop for simplicity, OR fetch students here.
                // Fetching is safer.

                const students = await prisma.user.findMany({
                    where: {
                        profile: {
                            tahunMasuk: cfg.tahun,
                            prodiId: prodiTI.id
                        }
                    }
                });

                for (const mhs of students) {
                    for (const cplId of cplIds) {
                        const existingKuesioner = await prisma.penilaianTidakLangsung.findFirst({
                            where: { mahasiswaId: mhs.id, cplId, semester: semLalu }
                        });

                        if (!existingKuesioner) {
                            await prisma.penilaianTidakLangsung.create({
                                data: {
                                    mahasiswaId: mhs.id,
                                    cplId,
                                    nilai: randomNumber(3, 4),
                                    semester: semLalu,
                                    tahunAjaran: `${cfg.tahun + Math.floor((semLalu - 1) / 2)}/${cfg.tahun + Math.floor((semLalu - 1) / 2) + 1} ${semLalu % 2 === 1 ? 'Ganjil' : 'Genap'}`
                                }
                            });
                        }
                    }
                }
            }
        }

        // 8. Evaluasi Mata Kuliah (CQI)
        console.log('📊 Membuat Evaluasi Mata Kuliah (CQI)...');

        // Iterate all MKs
        for (const mkData of mkIds) {
            // Get Dosen Pengampu
            const pengampu = await prisma.mataKuliahPengampu.findFirst({
                where: { mataKuliahId: mkData.id, isPengampu: true }
            });

            if (pengampu) {
                // Create evaluation for past semesters (e.g., 2023/2024 Genap)
                // For simplicity, we create one for the current active semester context or past
                const sem = mkData.semester;
                const tahunAjaranStr = '2023/2024 Genap'; // Simulation

                await prisma.evaluasiMataKuliah.upsert({
                    where: {
                        mataKuliahId_dosenId_semester_tahunAjaran: {
                            mataKuliahId: mkData.id,
                            dosenId: pengampu.dosenId,
                            semester: sem,
                            tahunAjaran: tahunAjaranStr
                        }
                    },
                    update: {},
                    create: {
                        mataKuliahId: mkData.id,
                        dosenId: pengampu.dosenId,
                        semester: sem,
                        tahunAjaran: tahunAjaranStr,
                        kendala: 'Mahasiswa kurang aktif dalam diskusi kelas.',
                        rencanaPerbaikan: 'Akan diterapkan metode pembelajaran berbasis proyek yang lebih intensif.',
                        status: 'reviewed',
                        feedbackKaprodi: 'Setuju, silakan lanjutkan dengan rencana tersebut.'
                    }
                });
            }
        }

        // 9. Generate Data for Other Prodis (Generic)
        console.log('🌍 Membuat Data Generik untuk Prodi Lain...');

        for (const f of faculties) {
            for (const p of f.prodi) {
                if (p.kode === 'TI') continue; // Skip TI, already handled in detail

                const prodi = prodiMap.get(p.kode);
                console.log(`   -> Processing ${p.nama}...`);

                // Kaprodi
                const kaprodiEmail = `kaprodi.${p.kode.toLowerCase()}@unugha.ac.id`;
                let kaprodiUser = await prisma.user.findUnique({ where: { email: kaprodiEmail } });
                if (!kaprodiUser) {
                    kaprodiUser = await prisma.user.create({
                        data: {
                            email: kaprodiEmail,
                            passwordHash,
                            profile: {
                                create: {
                                    prodi: { connect: { id: prodi.id } },
                                    fakultas: { connect: { id: prodi.fakultasId } },
                                    namaLengkap: `Kaprodi ${p.kode}, M.Pd`,
                                    programStudi: p.nama,
                                    nidn: `06${randomNumber(10000000, 99999999)}`
                                }
                            }
                        }
                    });
                }


                // Dosen (5 per Prodi)
                const dosenIds: string[] = [];
                for (let i = 1; i <= 5; i++) {
                    const email = `dosen.${p.kode.toLowerCase()}${i}@unugha.ac.id`;
                    let dosen = await prisma.user.findUnique({ where: { email } });
                    if (!dosen) {
                        dosen = await prisma.user.create({
                            data: {
                                email,
                                passwordHash,
                                profile: {
                                    create: {
                                        prodi: { connect: { id: prodi.id } },
                                        fakultas: { connect: { id: prodi.fakultasId } },
                                        namaLengkap: generateName(),
                                        programStudi: p.nama,
                                        nidn: `06${randomNumber(10000000, 99999999)}`
                                    }
                                }
                            }
                        });
                    }
                    dosenIds.push(dosen.id);
                }

                // Mahasiswa (5 per Angkatan)
                for (let year = 2020; year <= 2024; year++) {
                    const semesterSaatIni = (2024 - year) * 2 + 1;
                    if (semesterSaatIni > 8) continue;

                    for (let i = 1; i <= 5; i++) {
                        const nim = `${String(year).slice(2)}${p.kode}${String(i).padStart(4, '0')}`;
                        const email = `mhs${nim}@student.unugha.ac.id`;

                        let mhs = await prisma.user.findUnique({ where: { email } });
                        if (!mhs) {
                            mhs = await prisma.user.create({
                                data: {
                                    email,
                                    passwordHash,
                                    profile: {
                                        create: {
                                            prodi: { connect: { id: prodi.id } },
                                            fakultas: { connect: { id: prodi.fakultasId } },
                                            namaLengkap: generateName(),
                                            nim,
                                            programStudi: p.nama,
                                            semester: semesterSaatIni,
                                            tahunMasuk: year
                                        }
                                    }
                                }
                            });
                            totalMhs++;
                        }
                    }
                }
            }
        }


        console.log('\n' + '='.repeat(60));
        console.log('🎉 Simulasi Penuh Selesai!');
        console.log(`   Total Mahasiswa: ${totalMhs}`);
        console.log('='.repeat(60) + '\n');


    } catch (error) {
        console.error('❌ Error seeding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

