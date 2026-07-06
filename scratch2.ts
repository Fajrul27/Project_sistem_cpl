import { TranskripService } from './be/server/services/TranskripService.js';
import { prisma } from './be/server/lib/prisma.js';

async function test() {
    const mahasiswa = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Akmal' } }
    });
    
    const transkrip = await TranskripService.getTranskripCpl(mahasiswa.userId);
    let nullCount = 0;
    transkrip.transkrip.forEach(t => {
        t.mataKuliahList.forEach(m => {
            if (m.nilai === null) nullCount++;
        });
    });
    console.log("Total null scores:", nullCount);
}

test().catch(console.error).finally(() => prisma.$disconnect());
