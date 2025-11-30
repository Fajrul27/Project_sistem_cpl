
import { prisma } from '../server/lib/prisma';

async function main() {
    const user = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Fajrul' } },
        include: { user: true }
    });

    console.log('User:', user ? `${user.namaLengkap} (${user.userId})` : 'Not Found');

    const mks = await prisma.mataKuliah.findMany({
        take: 5,
        include: {
            cpmk: {
                include: {
                    teknikPenilaian: true
                }
            }
        }
    });

    console.log('Mata Kuliah Found:', mks.length);
    mks.forEach(mk => {
        console.log(`- ${mk.namaMk} (${mk.kodeMk}): ${mk.cpmk.length} CPMK`);
        mk.cpmk.forEach(c => {
            console.log(`  - CPMK: ${c.kodeCpmk}, Teknik: ${c.teknikPenilaian.length}`);
        });
    });
}

main();
