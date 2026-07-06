import { TranskripService } from './be/server/services/TranskripService.js';
import { prisma } from './be/server/lib/prisma.js';

async function test() {
    const mahasiswa = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Akmal' } },
        include: { angkatanRef: true }
    });
    
    const allCpls = await prisma.cpl.findMany({
        where: {
            isActive: true,
            OR: [
                { prodiId: mahasiswa?.prodiId },
                { prodiId: null }
            ]
        }
    });

    const mappedCoursesRaw = await prisma.cplMataKuliah.findMany({
        where: {
            cplId: { in: allCpls.map(c => c.id) },
            ...(mahasiswa?.angkatanRef?.kurikulumId ? {
                mataKuliah: {
                    kurikulumId: mahasiswa.angkatanRef.kurikulumId
                }
            } : {})
        },
        include: {
            mataKuliah: true
        }
    });

    console.log("Mapped Courses count:", mappedCoursesRaw.length);
}

test().catch(console.error).finally(() => prisma.$disconnect());
