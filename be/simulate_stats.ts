
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simulate() {
    try {
        const whereClause: any = {
            tahunAjaran: "2024/2025 Ganjil"
        };
        // semester is 'all', so no semester filter.
        // admin role, all prodi, all fakultas -> no mahasiswa filter.

        console.log("Where Clause:", whereClause);

        const stats = await prisma.penilaianTidakLangsung.groupBy({
            by: ['cplId'],
            where: whereClause,
            _avg: { nilai: true },
            _count: { nilai: true }
        });

        console.log(`Found ${stats.length} stats records.`);
        if (stats.length > 0) {
            console.log("Sample:", stats[0]);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

simulate();
