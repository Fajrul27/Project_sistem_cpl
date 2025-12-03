
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const budi = await prisma.profile.findFirst({
            where: { namaLengkap: { contains: 'Budi' } }
        });

        if (!budi) { console.log("No Budi"); return; }

        const pengampu = await prisma.mataKuliahPengampu.findMany({
            where: { dosenId: budi.userId },
            select: { kelasId: true }
        });

        const classIds = pengampu.map(p => p.kelasId).filter(Boolean);
        console.log("Class IDs:", classIds);

        const count = await prisma.profile.count({
            where: {
                kelasId: { in: classIds },
                user: { role: { role: 'mahasiswa' } }
            }
        });

        console.log("Total Students:", count);

    } catch (err) {
        console.error(err);
    }
}

main().finally(() => prisma.$disconnect());
