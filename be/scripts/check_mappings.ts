
import { prisma } from '../server/lib/prisma';

async function main() {
    const user = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Fajrul' } },
        select: { userId: true }
    });

    if (!user) return;

    // Get MKs that have grades
    const grades = await prisma.nilaiTeknikPenilaian.findMany({
        where: { mahasiswaId: user.userId },
        select: { mataKuliahId: true },
        distinct: ['mataKuliahId']
    });

    const mkIds = grades.map(g => g.mataKuliahId);
    console.log(`User has grades in ${mkIds.length} MKs.`);

    for (const mkId of mkIds) {
        const mk = await prisma.mataKuliah.findUnique({
            where: { id: mkId },
            select: { namaMk: true, kodeMk: true }
        });

        // Check CPMK -> CPL Mappings
        const cpmks = await prisma.cpmk.findMany({
            where: { mataKuliahId: mkId },
            include: { cplMappings: true }
        });

        console.log(`MK: ${mk?.namaMk} (${mk?.kodeMk})`);
        let totalMappings = 0;
        cpmks.forEach(c => {
            console.log(`  - CPMK ${c.kodeCpmk}: ${c.cplMappings.length} CPL mappings`);
            totalMappings += c.cplMappings.length;
        });

        if (totalMappings === 0) {
            console.log(`  [WARNING] No CPL mappings found for this MK!`);
        }
    }
}

main();
