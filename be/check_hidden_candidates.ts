
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Hidden Normalization Candidates ---');

    // Check MataKuliah for potential Curriculum versions (same name, different code)
    const mkNames = await prisma.mataKuliah.groupBy({
        by: ['namaMk'],
        _count: { namaMk: true },
        having: {
            namaMk: {
                _count: {
                    gt: 1
                }
            }
        }
    });
    console.log('\n1. MataKuliah Duplicates (Potential Curriculum versions):', JSON.stringify(mkNames, null, 2));

    if (mkNames.length > 0) {
        const duplicateMks = await prisma.mataKuliah.findMany({
            where: {
                namaMk: {
                    in: mkNames.map(m => m.namaMk)
                }
            },
            select: { kodeMk: true, namaMk: true, semester: true, programStudi: true }
        });
        console.log('   Details:', JSON.stringify(duplicateMks, null, 2));
    }

    // Check Settings for anything interesting
    const settings = await prisma.settings.findMany();
    console.log('\n2. All Settings Keys:', settings.map(s => s.key));

    // Check if there are any "Jenis Mata Kuliah" (Wajib/Pilihan) implied in descriptions or codes?
    // Hard to check in DB, but let's look at a sample of MKs
    const sampleMks = await prisma.mataKuliah.findMany({ take: 5 });
    console.log('\n3. Sample MataKuliah:', JSON.stringify(sampleMks, null, 2));

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
