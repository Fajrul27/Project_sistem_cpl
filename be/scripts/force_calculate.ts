
import { prisma } from '../server/lib/prisma';
import { calculateNilaiCplFromCpmk } from '../server/lib/calculation';

async function main() {
    const user = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Fajrul' } },
        select: { userId: true }
    });

    if (!user) return;

    console.log(`Force calculating for user: ${user.userId}`);

    const grades = await prisma.nilaiTeknikPenilaian.findMany({
        where: { mahasiswaId: user.userId },
        select: { mataKuliahId: true, semester: true, tahunAjaran: true },
        distinct: ['mataKuliahId']
    });

    for (const g of grades) {
        console.log(`Calculating for MK: ${g.mataKuliahId}, Sem: ${g.semester}, TA: ${g.tahunAjaran}`);
        try {
            await calculateNilaiCplFromCpmk(user.userId, g.mataKuliahId, g.semester, g.tahunAjaran);
            console.log('  - Success');
        } catch (e) {
            console.error('  - Failed:', e);
        }
    }

    // Check results
    const result = await prisma.nilaiCpl.count({ where: { mahasiswaId: user.userId } });
    console.log(`Total NilaiCpl after calculation: ${result}`);
}

main();
