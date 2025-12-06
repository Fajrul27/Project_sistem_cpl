
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    try {
        const groups = await prisma.penilaianTidakLangsung.groupBy({
            by: ['tahunAjaran'],
            _count: true
        });

        console.log('--- DATA DUMP START ---');
        console.log(JSON.stringify(groups, null, 2));
        console.log('--- DATA DUMP END ---');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
