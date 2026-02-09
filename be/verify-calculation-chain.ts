
import { prisma } from './server/lib/prisma.js';

async function verifyCalculationChain() {
    console.log('--- STARTING CALCULATION CHAIN VERIFICATION ---\n');

    // 1. Pick a random Student, Course, and CPL to trace
    const targetStudent = await prisma.user.findFirst({
        where: { role: { role: { name: 'mahasiswa' } } },
        include: { profile: true }
    });

    if (!targetStudent) { console.error('No student found'); return; }
    console.log(`Step 1: Target Student: ${targetStudent.profile?.namaLengkap} (${targetStudent.profile?.nim})`);

    // 2. Find a Mata Kuliah with CPL Mapping
    const targetCourse = await prisma.mataKuliah.findFirst({
        where: {
            cpl: { some: {} },
            cpmk: { some: { teknikPenilaian: { some: {} } } }
        },
        include: { cpl: true, cpmk: { include: { teknikPenilaian: true } } }
    });

    if (!targetCourse) { console.error('No suitable course found'); return; }
    const courseSKS = targetCourse.sks;
    console.log(`Step 2: Target Course: ${targetCourse.namaMk} (${courseSKS} SKS)`);

    const cplMapping = targetCourse.cpl[0];
    const targetCPLId = cplMapping.cplId;
    const courseWeightToCPL = Number(cplMapping.bobotKontribusi);
    console.log(`   -> Mapped to CPL ID: ${targetCPLId}`);
    console.log(`   -> Course Weight (Bobot MK): ${courseWeightToCPL}`);

    // 3. Simulate Grade Input (Assessment Level)
    const targetCPMK = targetCourse.cpmk[0];
    const targetTeknik = targetCPMK.teknikPenilaian[0];
    const inputGrade = 85.0;
    const teknikWeight = Number(targetTeknik.bobotPersentase);

    console.log(`Step 3: Simulating Input Grade: ${inputGrade}`);
    console.log(`   -> CPMK: ${targetCPMK.kodeCpmk}`);
    console.log(`   -> Technique: ${targetTeknik.namaTeknik} (Weight: ${teknikWeight}%)`);

    // --- MANUAL CALCULATION PREDICTION ---
    // Assuming single technique for simplicity in this trace, or if multiple, others are 0/null
    // Micro Level: CPMK Score = InputGrade
    const predictedCPMKScore = inputGrade;

    // Macro Level: CPL Contribution = (CPMKScore * SKS * BobotMK)
    const predictedNumerator = predictedCPMKScore * courseSKS * courseWeightToCPL;
    const predictedDenominator = courseSKS * courseWeightToCPL;

    console.log('\n--- PREDICTED CALCULATION ---');
    console.log(`Micro (CPMK): ${predictedCPMKScore}`);
    console.log(`Macro Numerator (Score * SKS * Weight): ${predictedNumerator}`);
    console.log(`Macro Denominator (SKS * Weight): ${predictedDenominator}`);


    // --- ACTUAL SYSTEM DATA CHECK ---
    // Check NilaiTeknik
    const actualNilaiTeknik = await prisma.nilaiTeknikPenilaian.findFirst({
        where: {
            mahasiswaId: targetStudent.id,
            teknikPenilaianId: targetTeknik.id
        }
    });

    // Check NilaiCPMK
    const actualNilaiCPMK = await prisma.nilaiCpmk.findFirst({
        where: {
            mahasiswaId: targetStudent.id,
            cpmkId: targetCPMK.id
        }
    });

    // Check NilaiCPL (Transcript)
    const actualNilaiCPL = await prisma.nilaiCpl.findFirst({
        where: {
            mahasiswaId: targetStudent.id,
            cplId: targetCPLId,
            mataKuliahId: targetCourse.id
        }
    });

    console.log('\n--- ACTUAL DB DATA ---');
    console.log(`1. Nilai Teknik (Input): ${actualNilaiTeknik?.nilai ?? 'Not Found'}`);
    console.log(`2. Nilai CPMK (Calculated): ${actualNilaiCPMK?.nilaiAkhir ?? 'Not Found'}`);
    console.log(`3. Nilai CPL Contribution (Calculated): ${actualNilaiCPL?.nilai ?? 'Not Found'}`);

    if (actualNilaiCPL && Math.abs(Number(actualNilaiCPL.nilai) - predictedCPMKScore) < 0.1) {
        console.log('\n[SUCCESS] System calculation matches prediction!');
    } else {
        console.log('\n[WARNING] Discrepancy found or data missing. Try running the simulation input first.');
    }

}

verifyCalculationChain()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
