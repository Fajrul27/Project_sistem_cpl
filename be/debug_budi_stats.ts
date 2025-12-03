import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Find Budi Santoso
        const budi = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: { contains: 'budi' } },
                    { profile: { namaLengkap: { contains: 'Budi' } } }
                ]
            },
            include: { profile: true }
        });

        if (!budi) {
            console.log("User Budi Santoso not found");
            return;
        }

        console.log(`Found User: ${budi.profile?.namaLengkap} (${budi.email})`);

        // 2. Find Assigned Courses
        const assignments = await prisma.mataKuliahPengampu.findMany({
            where: { dosenId: budi.id },
            include: { mataKuliah: true }
        });

        console.log(`Assigned Courses (${assignments.length}):`);
        const mkIds = assignments.map(a => a.mataKuliahId);

        for (const a of assignments) {
            console.log(`- ${a.mataKuliah.kodeMk} ${a.mataKuliah.namaMk}`);
        }

        // 3. Find CPLs mapped to these courses (via CPMK)
        // MK -> CPMK -> CPL
        const cpmks = await prisma.cpmk.findMany({
            where: { mataKuliahId: { in: mkIds } },
            include: {
                cplMappings: {
                    include: { cpl: true }
                }
            }
        });

        const mappedCpls = new Set<string>();
        cpmks.forEach(c => {
            c.cplMappings.forEach(m => mappedCpls.add(m.cpl.kodeCpl));
        });

        console.log(`Mapped CPLs via CPMK (${mappedCpls.size}):`, Array.from(mappedCpls));

        // 4. Check NilaiCpl for these courses
        const nilaiCpl = await prisma.nilaiCpl.findMany({
            where: {
                mataKuliahId: { in: mkIds }
            },
            select: {
                cpl: { select: { kodeCpl: true } },
                nilai: true
            }
        });

        console.log(`NilaiCpl Records found: ${nilaiCpl.length}`);
        const cplWithGrades = new Set(nilaiCpl.map(n => n.cpl.kodeCpl));
        console.log(`CPLs with grades:`, Array.from(cplWithGrades));

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
