import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * STEP 1: Analyze and create mapping
 * This script will analyze current data and suggest mappings
 */

async function analyzeData() {
    console.log('=== DATA MIGRATION ANALYSIS ===\n');

    // Get all prodi
    const allProdi = await prisma.prodi.findMany({
        select: { id: true, nama: true, kode: true }
    });

    console.log(`📊 Total Prodi in database: ${allProdi.length}\n`);
    console.log('Available Prodi:');
    allProdi.forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.nama} (${p.kode || 'no code'}) - ID: ${p.id}`);
    });

    // Get profiles with programStudi but no prodiId
    const profilesNeedMigration = await prisma.profile.findMany({
        where: {
            AND: [
                { programStudi: { not: null } },
                { prodiId: null }
            ]
        },
        select: {
            userId: true,
            namaLengkap: true,
            programStudi: true,
            prodiId: true
        }
    });

    console.log(`\n👤 Profiles needing migration: ${profilesNeedMigration.length}`);

    // Group by programStudi
    const programStudiGroups = new Map<string, number>();
    profilesNeedMigration.forEach(p => {
        const ps = p.programStudi || 'NULL';
        programStudiGroups.set(ps, (programStudiGroups.get(ps) || 0) + 1);
    });

    console.log('\nGrouped by programStudi:');
    programStudiGroups.forEach((count, ps) => {
        console.log(`  - "${ps}": ${count} profiles`);
    });

    // Get mata kuliah with programStudi but no prodiId
    const mkNeedMigration = await prisma.mataKuliah.findMany({
        where: {
            AND: [
                { programStudi: { not: null } },
                { prodiId: null }
            ]
        },
        select: {
            id: true,
            namaMk: true,
            programStudi: true,
            prodiId: true
        }
    });

    console.log(`\n📚 Mata Kuliah needing migration: ${mkNeedMigration.length}`);

    const mkProgramStudiGroups = new Map<string, number>();
    mkNeedMigration.forEach(mk => {
        const ps = mk.programStudi || 'NULL';
        mkProgramStudiGroups.set(ps, (mkProgramStudiGroups.get(ps) || 0) + 1);
    });

    console.log('\nGrouped by programStudi:');
    mkProgramStudiGroups.forEach((count, ps) => {
        console.log(`  - "${ps}": ${count} mata kuliah`);
    });

    // Suggest automatic mapping
    console.log('\n\n=== SUGGESTED AUTOMATIC MAPPING ===\n');

    const allProgramStudi = new Set([
        ...Array.from(programStudiGroups.keys()),
        ...Array.from(mkProgramStudiGroups.keys())
    ]);

    const suggestions: { programStudi: string; matchedProdi: any; confidence: string }[] = [];

    allProgramStudi.forEach(ps => {
        // Try to find matching prodi
        const matches = allProdi.filter(prodi => {
            const psClean = ps.replace(/[()]/g, '').trim().toLowerCase();
            const namaClean = prodi.nama.toLowerCase();
            const kodeClean = (prodi.kode || '').toLowerCase();

            // Check if programStudi contains prodi name or code
            return namaClean.includes(psClean) ||
                psClean.includes(namaClean) ||
                kodeClean.includes(psClean) ||
                psClean.includes(kodeClean);
        });

        if (matches.length === 1) {
            suggestions.push({
                programStudi: ps,
                matchedProdi: matches[0],
                confidence: 'HIGH'
            });
            console.log(`✅ "${ps}" → ${matches[0].nama} (${matches[0].kode})`);
            console.log(`   Confidence: HIGH | ID: ${matches[0].id}\n`);
        } else if (matches.length > 1) {
            suggestions.push({
                programStudi: ps,
                matchedProdi: matches[0],
                confidence: 'MEDIUM'
            });
            console.log(`⚠️  "${ps}" → Multiple matches found:`);
            matches.forEach(m => {
                console.log(`   - ${m.nama} (${m.kode}) - ID: ${m.id}`);
            });
            console.log(`   Suggested: ${matches[0].nama} (first match)\n`);
        } else {
            suggestions.push({
                programStudi: ps,
                matchedProdi: null,
                confidence: 'NONE'
            });
            console.log(`❌ "${ps}" → No match found`);
            console.log(`   ACTION REQUIRED: Manual mapping needed\n`);
        }
    });

    // Generate mapping file
    const mapping: Record<string, string> = {};
    suggestions.forEach(s => {
        if (s.matchedProdi) {
            mapping[s.programStudi] = s.matchedProdi.id;
        }
    });

    console.log('\n=== GENERATED MAPPING ===');
    console.log(JSON.stringify(mapping, null, 2));

    await prisma.$disconnect();

    return {
        profilesCount: profilesNeedMigration.length,
        mkCount: mkNeedMigration.length,
        mapping,
        suggestions
    };
}

analyzeData()
    .then(result => {
        console.log('\n\n=== SUMMARY ===');
        console.log(`Profiles to migrate: ${result.profilesCount}`);
        console.log(`Mata Kuliah to migrate: ${result.mkCount}`);
        console.log(`Automatic mappings found: ${Object.keys(result.mapping).length}`);
        console.log(`\n✅ Analysis complete!`);
        console.log(`\nNext step: Review the mapping above.`);
        console.log(`If correct, run: npx tsx migration_execute.ts`);
    })
    .catch(console.error);
