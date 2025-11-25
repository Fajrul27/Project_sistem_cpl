
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Potential Normalization Candidates ---');

    // Check Cpl Kategori
    const cplKategori = await prisma.cpl.groupBy({
        by: ['kategori'],
        _count: {
            kategori: true
        }
    });
    console.log('\n1. Cpl Kategori:', JSON.stringify(cplKategori, null, 2));

    // Check Cpmk Level Taksonomi
    const cpmkLevel = await prisma.cpmk.groupBy({
        by: ['levelTaksonomi'],
        _count: {
            levelTaksonomi: true
        }
    });
    console.log('\n2. Cpmk Level Taksonomi:', JSON.stringify(cpmkLevel, null, 2));

    // Check Teknik Penilaian names
    const teknikNames = await prisma.teknikPenilaian.groupBy({
        by: ['namaTeknik'],
        _count: {
            namaTeknik: true
        }
    });
    console.log('\n3. Teknik Penilaian Names:', JSON.stringify(teknikNames, null, 2));

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
