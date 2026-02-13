
import { prisma } from './server/lib/prisma.js';
import { calculateNilaiCpmk } from './server/lib/calculation.js';

async function main() {
    console.log('--- START VERIFICATION: Course-Based CPMK ---');

    // 1. Setup Data
    const prodiId = 'verify-prodi-1';
    const mhsId = 'verify-mhs-1';
    const mkId = 'verify-mk-1';
    const cpmk1Id = 'verify-cpmk-1';
    const cpmk2Id = 'verify-cpmk-2';
    const teknik1Id = 'verify-teknik-1';
    const teknik2Id = 'verify-teknik-2';
    const semester = 1;
    const taId = 'verify-ta-1';

    // Cleanup first
    try {
        await prisma.nilaiTeknikPenilaian.deleteMany({ where: { mahasiswaId: mhsId } });
        await prisma.nilaiCpmk.deleteMany({ where: { mahasiswaId: mhsId } });
        await prisma.teknikPenilaian.deleteMany({ where: { id: { in: [teknik1Id, teknik2Id] } } });
        await prisma.cpmk.deleteMany({ where: { mataKuliahId: mkId } });
        await prisma.mataKuliah.delete({ where: { id: mkId } });
    } catch { }

    console.log('Creating dummy data...');

    // Create TA (assuming exists or fail softly if foreign key needed, but let's try to minimal bypass)
    // Actually we need valid relations. We might need to use existing IDs if constraints are strong.
    // Let's rely on existing seed data or just mock the DB calls? No, implementation uses Prisma.
    // We will create minimal valid dependency tree.

    // ...Or better, use an existing user and course if possible?
    // Let's try to create standalone records if tables allow.
    // User, Prodi, MK, CPMK.

    // NOTE: This might fail if constraints are strict. Let's try to just use valid existing IDs if searching fails?
    // Let's create from scratch to be safe.

    // ... Skipping deep tree creation for brevity, assuming standard seed or simple constraints.
    // If this fails, I will use existing data search.

    // Actually, let's create a Helper wrapper to use existing data if verify script fails.
    // But for now, let's try assuming we can create "verify-..." IDs if UUIDs.

    // Create Dummy User (Mhs)
    // We need a user. findFirst student.
    const student = await prisma.user.findFirst({ where: { role: { role: { name: 'mahasiswa' } } } });
    if (!student) throw new Error('No student found');
    const studentId = student.id;

    // Find a valid MK
    const mk = await prisma.mataKuliah.findFirst();
    if (!mk) throw new Error('No MK found');

    // Create 2 CPMKs for this MK
    await prisma.cpmk.create({
        data: { id: cpmk1Id, kodeCpmk: 'V-CPMK1', mataKuliahId: mk.id, createdBy: studentId }
    });

    await prisma.cpmk.create({
        data: { id: cpmk2Id, kodeCpmk: 'V-CPMK2', mataKuliahId: mk.id, createdBy: studentId }
    });

    // Create 2 Tekniks (One for each CPMK)
    // T1: Weight 60 (out of 100 total for course)
    // T2: Weight 40
    await prisma.teknikPenilaian.create({
        data: { id: teknik1Id, cpmkId: cpmk1Id, namaTeknik: 'T1', bobotPersentase: 60 }
    });

    await prisma.teknikPenilaian.create({
        data: { id: teknik2Id, cpmkId: cpmk2Id, namaTeknik: 'T2', bobotPersentase: 40 }
    });

    // Input Nilai
    // T1 Score: 100 -> Contribution 60
    // T2 Score: 50 -> Contribution 20
    // Total Course Score: 80.
    // Logic Expectation: BOTH CPMK1 and CPMK2 should have nilaiAkhir = 80.

    // Create Semester/TA ref if needed, or null if allowed. Schema says Int for Semester.
    const sem = 1;
    // Find valid TA
    const ta = await prisma.tahunAjaran.findFirst();
    const taVal = ta ? ta.id : null;

    if (!taVal) throw new Error('No TA found');

    await prisma.nilaiTeknikPenilaian.create({
        data: {
            mahasiswaId: studentId,
            teknikPenilaianId: teknik1Id,
            mataKuliahId: mk.id,
            nilai: 100,
            semester: sem,
            tahunAjaranId: taVal
        }
    });

    await prisma.nilaiTeknikPenilaian.create({
        data: {
            mahasiswaId: studentId,
            teknikPenilaianId: teknik2Id,
            mataKuliahId: mk.id,
            nilai: 50,
            semester: sem,
            tahunAjaranId: taVal
        }
    });

    console.log('Calculating CPMK1...');
    await calculateNilaiCpmk(studentId, cpmk1Id, mk.id, sem, taVal);

    console.log('Calculating CPMK2...');
    await calculateNilaiCpmk(studentId, cpmk2Id, mk.id, sem, taVal);

    // Verify
    const res1 = await prisma.nilaiCpmk.findUnique({
        where: { mahasiswaId_cpmkId_semester_tahunAjaranId: { mahasiswaId: studentId, cpmkId: cpmk1Id, semester: sem, tahunAjaranId: taVal } }
    });

    const res2 = await prisma.nilaiCpmk.findUnique({
        where: { mahasiswaId_cpmkId_semester_tahunAjaranId: { mahasiswaId: studentId, cpmkId: cpmk2Id, semester: sem, tahunAjaranId: taVal } }
    });

    console.log(`CPMK1 Score: ${res1?.nilaiAkhir} (Expected: 80)`);
    console.log(`CPMK2 Score: ${res2?.nilaiAkhir} (Expected: 80)`);

    if (Number(res1?.nilaiAkhir) === 80 && Number(res2?.nilaiAkhir) === 80) {
        console.log('✅ SUCCESS: Both CPMKs reflect the Course Grade!');
    } else {
        console.error('❌ FAILURE: Scores do not match Course Grade.');
    }

    // Cleanup
    await prisma.nilaiTeknikPenilaian.deleteMany({ where: { mahasiswaId: studentId, mataKuliahId: mk.id, teknikPenilaianId: { in: [teknik1Id, teknik2Id] } } });
    await prisma.nilaiCpmk.deleteMany({ where: { mahasiswaId: studentId, cpmkId: { in: [cpmk1Id, cpmk2Id] } } });
    await prisma.teknikPenilaian.deleteMany({ where: { id: { in: [teknik1Id, teknik2Id] } } });
    await prisma.cpmk.deleteMany({ where: { id: { in: [cpmk1Id, cpmk2Id] } } });
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
