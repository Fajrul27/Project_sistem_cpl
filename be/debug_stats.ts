import { prisma } from './server/lib/prisma.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const tahunAjaran = "2024/2025 Ganjil";
    const prodiId = null; // Simulate admin request

    console.log(`Testing stats query with TA: '${tahunAjaran}', ProdiId: ${prodiId}`);

    const whereClause: any = {};
    if (tahunAjaran) whereClause.tahunAjaran = String(tahunAjaran);
    if (prodiId) {
        whereClause.mahasiswa = {
            prodiId: String(prodiId)
        };
    }

    console.log('Where Clause:', JSON.stringify(whereClause, null, 2));

    // 1. Check count first
    const count = await prisma.penilaianTidakLangsung.count({
        where: whereClause
    });
    console.log(`Matching records count: ${count}`);

    if (count === 0) {
        console.log("No records match! Checking available Tahun Ajaran values...");
        const allTA = await prisma.penilaianTidakLangsung.findMany({
            select: { tahunAjaran: true },
            distinct: ['tahunAjaran']
        });
        console.log("Available TAs:", allTA.map(t => `'${t.tahunAjaran}'`));
    }

    // 2. Run GroupBy
    const stats = await prisma.penilaianTidakLangsung.groupBy({
        by: ['cplId'],
        where: whereClause,
        _avg: {
            nilai: true
        },
        _count: {
            nilai: true
        }
    });

    console.log(`COUNT: ${stats.length}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
