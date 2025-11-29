import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDosenFiltering() {
    try {
        // Find dosen bije
        const user = await prisma.user.findFirst({
            where: { email: { contains: 'bije' } }
        });

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log('=== SIMULATING DOSEN FILTER LOGIC ===\n');
        console.log(`User: ${user.email}, ID: ${user.id}\n`);

        const userId = user.id;
        const where: any = { isActive: true };

        // Get profile
        const profile = await prisma.profile.findUnique({
            where: { userId }
        });

        console.log('Profile Data:');
        console.log(`  - prodiId: ${profile?.prodiId || 'NULL'}`);
        console.log(`  - programStudi: ${profile?.programStudi || 'NULL'}\n`);

        const prodiIds = new Set<string>();
        const programStudiLegacy = new Set<string>();

        // Homebase prodi
        if (profile?.prodiId) {
            prodiIds.add(profile.prodiId);
            console.log(`✓ Added homebase prodiId: ${profile.prodiId}`);
        } else if (profile?.programStudi) {
            programStudiLegacy.add(profile.programStudi);
            console.log(`✓ Added legacy programStudi: ${profile.programStudi}`);
        }

        // Teaching assignments
        const teaching = await prisma.mataKuliahPengampu.findMany({
            where: { dosenId: userId },
            include: { mataKuliah: true }
        });

        console.log(`\nTeaching Assignments: ${teaching.length}`);
        teaching.forEach((t, i) => {
            console.log(`  ${i + 1}. ${t.mataKuliah.namaMk}`);
            if (t.mataKuliah.prodiId) {
                prodiIds.add(t.mataKuliah.prodiId);
                console.log(`     ✓ Added prodiId: ${t.mataKuliah.prodiId}`);
            } else if (t.mataKuliah.programStudi) {
                programStudiLegacy.add(t.mataKuliah.programStudi);
                console.log(`     ✓ Added legacy programStudi: ${t.mataKuliah.programStudi}`);
            }
        });

        console.log(`\nCollected ProdiIds: ${prodiIds.size}`);
        console.log(`Collected Legacy ProgramStudi: ${programStudiLegacy.size}`);
        console.log(`  ProdiIds: [${Array.from(prodiIds).join(', ')}]`);
        console.log(`  Legacy: [${Array.from(programStudiLegacy).join(', ')}]`);

        // Build OR conditions
        const orConditions: any[] = [];

        if (prodiIds.size > 0) {
            orConditions.push({ prodiId: { in: Array.from(prodiIds) } });
            console.log(`\n✓ Added OR condition: prodiId IN [${Array.from(prodiIds).join(', ')}]`);
        }

        if (programStudiLegacy.size > 0) {
            const legacyProdiNames = Array.from(programStudiLegacy);
            console.log(`\n✓ Processing legacy names: ${legacyProdiNames.join(', ')}`);

            // Find matching prodis
            const matchingProdis = await prisma.prodi.findMany({
                where: {
                    OR: legacyProdiNames.map(name => ({
                        OR: [
                            { nama: { contains: name.replace(/[()]/g, '').trim() } },
                            { kode: { contains: name.replace(/[()]/g, '').trim() } }
                        ]
                    }))
                }
            });

            console.log(`  Found ${matchingProdis.length} matching prodis:`);
            matchingProdis.forEach(p => {
                console.log(`    - ${p.nama} (${p.kode}) - ID: ${p.id}`);
            });

            if (matchingProdis.length > 0) {
                const matchingProdiIds = matchingProdis.map(p => p.id);
                orConditions.push({ prodiId: { in: matchingProdiIds } });
                console.log(`  ✓ Added OR condition: prodiId IN [${matchingProdiIds.join(', ')}]`);
            }

            orConditions.push({ prodiId: null });
            console.log(`  ✓ Added OR condition: prodiId IS NULL`);
        }

        if (orConditions.length > 0) {
            where.OR = orConditions;
        }

        console.log(`\n=== FINAL WHERE CLAUSE ===`);
        console.log(JSON.stringify(where, null, 2));

        // Execute query
        const cpl = await prisma.cpl.findMany({
            where,
            include: {
                kategoriRef: true,
                prodi: true
            },
            orderBy: { kodeCpl: 'asc' }
        });

        console.log(`\n=== RESULTS ===`);
        console.log(`Total CPL Found: ${cpl.length}\n`);

        if (cpl.length > 0) {
            cpl.forEach((c, i) => {
                console.log(`${i + 1}. ${c.kodeCpl} - ${c.deskripsi.substring(0, 60)}...`);
                console.log(`   ProdiId: ${c.prodiId || 'NULL'}`);
                console.log(`   Prodi: ${c.prodi?.nama || 'N/A'}`);
            });
        } else {
            console.log('❌ No CPL found with current filtering logic');

            // Check how many CPL exist in total
            const totalCpl = await prisma.cpl.count({ where: { isActive: true } });
            console.log(`\nTotal active CPL in database: ${totalCpl}`);

            const cplWithProdi = await prisma.cpl.count({
                where: { isActive: true, prodiId: { not: null } }
            });
            console.log(`CPL with prodiId: ${cplWithProdi}`);
            console.log(`CPL without prodiId: ${totalCpl - cplWithProdi}`);
        }

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        await prisma.$disconnect();
    }
}

testDosenFiltering();
