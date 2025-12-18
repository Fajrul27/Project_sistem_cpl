
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Searching for student 24KPI0004...');
    const student = await prisma.profile.findFirst({
        where: { nim: '24KPI0004' },
        include: { user: true }
    });

    if (!student) {
        console.error('Student not found');
        return;
    }
    console.log(`Found student: ${student.namaLengkap} (${student.userId})`);

    // Fetch TI-101 CPMK values
    // Search for course containing 'Pengantar Teknologi Informasi' or code 'TI-101'
    const mk = await prisma.mataKuliah.findFirst({
        where: { OR: [{ kodeMk: 'TI-101' }, { namaMk: { contains: 'Pengantar Teknologi' } }] }
    });

    if (!mk) {
        console.error('Course TI-101 not found');
        return;
    }
    console.log(`Found Course: ${mk.kodeMk} - ${mk.namaMk} (${mk.id})`);

    const cpmks = await prisma.nilaiCpmk.findMany({
        where: {
            mahasiswaId: student.userId,
            mataKuliahId: mk.id
        },
        include: { cpmk: true }
    });

    console.log('\n--- Nilai CPMK Records ---');
    cpmks.forEach(n => {
        console.log(`CPMK: ${n.cpmk.kodeCpmk}, NilaiAkhir: ${n.nilaiAkhir}`);
    });

    // Also verify simple vs rigorous
    // Check Teknik Penilaian for this course
    const teknik = await prisma.nilaiTeknikPenilaian.findMany({
        where: {
            mahasiswaId: student.userId,
            mataKuliahId: mk.id
        },
        include: { teknikPenilaian: { include: { cpmk: true } } }
    });

    // Check Sub-CPMK
    const subCpmk = await prisma.nilaiSubCpmk.findMany({
        where: {
            mahasiswaId: student.userId,
            mataKuliahId: mk.id
        },
        include: { subCpmk: true }
    });
    console.log('\n--- Nilai Sub-CPMK ---');
    subCpmk.forEach(s => {
        console.log(`Sub-CPMK: ${s.subCpmk.kode}, Nilai: ${s.nilai}`);
    });

    // Check Nilai CPL (which might be the "Course Grade" context user refers to?)
    const nilaiCpl = await prisma.nilaiCpl.findMany({
        where: {
            mahasiswaId: student.userId,
            mataKuliahId: mk.id
        },
        include: { cpl: true }
    });
    console.log('\n--- Nilai CPL (Calculated from CPMK) ---');
    nilaiCpl.forEach(nc => {
        console.log(`CPL: ${nc.cpl.kodeCpl}, Nilai: ${nc.nilai}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
