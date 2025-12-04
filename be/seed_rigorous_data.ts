import { PrismaClient } from '@prisma/client';
import { calculateNilaiCpmk, calculateNilaiCplFromCpmk } from './server/lib/calculation.js';

const prisma = new PrismaClient();

async function main() {
    console.log('--- SEEDING RIGOROUS OBE DATA ---');

    // 1. Setup Base Data (Fakultas, Prodi, TA)
    const fakultas = await prisma.fakultas.upsert({
        where: { kode: 'FT' },
        update: {},
        create: { nama: 'Fakultas Teknik', kode: 'FT' }
    });

    const prodi = await prisma.prodi.upsert({
        where: { nama: 'Teknik Informatika' },
        update: {},
        create: { nama: 'Teknik Informatika', kode: 'TI', fakultasId: fakultas.id }
    });

    const tahunAjaran = '2024/2025';
    const semester = 5;

    // CLEANUP: Delete existing MK if exists to ensure clean slate
    const existingMk = await prisma.mataKuliah.findUnique({ where: { kodeMk: 'TI-WEB-ADV' } });
    if (existingMk) {
        console.log('Deleting existing MK...');
        await prisma.mataKuliah.delete({ where: { id: existingMk.id } });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: 'dedi.dummy@example.com' } });
    if (existingUser) {
        console.log('Deleting existing User...');
        await prisma.user.delete({ where: { id: existingUser.id } });
    }

    // 1b. Setup Jenis Mata Kuliah
    const jenisMk = await prisma.jenisMataKuliah.upsert({
        where: { nama: 'Wajib' },
        update: {},
        create: { nama: 'Wajib' }
    });

    // 2. Create Mata Kuliah "Pemrograman Web Lanjut"
    const mk = await prisma.mataKuliah.upsert({
        where: { kodeMk: 'TI-WEB-ADV' },
        update: {
            jenisMkId: jenisMk.id
        },
        create: {
            kodeMk: 'TI-WEB-ADV',
            namaMk: 'Pemrograman Web Lanjut',
            sks: 3,
            semester: semester,
            prodiId: prodi.id,
            jenisMkId: jenisMk.id
        }
    });
    console.log(`Created MK: ${mk.namaMk}`);

    // 3. Create CPMK
    // First check if exists to avoid duplicates if run multiple times
    const cpmk = await prisma.cpmk.findFirst({
        where: { mataKuliahId: mk.id, kodeCpmk: 'CPMK-1' }
    }) || await prisma.cpmk.create({
        data: {
            mataKuliahId: mk.id,
            kodeCpmk: 'CPMK-1',
            deskripsi: 'Mampu membangun aplikasi web full-stack'
        }
    });
    console.log(`Created CPMK: ${cpmk.kodeCpmk}`);

    // 4. Create Sub-CPMKs (Rigorous Mode)
    const sub1 = await prisma.subCpmk.create({
        data: {
            cpmkId: cpmk.id,
            kode: 'Sub-CPMK-1.1',
            deskripsi: 'Mampu merancang API',
            bobot: 50
        }
    });
    const sub2 = await prisma.subCpmk.create({
        data: {
            cpmkId: cpmk.id,
            kode: 'Sub-CPMK-1.2',
            deskripsi: 'Mampu mengimplementasikan Frontend',
            bobot: 50
        }
    });
    console.log(`Created Sub-CPMKs: ${sub1.kode}, ${sub2.kode}`);

    // 5. Create Teknik Penilaian
    const teknik1 = await prisma.teknikPenilaian.create({
        data: {
            cpmkId: cpmk.id,
            namaTeknik: 'Tugas API',
            bobotPersentase: 50
        }
    });
    const teknik2 = await prisma.teknikPenilaian.create({
        data: {
            cpmkId: cpmk.id,
            namaTeknik: 'Project Frontend',
            bobotPersentase: 50
        }
    });
    console.log(`Created Teknik: ${teknik1.namaTeknik}, ${teknik2.namaTeknik}`);

    // 6. *** CRITICAL: CREATE MAPPINGS ***
    // Map Teknik 1 -> Sub-CPMK 1
    await prisma.asesmenSubCpmk.create({
        data: {
            teknikPenilaianId: teknik1.id,
            subCpmkId: sub1.id,
            bobot: 100
        }
    });
    // Map Teknik 2 -> Sub-CPMK 2
    await prisma.asesmenSubCpmk.create({
        data: {
            teknikPenilaianId: teknik2.id,
            subCpmkId: sub2.id,
            bobot: 100
        }
    });
    console.log('✅ Mappings Created (Teknik -> Sub-CPMK)');

    // 7. Create Student
    const user = await prisma.user.upsert({
        where: { email: 'dedi.dummy@example.com' },
        update: {},
        create: {
            email: 'dedi.dummy@example.com',
            passwordHash: 'hashed_password', // Dummy
            role: { create: { role: 'mahasiswa' } },
            profile: {
                create: {
                    namaLengkap: 'Dedi Dummy',
                    nim: 'DUMMY123',
                    prodiId: prodi.id,
                    semester: semester,
                    tahunMasuk: 2022
                }
            }
        },
        include: { profile: true }
    });
    console.log(`Created Student: ${user.profile?.namaLengkap}`);

    // 8. Input Grades
    // 8. Input Grades
    await prisma.nilaiTeknikPenilaian.upsert({
        where: {
            mahasiswaId_teknikPenilaianId_semester_tahunAjaran: {
                mahasiswaId: user.id,
                teknikPenilaianId: teknik1.id,
                semester,
                tahunAjaran
            }
        },
        update: { nilai: 85 },
        create: {
            mahasiswaId: user.id,
            teknikPenilaianId: teknik1.id,
            mataKuliahId: mk.id,
            nilai: 85,
            semester,
            tahunAjaran
        }
    });

    await prisma.nilaiTeknikPenilaian.upsert({
        where: {
            mahasiswaId_teknikPenilaianId_semester_tahunAjaran: {
                mahasiswaId: user.id,
                teknikPenilaianId: teknik2.id,
                semester,
                tahunAjaran
            }
        },
        update: { nilai: 90 },
        create: {
            mahasiswaId: user.id,
            teknikPenilaianId: teknik2.id,
            mataKuliahId: mk.id,
            nilai: 90,
            semester,
            tahunAjaran
        }
    });
    console.log('Grades Inputted: 85, 90');

    // 9. Trigger Calculation
    console.log('Triggering Calculation...');
    await calculateNilaiCpmk(user.id, cpmk.id, mk.id, semester, tahunAjaran);

    // 10. Verify Result
    const result = await prisma.nilaiCpmk.findFirst({
        where: { mahasiswaId: user.id, cpmkId: cpmk.id }
    });

    console.log('\n--- CALCULATION RESULT ---');
    if (result) {
        console.log(`Nilai Akhir CPMK: ${result.nilaiAkhir}`);
        console.log(`Status: ${Number(result.nilaiAkhir) > 0 ? 'SUCCESS' : 'FAILED'}`);
    } else {
        console.log('❌ No NilaiCpmk record found!');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
