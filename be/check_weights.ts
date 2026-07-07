import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const cpmks = await prisma.cpmk.findMany({
        where: { mataKuliah: { kodeMk: '212MKTI02' } },
        include: { teknikPenilaian: true }
    });

    let mkTotal = 0;
    for (const cpmk of cpmks) {
        let cpmkTotal = 0;
        for (const tp of cpmk.teknikPenilaian) {
            cpmkTotal += Number(tp.bobotPersentase);
            mkTotal += Number(tp.bobotPersentase);
        }
        console.log(`CPMK ${cpmk.kodeCpmk} total weight: ${cpmkTotal}`);
    }
    console.log(`MK Total weight: ${mkTotal}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
