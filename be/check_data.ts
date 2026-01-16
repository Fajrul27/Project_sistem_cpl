
import { prisma } from './server/lib/prisma.js';

async function main() {
    const activeTA = await prisma.tahunAjaran.findFirst({ where: { isActive: true } });
    console.log('Active Tahun Ajaran:', activeTA);

    const allTA = await prisma.tahunAjaran.findMany();
    console.log('All Tahun Ajaran:', allTA);

    const orphanedCpl = await prisma.nilaiCpl.count({ where: { tahunAjaranId: null } });
    const orphanedCpmk = await prisma.nilaiCpmk.count({ where: { tahunAjaranId: null } });
    const orphanedTeknik = await prisma.nilaiTeknikPenilaian.count({ where: { tahunAjaranId: null } });

    console.log('Orphaned Records (tahunAjaranId is null):');
    console.log('- NilaiCpl:', orphanedCpl);
    console.log('- NilaiCpmk:', orphanedCpmk);
    console.log('- NilaiTeknikPenilaian:', orphanedTeknik);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
