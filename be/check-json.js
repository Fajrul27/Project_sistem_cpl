
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkJson() {
    try {
        const mapping = await prisma.cplMataKuliah.findFirst();
        if (mapping) {
            console.log('Raw Prisma Object:', mapping);
            console.log('JSON Stringified:', JSON.stringify(mapping));
            console.log('Type of bobot:', typeof mapping.bobotKontribusi);
            console.log('Is Decimal?', mapping.bobotKontribusi.constructor.name);
        } else {
            console.log('No mapping found');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkJson();
