
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    try {
        const counts = await prisma.penilaianTidakLangsung.groupBy({
            by: ['tahunAjaran'],
            _count: true
        });
        console.log('Tahun Ajaran frequencies:', counts);

        const sample = await prisma.penilaianTidakLangsung.findFirst();
        console.log('Sample record:', sample);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
