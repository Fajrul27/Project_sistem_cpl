import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Verifying Data...');

    const userCount = await prisma.user.count();
    console.log(`Users: ${userCount}`);

    const facultyCount = await prisma.fakultas.count();
    console.log(`Faculties: ${facultyCount}`);

    const prodiCount = await prisma.prodi.count();
    console.log(`Prodis: ${prodiCount}`);

    const mkCount = await prisma.mataKuliah.count();
    console.log(`Mata Kuliah: ${mkCount}`);

    const nilaiCpmkCount = await prisma.nilaiCpmk.count();
    console.log(`Nilai CPMK: ${nilaiCpmkCount}`);

    const nilaiCplCount = await prisma.nilaiCpl.count();
    console.log(`Nilai CPL: ${nilaiCplCount}`);

    // Check one student
    const student = await prisma.user.findFirst({
        where: { role: { role: 'mahasiswa' } },
        include: { profile: true }
    });

    if (student) {
        console.log(`\nSample Student: ${student.profile?.namaLengkap} (${student.profile?.nim})`);
        console.log(`Prodi: ${student.profile?.programStudi}`);
        console.log(`Semester: ${student.profile?.semester}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
