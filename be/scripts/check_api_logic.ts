
import { prisma } from '../server/lib/prisma';

async function main() {
    const user = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Fajrul' } },
        include: { user: true }
    });

    if (!user) return;

    console.log(`Simulating API for: ${user.userId}`);

    // 1. Get CPLs (Logic from route)
    const allCpls = await prisma.cpl.findMany({
        where: {
            isActive: true,
            OR: [
                { prodiId: user.prodiId },
                { prodiId: null }
            ]
        }
    });
    console.log(`Found ${allCpls.length} relevant CPLs`);

    // 2. Get NilaiCpl
    const nilaiCplList = await prisma.nilaiCpl.findMany({
        where: { mahasiswaId: user.userId },
        include: { cpl: true }
    });
    console.log(`Found ${nilaiCplList.length} NilaiCpl records`);

    // 3. Match
    let matched = 0;
    for (const cpl of allCpls) {
        const hasGrade = nilaiCplList.some(n => n.cplId === cpl.id);
        if (hasGrade) matched++;
    }
    console.log(`Matched CPLs in Transcript: ${matched}`);
}

main();
