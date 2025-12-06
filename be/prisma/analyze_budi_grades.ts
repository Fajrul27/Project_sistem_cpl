
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const namePart = 'Budi Rahayu';
    const profile = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: namePart } },
        include: { user: true }
    });

    if (!profile) return console.error("User not found");

    const grades = await prisma.nilaiCpmk.findMany({
        where: { mahasiswaId: profile.userId },
        include: { cpmk: true, mataKuliah: true }
    });

    console.log(`Total Raw Grades: ${grades.length}`);

    const inactiveMks = grades.filter(g => !g.mataKuliah.isActive);
    console.log(`Inactive MK Grades: ${inactiveMks.length}`);

    const inactiveCpmks = grades.filter(g => !g.cpmk.isActive && g.mataKuliah.isActive);
    console.log(`Inactive CPMK Grades (in Active MK): ${inactiveCpmks.length}`);

    const active = grades.filter(g => g.mataKuliah.isActive && g.cpmk.isActive);
    console.log(`Fully Active Grades: ${active.length}`);

    const uniqueMks = new Set(active.map(g => g.mataKuliahId));
    console.log(`Unique Active MKs: ${uniqueMks.size}`);

    // Check by Semester
    const bySem = new Map<number, number>();
    active.forEach(g => {
        bySem.set(g.semester, (bySem.get(g.semester) || 0) + 1);
    });
    console.log("By Semester:");
    bySem.forEach((count, sem) => console.log(` Sem ${sem}: ${count}`));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
