
import { prisma } from './server/lib/prisma';

async function checkData() {
    const user = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Joko Anwar' } },
        include: { user: true }
    });

    if (!user) {
        console.log('User Joko Anwar not found');
        return;
    }

    console.log('User found:', user.namaLengkap, user.userId);

    const nilaiCpmk = await prisma.nilaiCpmk.findMany({
        where: { mahasiswaId: user.userId },
        include: { cpmk: true, mataKuliah: true }
    });

    console.log('Nilai CPMK count:', nilaiCpmk.length);
    if (nilaiCpmk.length > 0) {
        console.log('Sample:', {
            id: nilaiCpmk[0].id,
            nilaiAkhir: nilaiCpmk[0].nilaiAkhir,
            cpmk: nilaiCpmk[0].cpmk.kodeCpmk
        });
    }
}

checkData()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
