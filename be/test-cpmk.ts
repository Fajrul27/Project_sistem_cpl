import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const cpmks = await prisma.cpmk.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 3,
        include: {
            mataKuliah: { select: { namaMk: true } },
            cplMappings: true,
            teknikPenilaian: true
        }
    });
    console.log("3 CPMK Terbaru (Cek Mapping):");
    cpmks.forEach(c => {
        console.log(`- ${c.kodeCpmk} (${c.mataKuliah.namaMk})`);
        console.log(`  Mapping: ${c.cplMappings.length}`);
        console.log(`  Teknik: ${c.teknikPenilaian.length}`);
    });
}
main().catch(console.error).finally(() => prisma.$disconnect());
