
import { prisma } from '../server/lib/prisma';

async function main() {
    const user = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Fajrul' } },
        include: { user: true }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log(`Checking grades for ${user.namaLengkap} (${user.userId})`);

    const nilaiCpl = await prisma.nilaiCpl.findMany({
        where: { mahasiswaId: user.userId },
        include: { cpl: true, mataKuliah: true }
    });

    console.log(`Found ${nilaiCpl.length} NilaiCpl records.`);
    nilaiCpl.forEach(n => {
        console.log(`- CPL: ${n.cpl.kodeCpl}, MK: ${n.mataKuliah.namaMk}, Nilai: ${n.nilai}`);
    });

    const nilaiCpmk = await prisma.nilaiCpmk.findMany({
        where: { mahasiswaId: user.userId }
    });
    console.log(`Found ${nilaiCpmk.length} NilaiCpmk records.`);

    const nilaiTeknik = await prisma.nilaiTeknikPenilaian.findMany({
        where: { mahasiswaId: user.userId }
    });
    console.log(`Found ${nilaiTeknik.length} NilaiTeknik records.`);
}

main();
