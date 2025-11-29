import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugMatching() {
    console.log('=== EXACT MATCHING DEBUG ===\n');

    // 1. Get dosen bije data
    const user = await prisma.user.findFirst({
        where: { email: { contains: 'bije' } }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    const profile = await prisma.profile.findUnique({
        where: { userId: user.id }
    });

    const teaching = await prisma.mataKuliahPengampu.findMany({
        where: { dosenId: user.id },
        include: { mataKuliah: true }
    });

    console.log('1. DOSEN BIJE DATA:');
    console.log(`   Profile programStudi: "${profile?.programStudi}"`);
    teaching.forEach((t, i) => {
        console.log(`   MK ${i + 1} programStudi: "${t.mataKuliah.programStudi}"`);
    });

    // 2. Get all prodi
    const allProdi = await prisma.prodi.findMany();
    console.log(`\n2. ALL PRODI IN DB (${allProdi.length} total):`);
    allProdi.forEach((p, i) => {
        console.log(`   ${i + 1}. nama: "${p.nama}"`);
        console.log(`      kode: "${p.kode || 'NULL'}"`);
        console.log(`      id: ${p.id}`);
    });

    // 3. Test matching logic
    console.log('\n3. TESTING MATCHING LOGIC:');
    if (profile?.programStudi) {
        const testName = profile.programStudi;
        const cleaned = testName.replace(/[()]/g, '').trim();

        console.log(`   Original: "${testName}"`);
        console.log(`   Cleaned: "${cleaned}"`);

        const matchingProdis = await prisma.prodi.findMany({
            where: {
                OR: [
                    { nama: { contains: cleaned } },
                    { kode: { contains: cleaned } }
                ]
            }
        });

        console.log(`   Matching prodis found: ${matchingProdis.length}`);
        matchingProdis.forEach(p => {
            console.log(`     ✓ ${p.nama} (${p.kode}) - ID: ${p.id}`);
        });

        // 4. Check CPL for matched prodis
        if (matchingProdis.length > 0) {
            console.log('\n4. CPL FOR MATCHED PRODIS:');
            for (const prodi of matchingProdis) {
                const cplCount = await prisma.cpl.count({
                    where: {
                        isActive: true,
                        prodiId: prodi.id
                    }
                });
                console.log(`   Prodi "${prodi.nama}": ${cplCount} CPL`);

                if (cplCount > 0) {
                    const sampleCpl = await prisma.cpl.findMany({
                        where: { isActive: true, prodiId: prodi.id },
                        take: 3,
                        select: { kodeCpl: true, deskripsi: true }
                    });
                    sampleCpl.forEach(c => {
                        console.log(`     - ${c.kodeCpl}: ${c.deskripsi.substring(0, 50)}...`);
                    });
                }
            }
        } else {
            console.log('\n   ❌ NO MATCHING PRODI FOUND!');
            console.log('   This is the problem - logic cannot find matching prodi');
        }
    }

    // 5. Check CPL without prodiId
    const cplNoProdi = await prisma.cpl.count({
        where: { isActive: true, prodiId: null }
    });
    console.log(`\n5. CPL WITHOUT PRODI_ID: ${cplNoProdi}`);

    await prisma.$disconnect();
}

debugMatching().catch(console.error);
