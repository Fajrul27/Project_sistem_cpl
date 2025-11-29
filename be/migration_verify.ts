import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * STEP 3: Verify migration results
 */

async function verifyMigration() {
    console.log('=== MIGRATION VERIFICATION ===\n');

    // Check profiles
    const profilesWithProdiId = await prisma.profile.count({
        where: { prodiId: { not: null } }
    });

    const profilesWithoutProdiId = await prisma.profile.count({
        where: { prodiId: null }
    });

    const profilesWithLegacyData = await prisma.profile.count({
        where: {
            AND: [
                { programStudi: { not: null } },
                { prodiId: null }
            ]
        }
    });

    console.log('📊 Profile Status:');
    console.log(`  ✅ With prodiId: ${profilesWithProdiId}`);
    console.log(`  ⚠️  Without prodiId: ${profilesWithoutProdiId}`);
    console.log(`  🔄 Legacy data remaining: ${profilesWithLegacyData}`);

    // Check mata kuliah
    const mkWithProdiId = await prisma.mataKuliah.count({
        where: { prodiId: { not: null } }
    });

    const mkWithoutProdiId = await prisma.mataKuliah.count({
        where: { prodiId: null }
    });

    const mkWithLegacyData = await prisma.mataKuliah.count({
        where: {
            AND: [
                { programStudi: { not: null } },
                { prodiId: null }
            ]
        }
    });

    console.log('\n📚 Mata Kuliah Status:');
    console.log(`  ✅ With prodiId: ${mkWithProdiId}`);
    console.log(`  ⚠️  Without prodiId: ${mkWithoutProdiId}`);
    console.log(`  🔄 Legacy data remaining: ${mkWithLegacyData}`);

    // Check CPL
    const cplWithProdiId = await prisma.cpl.count({
        where: { prodiId: { not: null } }
    });

    const cplWithoutProdiId = await prisma.cpl.count({
        where: { prodiId: null }
    });

    console.log('\n📝 CPL Status:');
    console.log(`  ✅ With prodiId: ${cplWithProdiId}`);
    console.log(`  ⚠️  Without prodiId: ${cplWithoutProdiId}`);

    // Sample migrated data
    console.log('\n\n=== SAMPLE MIGRATED DATA ===\n');

    const sampleProfiles = await prisma.profile.findMany({
        where: { prodiId: { not: null } },
        take: 5,
        select: {
            namaLengkap: true,
            programStudi: true,
            prodiId: true,
            prodi: { select: { nama: true } }
        }
    });

    console.log('Sample Profiles:');
    sampleProfiles.forEach(p => {
        console.log(`  - ${p.namaLengkap}`);
        console.log(`    programStudi: "${p.programStudi}"`);
        console.log(`    prodiId: ${p.prodiId}`);
        console.log(`    prodi: ${p.prodi?.nama}\n`);
    });

    // Check for any remaining issues
    console.log('\n=== POTENTIAL ISSUES ===\n');

    if (profilesWithLegacyData > 0) {
        console.log(`⚠️  ${profilesWithLegacyData} profiles still have programStudi but no prodiId`);
        console.log('   These may need manual mapping.\n');

        const unmappedPS = await prisma.profile.findMany({
            where: {
                AND: [
                    { programStudi: { not: null } },
                    { prodiId: null }
                ]
            },
            select: { programStudi: true },
            distinct: ['programStudi']
        });

        console.log('   Unmapped programStudi values:');
        unmappedPS.forEach(p => console.log(`     - "${p.programStudi}"`));
    }

    if (mkWithLegacyData > 0) {
        console.log(`\n⚠️  ${mkWithLegacyData} mata kuliah still have programStudi but no prodiId`);
        console.log('   These may need manual mapping.\n');
    }

    // Overall success rate
    const profileSuccessRate = profilesWithProdiId > 0
        ? ((profilesWithProdiId / (profilesWithProdiId + profilesWithLegacyData)) * 100).toFixed(1)
        : '0';

    const mkSuccessRate = mkWithProdiId > 0
        ? ((mkWithProdiId / (mkWithProdiId + mkWithLegacyData)) * 100).toFixed(1)
        : '0';

    console.log('\n\n=== SUCCESS RATE ===');
    console.log(`Profiles: ${profileSuccessRate}% migrated`);
    console.log(`Mata Kuliah: ${mkSuccessRate}% migrated`);

    if (profilesWithLegacyData === 0 && mkWithLegacyData === 0) {
        console.log('\n🎉 Perfect! All data has been migrated successfully!');
    } else {
        console.log('\n⚠️  Some legacy data remains. Review the issues above.');
    }

    await prisma.$disconnect();
}

verifyMigration().catch(console.error);
