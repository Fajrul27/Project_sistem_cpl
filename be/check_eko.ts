
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const eko = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Eko' } },
        include: { krs: true, nilaiTeknik: true }
    });

    if (!eko) {
        console.log("Eko not found");
        return;
    }

    console.log(`Mahasiswa: ${eko.namaLengkap}`);
    console.log(`Total KRS: ${eko.krs.length}`);
    console.log(`Total Nilai Teknik: ${eko.nilaiTeknik.length}`);

    const uniqueMkWithGrades = new Set(eko.nilaiTeknik.map(n => n.mataKuliahId));
    console.log(`Mata Kuliah Unik dengan Nilai: ${uniqueMkWithGrades.size}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
