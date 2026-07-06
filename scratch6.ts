import { prisma } from './be/server/lib/prisma.js';

async function test() {
    const mappings = await prisma.cpmkCplMapping.findMany({
        include: { cpmk: { include: { mataKuliah: true } } }
    });
    console.log("Total CPMK-CPL Mappings:", mappings.length);
    if(mappings.length > 0) {
        console.log("Sample mapped MK:", mappings[0].cpmk.mataKuliah.namaMk);
    }
}
test().finally(() => prisma.$disconnect());
