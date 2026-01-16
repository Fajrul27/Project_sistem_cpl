
import { prisma } from './server/lib/prisma.js';

async function main() {
    const activeTA = await prisma.tahunAjaran.findFirst({ where: { isActive: true } });
    if (!activeTA) {
        console.error('No active Tahun Ajaran found!');
        return;
    }

    console.log(`Backfilling data to Active Tahun Ajaran: ${activeTA.nama} (${activeTA.id})`);

    // Define tables and their unique keys (excluding tahunAjaranId for matching)
    const tables = [
        { name: 'nilaiCpl', keys: ['mahasiswaId', 'cplId', 'mataKuliahId', 'semester'] },
        { name: 'nilaiCpmk', keys: ['mahasiswaId', 'cpmkId', 'semester'] },
        { name: 'nilaiSubCpmk', keys: ['mahasiswaId', 'subCpmkId', 'semester'] },
        { name: 'nilaiTeknikPenilaian', keys: ['mahasiswaId', 'teknikPenilaianId', 'semester'] },
        { name: 'evaluasiMataKuliah', keys: ['mataKuliahId', 'dosenId', 'semester'] },
        { name: 'penilaianTidakLangsung', keys: ['mahasiswaId', 'cplId', 'semester'] }
    ];

    for (const { name, keys } of tables) {
        console.log(`Processing ${name}...`);
        // @ts-ignore
        const orphans = await prisma[name].findMany({
            where: { tahunAjaranId: null }
        });

        console.log(`Found ${orphans.length} orphans in ${name}`);

        for (const orphan of orphans) {
            // Construct where clause to find existing record in active TA
            const duplicateCheck: any = { tahunAjaranId: activeTA.id };
            for (const key of keys) {
                duplicateCheck[key] = orphan[key];
            }

            // @ts-ignore
            const existing = await prisma[name].findFirst({
                where: duplicateCheck
            });

            if (existing) {
                // Duplicate exists in target year, so delete the orphan
                // @ts-ignore
                await prisma[name].delete({ where: { id: orphan.id } });
                // process.stdout.write('D'); // Deleted
            } else {
                // No duplicate, safe to move orphan to active year
                // @ts-ignore
                await prisma[name].update({
                    where: { id: orphan.id },
                    data: { tahunAjaranId: activeTA.id }
                });
                // process.stdout.write('U'); // Updated
            }
        }
        console.log(`\nFinished ${name}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
