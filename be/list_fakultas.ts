
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listFakultas() {
    try {
        const list = await prisma.fakultas.findMany();
        console.log("Fakultas List:", list.map(f => f.nama));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

listFakultas();
