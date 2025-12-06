
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProdiDistribution() {
    try {
        const data = await prisma.penilaianTidakLangsung.findMany({
            where: { tahunAjaran: "2024/2025 Ganjil" },
            include: {
                mahasiswa: true
            }
        });

        const prodiCounts: Record<string, number> = {};

        data.forEach(item => {
            const prodi = item.mahasiswa?.prodiId || 'Unknown';
            prodiCounts[prodi] = (prodiCounts[prodi] || 0) + 1;
        });

        // Get Prodi Names
        const prodiIds = Object.keys(prodiCounts);
        const prodis = await prisma.prodi.findMany({
            where: { id: { in: prodiIds } }
        });

        const report = prodiIds.map(id => {
            const name = prodis.find(p => p.id === id)?.nama || 'Unknown Name';
            return `${name} (${id}): ${prodiCounts[id]}`;
        }).join('\n');

        console.log('--- DISTRIBUTION ---');
        console.log(report);
        console.log('--- END ---');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkProdiDistribution();
