
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database with COMPREHENSIVE dataset...\n');

    // 1. Clean up existing data
    try {
        await prisma.nilaiRubrik.deleteMany();
        await prisma.nilaiTeknikPenilaian.deleteMany();
        await prisma.rubrikLevel.deleteMany();
        await prisma.rubrikKriteria.deleteMany();
        await prisma.rubrik.deleteMany();
        await prisma.teknikPenilaian.deleteMany();
        await prisma.cpmkCplMapping.deleteMany();
        await prisma.cplMataKuliah.deleteMany();
        await prisma.nilaiCpmk.deleteMany();
        await prisma.nilaiCpl.deleteMany();
        await prisma.cpmk.deleteMany();
        await prisma.mataKuliahPengampu.deleteMany();
        await prisma.evaluasiMataKuliah.deleteMany();
        await prisma.mataKuliah.deleteMany();
        await prisma.kelas.deleteMany();
        await prisma.cpl.deleteMany();
        await prisma.kaprodiData.deleteMany();
        await prisma.profile.deleteMany();
        await prisma.user.deleteMany();
        await prisma.prodi.deleteMany();
        await prisma.fakultas.deleteMany();

        // Reference tables
        await prisma.tahunAjaran.deleteMany();
        await prisma.semester.deleteMany();
        await prisma.kurikulum.deleteMany();
        await prisma.jenisMataKuliah.deleteMany();
        await prisma.kategoriCpl.deleteMany();
        await prisma.levelTaksonomi.deleteMany();
        await prisma.teknikPenilaianRef.deleteMany();
        await prisma.settings.deleteMany();

        console.log('✅ Cleanup completed');
    } catch (error) {
        console.log('Cleanup error (ignoring):', error);
    }

    const hashedPassword = await bcrypt.hash('123456', 10);

    // ==========================================
    // 2. REFERENCE TABLES
    // ==========================================

    // Tahun Ajaran
    await prisma.tahunAjaran.createMany({
        data: [
            { nama: '2023/2024', isActive: false },
            { nama: '2024/2025', isActive: true },
        ]
    });

    // Semester
    const semesters = Array.from({ length: 8 }, (_, i) => ({
        nama: `Semester ${i + 1}`,
        angka: i + 1,
        isActive: true
    }));
    await prisma.semester.createMany({ data: semesters });
    const semester5 = await prisma.semester.findUnique({ where: { angka: 5 } });

    // Kurikulum
    const kurikulum2021 = await prisma.kurikulum.create({
        data: { nama: 'Kurikulum 2021', tahunMulai: 2021, isActive: true }
    });

    // Jenis Mata Kuliah
    const jenisWajib = await prisma.jenisMataKuliah.create({ data: { nama: 'Wajib' } });
    const jenisPilihan = await prisma.jenisMataKuliah.create({ data: { nama: 'Pilihan' } });

    // Kategori CPL
    const katSikap = await prisma.kategoriCpl.create({ data: { nama: 'Sikap' } });
    const katPengetahuan = await prisma.kategoriCpl.create({ data: { nama: 'Pengetahuan' } });
    const katUmum = await prisma.kategoriCpl.create({ data: { nama: 'Keterampilan Umum' } });
    const katKhusus = await prisma.kategoriCpl.create({ data: { nama: 'Keterampilan Khusus' } });

    // Level Taksonomi
    await prisma.levelTaksonomi.createMany({
        data: [
            { kode: 'C1', deskripsi: 'Mengingat', kategori: 'Kognitif' },
            { kode: 'C2', deskripsi: 'Memahami', kategori: 'Kognitif' },
            { kode: 'C3', deskripsi: 'Menerapkan', kategori: 'Kognitif' },
            { kode: 'C4', deskripsi: 'Menganalisis', kategori: 'Kognitif' },
            { kode: 'C5', deskripsi: 'Mengevaluasi', kategori: 'Kognitif' },
            { kode: 'C6', deskripsi: 'Mencipta', kategori: 'Kognitif' },
            { kode: 'A1', deskripsi: 'Menerima', kategori: 'Afektif' },
            { kode: 'P1', deskripsi: 'Meniru', kategori: 'Psikomotor' },
        ]
    });
    const levelC3 = await prisma.levelTaksonomi.findUnique({ where: { kode: 'C3' } });
    const levelC4 = await prisma.levelTaksonomi.findUnique({ where: { kode: 'C4' } });
    const levelC6 = await prisma.levelTaksonomi.findUnique({ where: { kode: 'C6' } });

    // Teknik Penilaian Ref
    await prisma.teknikPenilaianRef.createMany({
        data: [
            { nama: 'Tugas', deskripsi: 'Tugas individu atau kelompok' },
            { nama: 'Kuis', deskripsi: 'Kuis singkat' },
            { nama: 'UTS', deskripsi: 'Ujian Tengah Semester' },
            { nama: 'UAS', deskripsi: 'Ujian Akhir Semester' },
            { nama: 'Proyek', deskripsi: 'Proyek besar' },
            { nama: 'Praktikum', deskripsi: 'Kegiatan praktikum' },
        ]
    });
    const refTugas = await prisma.teknikPenilaianRef.findUnique({ where: { nama: 'Tugas' } });
    const refUAS = await prisma.teknikPenilaianRef.findUnique({ where: { nama: 'UAS' } });
    const refProyek = await prisma.teknikPenilaianRef.findUnique({ where: { nama: 'Proyek' } });

    // Settings
    await prisma.settings.create({
        data: { key: 'app_name', value: 'Sistem OBE', description: 'Nama Aplikasi' }
    });

    console.log('✅ Reference tables seeded');

    // ==========================================
    // 3. FAKULTAS & PRODI
    // ==========================================
    const fakultasData = [
        {
            nama: 'Fakultas Keguruan dan Ilmu Pendidikan', kode: 'FKIP', prodis: [
                { nama: 'Bimbingan Konseling', kode: 'BK' },
                { nama: 'Pendidikan Guru SD', kode: 'PGSD' },
            ]
        },
        {
            nama: 'Fakultas Matematika dan Komputer', kode: 'FMIKOM', prodis: [
                { nama: 'Matematika', kode: 'MAT' },
                { nama: 'Informatika', kode: 'INF' },
                { nama: 'Sistem Informasi', kode: 'SI' },
            ]
        },
        {
            nama: 'Fakultas Teknologi Industri', kode: 'FTI', prodis: [
                { nama: 'Teknik Industri', kode: 'TIND' },
            ]
        }
    ];

    let prodiInformatikaId = '';
    let fakultasFmikomId = '';

    for (const f of fakultasData) {
        const fakultas = await prisma.fakultas.create({
            data: { nama: f.nama, kode: f.kode }
        });

        if (f.kode === 'FMIKOM') fakultasFmikomId = fakultas.id;

        for (const p of f.prodis) {
            const prodi = await prisma.prodi.create({
                data: { nama: p.nama, kode: p.kode, fakultasId: fakultas.id }
            });

            if (p.kode === 'INF') prodiInformatikaId = prodi.id;
        }
    }
    console.log('✅ Fakultas & Prodi seeded');

    // ==========================================
    // 4. USERS
    // ==========================================

    // Admin
    await prisma.user.create({
        data: {
            email: 'admin@univ.ac.id',
            passwordHash: hashedPassword,
            emailVerified: true,
            role: { create: { role: 'admin' } },
            profile: { create: { namaLengkap: 'Super Admin', nip: 'ADM001' } }
        }
    });

    // Kaprodi Informatika
    const kaprodiUser = await prisma.user.create({
        data: {
            email: 'kaprodi.inf@univ.ac.id',
            passwordHash: hashedPassword,
            emailVerified: true,
            role: { create: { role: 'kaprodi' } },
            profile: { create: { namaLengkap: 'Dr. Kaprodi Informatika', nip: 'KAP001', prodiId: prodiInformatikaId, fakultasId: fakultasFmikomId } }
        }
    });

    // Kaprodi Data
    await prisma.kaprodiData.create({
        data: {
            programStudi: 'Informatika',
            namaKaprodi: 'Dr. Kaprodi Informatika',
            nidnKaprodi: '0011223344',
            prodiId: prodiInformatikaId
        }
    });

    // Dosen
    const dosenList = [
        { nama: 'Budi Santoso, M.Kom', email: 'dosen1@univ.ac.id', nip: 'DOS001' },
        { nama: 'Siti Aminah, M.T', email: 'dosen2@univ.ac.id', nip: 'DOS002' },
        { nama: 'Rudi Hermawan, Ph.D', email: 'dosen3@univ.ac.id', nip: 'DOS003' },
    ];

    const dosenIds = [];
    for (const d of dosenList) {
        const user = await prisma.user.create({
            data: {
                email: d.email,
                passwordHash: hashedPassword,
                emailVerified: true,
                role: { create: { role: 'dosen' } },
                profile: { create: { namaLengkap: d.nama, nip: d.nip, prodiId: prodiInformatikaId, fakultasId: fakultasFmikomId } }
            }
        });
        dosenIds.push(user.id);
    }

    // Mahasiswa (10 students)
    const mahasiswaData = [
        { nama: 'Ahmad Fajrul', nim: '210001' },
        { nama: 'Rina Wati', nim: '210002' },
        { nama: 'Doni Tata', nim: '210003' },
        { nama: 'Eka Putri', nim: '210004' },
        { nama: 'Fajar Nugraha', nim: '210005' },
        { nama: 'Gita Gutawa', nim: '210006' },
        { nama: 'Hadi Sucipto', nim: '210007' },
        { nama: 'Indah Permata', nim: '210008' },
        { nama: 'Joko Anwar', nim: '210009' },
        { nama: 'Kartika Sari', nim: '210010' },
    ];

    const mahasiswaIds = [];
    for (const m of mahasiswaData) {
        const user = await prisma.user.create({
            data: {
                email: `${m.nim}@mhs.univ.ac.id`,
                passwordHash: hashedPassword,
                emailVerified: true,
                role: { create: { role: 'mahasiswa' } },
                profile: {
                    create: {
                        namaLengkap: m.nama,
                        nim: m.nim,
                        prodiId: prodiInformatikaId,
                        fakultasId: fakultasFmikomId,
                        semester: 5,
                        tahunMasuk: 2021,
                        semesterId: semester5?.id
                    }
                }
            }
        });
        mahasiswaIds.push(user.id);
    }
    console.log('✅ Users seeded');

    // ==========================================
    // 5. ACADEMIC DATA (INFORMATIKA)
    // ==========================================

    // CPL (10 items)
    const cplData = [
        { kode: 'CPL-01', desk: 'Bertakwa kepada Tuhan Yang Maha Esa dan mampu menunjukkan sikap religius', kat: katSikap.id },
        { kode: 'CPL-02', desk: 'Menjunjung tinggi nilai kemanusiaan dalam menjalankan tugas berdasarkan agama, moral, dan etika', kat: katSikap.id },
        { kode: 'CPL-03', desk: 'Menguasai konsep teoretis sains alam, aplikasi matematika rekayasa', kat: katPengetahuan.id },
        { kode: 'CPL-04', desk: 'Menguasai konsep teoretis arsitektur, organisasi, dan sistem komputer', kat: katPengetahuan.id },
        { kode: 'CPL-05', desk: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif', kat: katUmum.id },
        { kode: 'CPL-06', desk: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur', kat: katUmum.id },
        { kode: 'CPL-07', desk: 'Mampu merancang dan membangun aplikasi berbasis web', kat: katKhusus.id },
        { kode: 'CPL-08', desk: 'Mampu merancang dan membangun aplikasi berbasis mobile', kat: katKhusus.id },
        { kode: 'CPL-09', desk: 'Mampu menerapkan algoritma cerdas pada sistem komputer', kat: katKhusus.id },
        { kode: 'CPL-10', desk: 'Mampu melakukan pengamanan data dan sistem informasi', kat: katKhusus.id },
    ];

    const cplIds = [];
    for (const c of cplData) {
        const cpl = await prisma.cpl.create({
            data: {
                kodeCpl: c.kode,
                deskripsi: c.desk,
                kategoriId: c.kat,
                prodiId: prodiInformatikaId,
                createdBy: kaprodiUser.id
            }
        });
        cplIds.push(cpl.id);
    }

    // Mata Kuliah (5 items)
    const mkData = [
        { kode: 'INF-301', nama: 'Pemrograman Web Lanjut', sks: 3, sem: 5, dosenIdx: 0 },
        { kode: 'INF-302', nama: 'Basis Data Lanjut', sks: 3, sem: 5, dosenIdx: 1 },
        { kode: 'INF-303', nama: 'Rekayasa Perangkat Lunak', sks: 3, sem: 5, dosenIdx: 2 },
        { kode: 'INF-304', nama: 'Jaringan Komputer', sks: 3, sem: 5, dosenIdx: 0 },
        { kode: 'INF-305', nama: 'Kecerdasan Buatan', sks: 3, sem: 5, dosenIdx: 1 },
    ];

    // Kelas
    const kelasA = await prisma.kelas.create({ data: { nama: 'TI-A' } });
    const kelasB = await prisma.kelas.create({ data: { nama: 'TI-B' } });

    // Assign Students to Kelas A (first 5) and B (next 5)
    for (let i = 0; i < mahasiswaIds.length; i++) {
        await prisma.profile.update({
            where: { userId: mahasiswaIds[i] },
            data: { kelasId: i < 5 ? kelasA.id : kelasB.id }
        });
    }

    const mkIds = [];

    for (const m of mkData) {
        const mk = await prisma.mataKuliah.create({
            data: {
                kodeMk: m.kode,
                namaMk: m.nama,
                sks: m.sks,
                semester: m.sem,
                prodiId: prodiInformatikaId,
                jenisMkId: jenisWajib.id,
                kurikulumId: kurikulum2021.id,
                createdBy: kaprodiUser.id,
                semesterId: semester5?.id
            }
        });
        mkIds.push(mk.id);

        // Assign Dosen Pengampu
        await prisma.mataKuliahPengampu.create({
            data: { mataKuliahId: mk.id, dosenId: dosenIds[m.dosenIdx], kelasId: kelasA.id }
        });
        await prisma.mataKuliahPengampu.create({
            data: { mataKuliahId: mk.id, dosenId: dosenIds[m.dosenIdx], kelasId: kelasB.id }
        });

        // Create CPMK (2 per MK)
        const cpmk1 = await prisma.cpmk.create({
            data: {
                kodeCpmk: `CPMK-${m.kode}-1`,
                deskripsi: `Mampu memahami konsep dasar ${m.nama}`,
                mataKuliahId: mk.id,
                createdBy: dosenIds[m.dosenIdx],
                statusValidasi: 'validated',
                levelTaksonomiId: levelC3?.id
            }
        });

        const cpmk2 = await prisma.cpmk.create({
            data: {
                kodeCpmk: `CPMK-${m.kode}-2`,
                deskripsi: `Mampu mengimplementasikan ${m.nama} dalam proyek`,
                mataKuliahId: mk.id,
                createdBy: dosenIds[m.dosenIdx],
                statusValidasi: 'validated',
                levelTaksonomiId: levelC6?.id
            }
        });

        // Map CPL to MK (Random 2 CPLs per MK)
        const cplIdx1 = Math.floor(Math.random() * 10);
        const cplIdx2 = (cplIdx1 + 1) % 10;

        await prisma.cplMataKuliah.createMany({
            data: [
                { cplId: cplIds[cplIdx1], mataKuliahId: mk.id, bobotKontribusi: 0.5 },
                { cplId: cplIds[cplIdx2], mataKuliahId: mk.id, bobotKontribusi: 0.5 },
            ]
        });

        // Map CPMK to CPL
        await prisma.cpmkCplMapping.createMany({
            data: [
                { cpmkId: cpmk1.id, cplId: cplIds[cplIdx1], bobotPersentase: 100 },
                { cpmkId: cpmk2.id, cplId: cplIds[cplIdx2], bobotPersentase: 100 },
            ]
        });

        // Teknik Penilaian
        const teknik1 = await prisma.teknikPenilaian.create({
            data: {
                cpmkId: cpmk1.id,
                namaTeknik: 'UTS',
                bobotPersentase: 50,
                teknikRefId: refTugas?.id
            }
        });

        const teknik2 = await prisma.teknikPenilaian.create({
            data: {
                cpmkId: cpmk2.id,
                namaTeknik: 'Proyek Akhir',
                bobotPersentase: 50,
                teknikRefId: refProyek?.id
            }
        });

        // Rubrik (Only for Web Lanjut - CPMK 2)
        let createdRubrik: any = null;
        if (m.nama === 'Pemrograman Web Lanjut') {
            createdRubrik = await prisma.rubrik.create({
                data: {
                    cpmkId: cpmk2.id,
                    deskripsi: 'Rubrik Proyek Web',
                    kriteria: {
                        create: [
                            {
                                deskripsi: 'Fungsionalitas', bobot: 50,
                                levels: {
                                    create: [
                                        { deskripsi: 'Semua fitur jalan', nilai: 100, label: 'Sangat Baik' },
                                        { deskripsi: 'Sebagian fitur jalan', nilai: 70, label: 'Cukup' },
                                    ]
                                }
                            },
                            {
                                deskripsi: 'UI/UX', bobot: 50,
                                levels: {
                                    create: [
                                        { deskripsi: 'Desain menarik & responsif', nilai: 100, label: 'Sangat Baik' },
                                        { deskripsi: 'Desain standar', nilai: 75, label: 'Baik' },
                                    ]
                                }
                            }
                        ]
                    }
                },
                include: {
                    kriteria: {
                        include: { levels: true }
                    }
                }
            });
        }

        // SEED GRADES (Nilai)
        console.log(`📝 Seeding grades for ${m.nama}...`);

        for (const mhsId of mahasiswaIds) {
            // Generate random score 60-100
            const score1 = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // UTS
            const score2 = Math.floor(Math.random() * (100 - 60 + 1)) + 60; // Proyek

            // 1. Seed Nilai Teknik Penilaian (UTS)
            await prisma.nilaiTeknikPenilaian.create({
                data: {
                    mahasiswaId: mhsId,
                    teknikPenilaianId: teknik1.id,
                    mataKuliahId: mk.id,
                    nilai: score1,
                    semester: 5,
                    tahunAjaran: '2024/2025',
                    semesterId: semester5?.id
                }
            });

            // 2. Seed Nilai Teknik Penilaian (Proyek) + Rubrik Data
            const nilaiProyek = await prisma.nilaiTeknikPenilaian.create({
                data: {
                    mahasiswaId: mhsId,
                    teknikPenilaianId: teknik2.id,
                    mataKuliahId: mk.id,
                    nilai: score2,
                    semester: 5,
                    tahunAjaran: '2024/2025',
                    semesterId: semester5?.id
                }
            });

            // If this is Web Lanjut and we have a rubric, seed NilaiRubrik
            if (m.nama === 'Pemrograman Web Lanjut' && createdRubrik) {
                // For each criteria, pick a random level
                // Note: In real app, score2 should be calculated from rubric. 
                // Here we just pick random levels and don't worry if they exactly match score2 for dummy data,
                // OR we could try to match it. For simplicity, just seed random levels.

                for (const kriteria of createdRubrik.kriteria) {
                    if (kriteria.levels && kriteria.levels.length > 0) {
                        const randomLevel = kriteria.levels[Math.floor(Math.random() * kriteria.levels.length)];
                        await prisma.nilaiRubrik.create({
                            data: {
                                nilaiTeknikId: nilaiProyek.id,
                                rubrikLevelId: randomLevel.id
                            }
                        });
                    }
                }
            }

            // 3. Seed Nilai CPMK (Calculated from Teknik)
            // CPMK 1 only has UTS (50%? No, usually 100% if only one technique, but here we defined weights)
            // Let's check weights: teknik1 (UTS) = 50%, teknik2 (Proyek) = 50%.
            // Wait, teknik1 is for CPMK1, teknik2 is for CPMK2.
            // So CPMK1 score = UTS score. CPMK2 score = Proyek score.

            await prisma.nilaiCpmk.create({
                data: {
                    mahasiswaId: mhsId,
                    cpmkId: cpmk1.id,
                    mataKuliahId: mk.id,
                    nilaiAkhir: score1,
                    semester: 5,
                    tahunAjaran: '2024/2025',
                    semesterId: semester5?.id
                }
            });

            await prisma.nilaiCpmk.create({
                data: {
                    mahasiswaId: mhsId,
                    cpmkId: cpmk2.id,
                    mataKuliahId: mk.id,
                    nilaiAkhir: score2,
                    semester: 5,
                    tahunAjaran: '2024/2025',
                    semesterId: semester5?.id
                }
            });

            // Nilai CPL (Simplified: Average of CPMKs mapped to it)
            // CPL1 gets score from CPMK1, CPL2 gets score from CPMK2
            await prisma.nilaiCpl.create({
                data: {
                    mahasiswaId: mhsId,
                    cplId: cplIds[cplIdx1],
                    mataKuliahId: mk.id,
                    nilai: score1,
                    semester: 5,
                    tahunAjaran: '2024/2025',
                    semesterId: semester5?.id
                }
            });

            await prisma.nilaiCpl.create({
                data: {
                    mahasiswaId: mhsId,
                    cplId: cplIds[cplIdx2],
                    mataKuliahId: mk.id,
                    nilai: score2,
                    semester: 5,
                    tahunAjaran: '2024/2025',
                    semesterId: semester5?.id
                }
            });
        }
    }

    // Evaluasi Mata Kuliah (Sample)
    await prisma.evaluasiMataKuliah.create({
        data: {
            mataKuliahId: mkIds[0], // Web Lanjut
            dosenId: dosenIds[0],
            semester: 5,
            tahunAjaran: '2024/2025',
            kendala: 'Mahasiswa kurang paham basic JS',
            rencanaPerbaikan: 'Adakan responsi tambahan',
            status: 'submitted'
        }
    });

    console.log('✅ Academic Data seeded');
    console.log('✅ SEED COMPLETED SUCCESSFULLY');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
