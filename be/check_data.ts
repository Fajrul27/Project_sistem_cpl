
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- START CHECK ---');

    // Check KaprodiData
    const kaprodiData = await prisma.kaprodiData.findMany();
    console.log(`\n1. KaprodiData (Total: ${kaprodiData.length})`);
    kaprodiData.forEach(k => {
        console.log(`   - Prodi: ${k.programStudi}, Kaprodi: ${k.namaKaprodi}`);
    });

    // Check Profile
    const profiles = await prisma.profile.findMany({
        select: { programStudi: true },
        distinct: ['programStudi'],
        where: { programStudi: { not: null } }
    });
    console.log(`\n2. Profiles (Distinct Program Studi: ${profiles.length})`);
    profiles.forEach(p => {
        console.log(`   - ${p.programStudi}`);
    });

    // Check Settings for Fakultas
    const settings = await prisma.settings.findMany();
    const fakultasSettings = settings.filter(s =>
        s.key.toLowerCase().includes('fakultas') ||
        s.value.toLowerCase().includes('fakultas')
    );

    console.log(`\n3. Settings containing "fakultas" (Found: ${fakultasSettings.length})`);
    fakultasSettings.forEach(s => {
        console.log(`   - Key: ${s.key}, Value: ${s.value}`);
    });

    // Check Settings for Prodi
    const prodiSettings = settings.filter(s =>
        s.key.toLowerCase().includes('prodi') && !s.key.toLowerCase().includes('kaprodi') // Exclude kaprodi keys if we want just prodi names, but let's see
    );
    console.log(`\n4. Other Prodi Settings (Found: ${prodiSettings.length})`);
    prodiSettings.forEach(s => {
        console.log(`   - Key: ${s.key}, Value: ${s.value}`);
    });

    console.log('\n--- END CHECK ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
