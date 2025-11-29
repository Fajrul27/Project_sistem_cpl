import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * STEP 2: Execute migration
 * This will actually update the database
 */

// Define mapping here (will be filled from analysis)
const PRODI_MAPPING: Record<string, string> = {
    // This will be auto-generated or manually edited
    // Format: "programStudi text": "prodi_id"
};

async function executeMigration() {
    console.log('=== EXECUTING DATA MIGRATION ===\n');
    console.log('⚠️  WARNING: This will modify database records!\n');

    // First, get the mapping from analysis
    console.log('Reading mapping...\n');

    // Get all prodi for reference
    const allProdi = await prisma.prodi.findMany();
    const prodiMap = new Map(allProdi.map(p => [p.id, p]));

    // Auto-generate mapping using same logic as analyze
    const autoMapping: Record<string, string> = {};

    // Get unique programStudi values
    const profilesPS = await prisma.profile.findMany({
        where: {
            AND: [
                { programStudi: { not: null } },
                { prodiId: null }
            ]
        },
        select: { programStudi: true },
        distinct: ['programStudi']
    });

    const mkPS = await prisma.mataKuliah.findMany({
        where: {
            AND: [
                { programStudi: { not: null } },
                { prodiId: null }
            ]
        },
        select: { programStudi: true },
        distinct: ['programStudi']
    });

    const allPS = new Set([
        ...profilesPS.map(p => p.programStudi!),
        ...mkPS.map(mk => mk.programStudi!)
    ]);

    // Auto-match
    allPS.forEach(ps => {
        const psClean = ps.replace(/[()]/g, '').trim().toLowerCase();
        const matches = allProdi.filter(prodi => {
            const namaClean = prodi.nama.toLowerCase();
            const kodeClean = (prodi.kode || '').toLowerCase();
            return namaClean.includes(psClean) ||
                psClean.includes(namaClean) ||
                kodeClean.includes(psClean) ||
                psClean.includes(kodeClean);
        });

        if (matches.length > 0) {
            autoMapping[ps] = matches[0].id;
        }
    });

    console.log('Auto-generated mapping:');
    console.log(JSON.stringify(autoMapping, null, 2));
    console.log('');

    const mapping = { ...PRODI_MAPPING, ...autoMapping };

    if (Object.keys(mapping).length === 0) {
        console.log('❌ No mapping found! Please run migration_analyze.ts first.');
        await prisma.$disconnect();
        return;
    }

    console.log(`Found ${Object.keys(mapping).length} mappings\n`);

    // Migration counters
    let profilesUpdated = 0;
    let mkUpdated = 0;
    const errors: string[] = [];

    // Update Profiles
    console.log('1️⃣ Migrating Profiles...');
    for (const [programStudi, prodiId] of Object.entries(mapping)) {
        try {
            const result = await prisma.profile.updateMany({
                where: {
                    AND: [
                        { programStudi },
                        { prodiId: null }
                    ]
                },
                data: { prodiId }
            });

            if (result.count > 0) {
                const prodi = prodiMap.get(prodiId);
                console.log(`  ✅ Updated ${result.count} profiles: "${programStudi}" → ${prodi?.nama}`);
                profilesUpdated += result.count;
            }
        } catch (error) {
            const errMsg = `Failed to update profiles for "${programStudi}": ${error}`;
            console.log(`  ❌ ${errMsg}`);
            errors.push(errMsg);
        }
    }

    // Update Mata Kuliah
    console.log('\n2️⃣ Migrating Mata Kuliah...');
    for (const [programStudi, prodiId] of Object.entries(mapping)) {
        try {
            const result = await prisma.mataKuliah.updateMany({
                where: {
                    AND: [
                        { programStudi },
                        { prodiId: null }
                    ]
                },
                data: { prodiId }
            });

            if (result.count > 0) {
                const prodi = prodiMap.get(prodiId);
                console.log(`  ✅ Updated ${result.count} mata kuliah: "${programStudi}" → ${prodi?.nama}`);
                mkUpdated += result.count;
            }
        } catch (error) {
            const errMsg = `Failed to update mata kuliah for "${programStudi}": ${error}`;
            console.log(`  ❌ ${errMsg}`);
            errors.push(errMsg);
        }
    }

    // Summary
    console.log('\n\n=== MIGRATION SUMMARY ===');
    console.log(`✅ Profiles updated: ${profilesUpdated}`);
    console.log(`✅ Mata Kuliah updated: ${mkUpdated}`);

    if (errors.length > 0) {
        console.log(`\n❌ Errors encountered: ${errors.length}`);
        errors.forEach(err => console.log(`  - ${err}`));
    } else {
        console.log(`\n🎉 Migration completed successfully with no errors!`);
    }

    await prisma.$disconnect();
}

// Safety check - require confirmation
const args = process.argv.slice(2);
if (!args.includes('--confirm')) {
    console.log('⚠️  SAFETY CHECK ⚠️');
    console.log('This script will modify your database.');
    console.log('Please run: npx tsx migration_execute.ts --confirm');
    console.log('\nOr run migration_analyze.ts first to review the changes.');
    process.exit(0);
}

executeMigration().catch(console.error);
