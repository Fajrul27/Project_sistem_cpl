import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProdiNames() {
    // Get all prodi
    const allProdi = await prisma.prodi.findMany({
        select: { id: true, nama: true, kode: true }
    });

    console.log('=== ALL PRODI IN DATABASE ===\n');
    allProdi.forEach((p, i) => {
        console.log(`${i + 1}. ${p.nama} (${p.kode || 'no code'})`);
        console.log(`   ID: ${p.id}`);
    });

    // Test matching with FMIKOM
    console.log('\n=== TESTING MATCH WITH "FMIKOM" ===\n');
    const testName = '(FMIKOM)';
    const cleaned = testName.replace(/[()]/g, '').trim(); // Result: "FMIKOM"

    console.log(`Original: ${testName}`);
    console.log(`Cleaned: ${cleaned}`);

    const matchingProdis = await prisma.prodi.findMany({
        where: {
            OR: [
                { nama: { contains: cleaned } },
                { kode: { contains: cleaned } }
            ]
        }
    });

    console.log(`\nMatching Prodis Found: ${matchingProdis.length}`);
    matchingProdis.forEach(p => {
        console.log(`  - ${p.nama} (${p.kode}) - ID: ${p.id}`);
    });

    // Also check what dosen bije has
    const user = await prisma.user.findFirst({
        where: { email: { contains: 'bije' } },
        include: { profile: true }
    });

    console.log(`\n=== DOSEN BIJE DATA ===`);
    console.log(`programStudi: ${user?.profile?.programStudi}`);

    await prisma.$disconnect();
}

checkProdiNames().catch(console.error);
