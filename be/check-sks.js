
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSks() {
    try {
        const mks = await prisma.mataKuliah.findMany({ select: { sks: true } });

        console.log(`Total MKs: ${mks.length}`);

        const distribution = {};

        mks.forEach(mk => {
            const val = mk.sks;
            distribution[val] = (distribution[val] || 0) + 1;
        });

        console.log('SKS Distribution:');
        console.log(distribution);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkSks();
