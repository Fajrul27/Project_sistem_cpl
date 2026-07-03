import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Data Definitions
const faculties = [
    {
        name: 'Fakultas Keguruan dan Ilmu Pendidikan', code: 'FKIP', prodis: [
            { name: 'Bimbingan Konseling', code: 'BK' },
            { name: 'Pendidikan Guru SD', code: 'PGSD' },
            { name: 'Pendidikan Islam Anak Usia Dini', code: 'PIAUD' },
            { name: 'Manajamen Pendidikan Islam', code: 'MPI' }
        ]
    },
    {
        name: 'Fakultas Matematika dan Komputer', code: 'FMIKOM', prodis: [
            { name: 'Matematika', code: 'MAT' },
            { name: 'Informatika', code: 'INF' },
            { name: 'Sistem Informasi', code: 'SI' }
        ]
    },
    {
        name: 'Fakultas Teknologi Industri', code: 'FTI', prodis: [
            { name: 'Teknik Industri', code: 'TIND' },
            { name: 'Teknik Kimia', code: 'TKIM' },
            { name: 'Teknik Mesin', code: 'TM' }
        ]
    },
    {
        name: 'Fakultas Ekonomi', code: 'FE', prodis: [
            { name: 'Manajemen', code: 'MAN' },
            { name: 'Ekonomi Pembangunan', code: 'EP' }
        ]
    },
    {
        name: 'Fakultas Keagamaan Islam', code: 'FKI', prodis: [
            { name: 'Pendidikan Agama Islam', code: 'PAI' },
            { name: 'Pendidikan Guru Madrasah Ibtidaiyah', code: 'PGMI' },
            { name: 'Komunikasi Penyiaran Islam', code: 'KPI' },
            { name: 'Ahwal Al Syakhyiyah', code: 'AS' }
        ]
    }
];

const taksonomiList = [
    { kode: 'C1', deskripsi: 'Mengingat', kategori: 'Kognitif' },
    { kode: 'C2', deskripsi: 'Memahami', kategori: 'Kognitif' },
    { kode: 'C3', deskripsi: 'Menerapkan', kategori: 'Kognitif' },
    { kode: 'C4', deskripsi: 'Menganalisis', kategori: 'Kognitif' },
    { kode: 'C5', deskripsi: 'Mengevaluasi', kategori: 'Kognitif' },
    { kode: 'C6', deskripsi: 'Mencipta', kategori: 'Kognitif' },
    { kode: 'A1', deskripsi: 'Menerima', kategori: 'Afektif' },
    { kode: 'A2', deskripsi: 'Merespon', kategori: 'Afektif' },
    { kode: 'A3', deskripsi: 'Menghargai', kategori: 'Afektif' },
    { kode: 'A4', deskripsi: 'Mengorganisasi', kategori: 'Afektif' },
    { kode: 'A5', deskripsi: 'Karakterisasi', kategori: 'Afektif' },
    { kode: 'P1', deskripsi: 'Meniru', kategori: 'Psikomotor' },
    { kode: 'P2', deskripsi: 'Manipulasi', kategori: 'Psikomotor' },
    { kode: 'P3', deskripsi: 'Presisi', kategori: 'Psikomotor' },
    { kode: 'P4', deskripsi: 'Artikulasi', kategori: 'Psikomotor' },
    { kode: 'P5', deskripsi: 'Naturalisasi', kategori: 'Psikomotor' },
];

async function main() {
    console.log('🌱 Seeding database with COMPREHENSIVE DATA...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Reference Data
    console.log('Creating Reference Data...');

    // Semesters
    const semesters = [];
    for (let i = 1; i <= 8; i++) {
        semesters.push(await prisma.semester.upsert({
            where: { angka: i },
            update: {},
            create: { nama: `Semester ${i}`, angka: i }
        }));
    }

    // Kelas
    const kelasNames = ['A', 'B', 'C']; // Limit to 3 classes per semester
    const kelasRefs = [];
    for (const k of kelasNames) {
        kelasRefs.push(await prisma.kelas.upsert({
            where: { nama: k },
            update: {},
            create: { nama: k }
        }));
    }

    // Kategori CPL
    const kategoriCplList = ['Sikap', 'Pengetahuan', 'Keterampilan Umum', 'Keterampilan Khusus'];
    const kategoriCplRefs = [];
    for (const k of kategoriCplList) {
        kategoriCplRefs.push(await prisma.kategoriCpl.upsert({
            where: { nama: k },
            update: {},
            create: { nama: k }
        }));
    }

    // Level Taksonomi
    const taksonomiRefs = [];
    for (const t of taksonomiList) {
        taksonomiRefs.push(await prisma.levelTaksonomi.upsert({
            where: { kode: t.kode },
            update: {},
            create: t
        }));
    }

    // Kurikulum
    const kurikulum = await prisma.kurikulum.upsert({
        where: { nama: 'Kurikulum 2024' },
        update: {},
        create: { nama: 'Kurikulum 2024', tahunMulai: 2024, isActive: true }
    });

    // 1b. Roles
    const rolesList = ['admin', 'dosen', 'kaprodi', 'mahasiswa'];
    for (const r of rolesList) {
        await prisma.role.upsert({
            where: { name: r },
            update: {},
            create: {
                name: r,
                displayName: r.charAt(0).toUpperCase() + r.slice(1),
                isActive: true
            }
        });
    }

    // 1c. Tahun Ajaran
    const tahunAjaran = await prisma.tahunAjaran.upsert({
        where: { nama: '2024/2025 Ganjil' },
        update: {},
        create: { nama: '2024/2025 Ganjil', isActive: true }
    });

    // Jenis MK
    const jenisMkList = ['Wajib', 'Pilihan', 'Wajib Universitas', 'Wajib Fakultas'];
    const jenisMkRefs = [];
    for (const j of jenisMkList) {
        jenisMkRefs.push(await prisma.jenisMataKuliah.upsert({
            where: { nama: j },
            update: {},
            create: { nama: j }
        }));
    }

    // Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@university.ac.id' },
        update: {},
        create: {
            email: 'admin@university.ac.id',
            passwordHash: hashedPassword,
            emailVerified: true,
            role: {
                create: {
                    role: { connect: { name: 'admin' } }
                }
            },
            profile: {
                create: {
                    namaLengkap: 'Super Admin',
                    nip: 'ADMIN001',
                    noTelepon: '081234567890',
                    alamat: 'Server Room'
                }
            }
        }
    });

    // 2. Faculties & Prodis Loop
    for (const fac of faculties) {
        console.log(`\nProcessing Faculty: ${fac.name}`);
        const fakultas = await prisma.fakultas.upsert({
            where: { kode: fac.code },
            update: {},
            create: { nama: fac.name, kode: fac.code }
        });

        for (const prodiData of fac.prodis) {
            console.log(`  > Processing Prodi: ${prodiData.name}`);
            const prodi = await prisma.prodi.upsert({
                where: { nama: prodiData.name },
                update: {},
                create: {
                    nama: prodiData.name,
                    kode: prodiData.code,
                    jenjang: 'S1',
                    fakultasId: fakultas.id
                }
            });

            // 3. Create Dosen (3 per Prodi)
            const dosens = [];
            for (let i = 1; i <= 3; i++) {
                const email = `dosen.${prodiData.code.toLowerCase()}.${i}@university.ac.id`;
                const dosen = await prisma.user.upsert({
                    where: { email },
                    update: {},
                    create: {
                        email,
                        passwordHash: hashedPassword,
                        emailVerified: true,
                        role: {
                            create: {
                                role: { connect: { name: 'dosen' } }
                            }
                        },
                        profile: {
                            create: {
                                namaLengkap: `Dosen ${i} ${prodiData.code}`,
                                nip: `1990${prodiData.code}${String(i).padStart(3, '0')}`,
                                programStudi: prodiData.name,
                                prodiId: prodi.id,
                                noTelepon: '08123456789'
                            }
                        }
                    }
                });
                dosens.push(dosen);
            }

            // Assign Kaprodi (Dosen 1)
            await prisma.kaprodiData.upsert({
                where: { programStudi: prodiData.name },
                update: {},
                create: {
                    programStudi: prodiData.name,
                    namaKaprodi: `Dosen 1 ${prodiData.code}`,
                    nidnKaprodi: `1990${prodiData.code}001`,
                    prodiId: prodi.id
                }
            });
            // Update user role to kaprodi
            const kaprodiUserRole = await prisma.userRole.findUnique({ where: { userId: dosens[0].id } });
            if (kaprodiUserRole) {
                await prisma.userRole.update({
                    where: { id: kaprodiUserRole.id },
                    data: {
                        role: { connect: { name: 'kaprodi' } }
                    }
                });
            }


            // 4. Create CPL (10 CPLs)
            const cpls = [];
            for (let i = 1; i <= 10; i++) {
                const category = kategoriCplList[(i - 1) % 4];
                const catRef = kategoriCplRefs.find(c => c.nama === category);
                const cpl = await prisma.cpl.upsert({
                    where: { kodeCpl: `CPL-${prodiData.code}-${i}` },
                    update: {},
                    create: {
                        kodeCpl: `CPL-${prodiData.code}-${i}`,
                        deskripsi: `Capaian Pembelajaran Lulusan ${i} untuk ${prodiData.name} (${category})`,
                        kategori: category,
                        kategoriId: catRef?.id,
                        prodiId: prodi.id,
                        createdBy: dosens[0].id
                    }
                });
                cpls.push(cpl);
            }

            // 5. Create Mata Kuliah & CPMK (Semesters 1-8)
            const mataKuliahs = [];
            for (let sem = 1; sem <= 8; sem++) {
                const semesterRef = semesters.find(s => s.angka === sem);
                // Create 4 MKs per semester
                for (let mkNum = 1; mkNum <= 4; mkNum++) {
                    const mkCode = `MK-${prodiData.code}-${sem}0${mkNum}`;
                    const mk = await prisma.mataKuliah.upsert({
                        where: { kodeMk: mkCode },
                        update: {},
                        create: {
                            kodeMk: mkCode,
                            namaMk: `Mata Kuliah ${sem}-${mkNum} ${prodiData.code}`,
                            sks: 3,
                            semester: sem,
                            semesterId: semesterRef?.id,
                            jenisMkId: jenisMkRefs[0].id,
                            kurikulumId: kurikulum.id,
                            prodiId: prodi.id,
                            createdBy: dosens[0].id,
                            isActive: true
                        }
                    });
                    mataKuliahs.push(mk);

                    // Assign Dosen to Classes (A, B, C)
                    for (const kelas of kelasRefs) {
                        await prisma.mataKuliahPengampu.upsert({
                            where: {
                                mataKuliahId_dosenId_kelasId: {
                                    mataKuliahId: mk.id,
                                    dosenId: dosens[0].id,
                                    kelasId: kelas.id
                                }
                            },
                            update: {},
                            create: {
                                mataKuliahId: mk.id,
                                dosenId: dosens[0].id,
                                kelasId: kelas.id,
                                isPengampu: true
                            }
                        });
                    }

                    // Map Random CPLs (3 CPLs)
                    const selectedCpls = cpls.slice(0, 3); // Just pick first 3 for simplicity
                    for (const cpl of selectedCpls) {
                        await prisma.cplMataKuliah.create({
                            data: {
                                cplId: cpl.id,
                                mataKuliahId: mk.id,
                                bobotKontribusi: 1.0
                            }
                        }).catch(() => { });
                    }

                    // Create CPMK (2 CPMKs)
                    for (let cpmkNum = 1; cpmkNum <= 2; cpmkNum++) {
                        const taksonomi = taksonomiList[cpmkNum % taksonomiList.length];
                        const taksonomiRef = taksonomiRefs.find(t => t.kode === taksonomi.kode);

                        const cpmk = await prisma.cpmk.create({
                            data: {
                                kodeCpmk: `CPMK-${mkCode}-${cpmkNum}`,
                                deskripsi: `Mahasiswa mampu ${taksonomi.deskripsi} pada ${mk.namaMk}`,
                                mataKuliahId: mk.id,
                                levelTaksonomi: taksonomi.kode,
                                levelTaksonomiId: taksonomiRef?.id,
                                createdBy: dosens[0].id,
                                statusValidasi: 'validated', // Auto validate for grading
                                validatedBy: dosens[0].id,
                                validatedAt: new Date()
                            }
                        });

                        // Map CPMK to CPLs
                        for (const cpl of selectedCpls) {
                            await prisma.cpmkCplMapping.create({
                                data: {
                                    cpmkId: cpmk.id,
                                    cplId: cpl.id,
                                    bobotPersentase: 100 / selectedCpls.length
                                }
                            }).catch(() => { });
                        }
                    }
                }
            }

            // 6. Create Students & Grades
            // Loop Semesters 1-8 (Current active semester of students)
            for (let currentSem = 1; currentSem <= 8; currentSem++) {
                const angkatan = 2024 - Math.floor((currentSem - 1) / 2);
                const semesterRef = semesters.find(s => s.angka === currentSem);

                // Create Students for each Class (A, B, C)
                for (const kelas of kelasRefs) {
                    // Create 30 students
                    const studentsData = [];
                    for (let s = 1; s <= 30; s++) {
                        const nim = `${prodiData.code}${angkatan}${kelas.nama}${String(s).padStart(3, '0')}`;
                        const email = `mhs.${nim}@student.university.ac.id`;

                        // Create User & Profile
                        const student = await prisma.user.upsert({
                            where: { email },
                            update: {},
                            create: {
                                email,
                                passwordHash: hashedPassword,
                                emailVerified: true,
                                role: {
                                    create: {
                                        role: { connect: { name: 'mahasiswa' } }
                                    }
                                },
                                profile: {
                                    create: {
                                        namaLengkap: `Mahasiswa ${nim}`,
                                        nim: nim,
                                        programStudi: prodiData.name,
                                        prodiId: prodi.id,
                                        semester: currentSem,
                                        semesterId: semesterRef?.id,
                                        kelasId: kelas.id,
                                        tahunMasuk: angkatan,
                                        noTelepon: '08123456789'
                                    }
                                }
                            }
                        });
                        studentsData.push(student);
                    }

                    // Generate Grades for these students
                    // They have taken courses from Sem 1 up to currentSem
                    // For simplicity, let's just grade the courses of their CURRENT semester
                    // Or maybe previous ones too? The request implies history.
                    // "data mahasiswa dari semester 1 sampai 8"
                    // Let's grade ALL courses they should have taken (Sem 1 to currentSem)

                    const takenMks = mataKuliahs.filter(mk => mk.semester <= currentSem);

                    for (const student of studentsData) {
                        for (const mk of takenMks) {
                            // Get CPMKs for this MK
                            const cpmks = await prisma.cpmk.findMany({ where: { mataKuliahId: mk.id } });

                            // Generate Nilai CPMK
                            for (const cpmk of cpmks) {
                                const score = 70 + Math.random() * 30; // Random score 70-100
                                await prisma.nilaiCpmk.upsert({
                                    where: {
                                        mahasiswaId_cpmkId_semester_tahunAjaranId: {
                                            mahasiswaId: student.id,
                                            cpmkId: cpmk.id,
                                            semester: mk.semester,
                                            tahunAjaranId: tahunAjaran.id
                                        }
                                    },
                                    update: {},
                                    create: {
                                        mahasiswaId: student.id,
                                        cpmkId: cpmk.id,
                                        mataKuliahId: mk.id,
                                        nilaiAkhir: score,
                                        semester: mk.semester,
                                        semesterId: mk.semesterId,
                                        tahunAjaranId: tahunAjaran.id,
                                        isCalculated: true
                                    }
                                });
                            }

                            // IF Student is in Semester 8, ALSO generate Nilai CPL
                            if (currentSem === 8) {
                                const mkCpls = await prisma.cplMataKuliah.findMany({ where: { mataKuliahId: mk.id } });
                                for (const mkCpl of mkCpls) {
                                    const score = 75 + Math.random() * 25;
                                    await prisma.nilaiCpl.upsert({
                                        where: {
                                            mahasiswaId_cplId_mataKuliahId_semester_tahunAjaranId: {
                                                mahasiswaId: student.id,
                                                cplId: mkCpl.cplId,
                                                mataKuliahId: mk.id,
                                                semester: mk.semester,
                                                tahunAjaranId: tahunAjaran.id
                                            }
                                        },
                                        update: {},
                                        create: {
                                            mahasiswaId: student.id,
                                            cplId: mkCpl.cplId,
                                            mataKuliahId: mk.id,
                                            nilai: score,
                                            semester: mk.semester,
                                            semesterId: mk.semesterId,
                                            tahunAjaranId: tahunAjaran.id,
                                            createdBy: dosens[0].id
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    console.log('\n✅ COMPREHENSIVE SEEDING COMPLETED!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
