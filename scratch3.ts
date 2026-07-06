import { prisma } from './be/server/lib/prisma.js';

async function test() {
    const mahasiswa = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Akmal' } },
        include: { angkatanRef: true }
    });
    
    console.log("Mahasiswa Kurikulum ID:", mahasiswa?.angkatanRef?.kurikulumId);
    
    const mks = await prisma.mataKuliah.findMany({
        take: 5
    });
    console.log("Sample MK Kurikulum IDs:", mks.map(m => m.kurikulumId));
}

test().catch(console.error).finally(() => prisma.$disconnect());
