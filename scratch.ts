import { TranskripService } from './be/server/services/TranskripService.js';
import { prisma } from './be/server/lib/prisma.js';

async function test() {
    const mahasiswa = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Akmal' } }
    });
    
    if (!mahasiswa) {
        console.log("Mahasiswa not found");
        process.exit(1);
    }
    
    console.log("Mahasiswa ID:", mahasiswa.userId);
    const transkrip = await TranskripService.getTranskripCpl(mahasiswa.userId);
    console.log(JSON.stringify(transkrip.transkrip.map(t => ({ cpl: t.cpl.kodeCpl, mkCount: t.mataKuliahList.length, mks: t.mataKuliahList.map(m => m.kodeMk + ":" + m.nilai) })), null, 2));
}

test().catch(console.error).finally(() => prisma.$disconnect());
