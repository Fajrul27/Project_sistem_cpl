
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProdiDistribution() {
    try {
        const data = await prisma.penilaianTidakLangsung.findMany({
            where: { tahunAjaran: "2024/2025 Ganjil" },
            include: {
                mahasiswa: true // This relates to Profile
            }
        });

        const prodiCounts: Record<string, number> = {};

        data.forEach(item => {
            const prodi = item.mahasiswa?.prodiId || 'Unknown';
            prodiCounts[prodi] = (prodiCounts[prodi] || 0) + 1;
        });

        console.log('Prodi Distribution:', prodiCounts);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkProdiDistribution();
