import { prisma } from './be/server/lib/prisma.js';

async function test() {
    const weights = await prisma.cplMataKuliah.findMany({});
    console.log("Total CPL Mata Kuliah in DB:", weights.length);
    if(weights.length > 0) {
        console.log("Sample CPL:", weights[0].cplId);
    }
}
test().finally(() => prisma.$disconnect());
