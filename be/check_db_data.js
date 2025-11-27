import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
    try {
        console.log('Checking database data...\n');

        // Check users by role
        const userCount = await prisma.user.count();
        const dosenCount = await prisma.user.count({ where: { role: { role: 'dosen' } } });
        const mhsCount = await prisma.user.count({ where: { role: { role: 'mahasiswa' } } });
        const kaprodiCount = await prisma.user.count({ where: { role: { role: 'kaprodi' } } });

        console.log(`Total Users: ${userCount}`);
        console.log(`- Dosen: ${dosenCount}`);
        console.log(`- Mahasiswa: ${mhsCount}`);
        console.log(`- Kaprodi: ${kaprodiCount}`);

        // Check profiles
        const profileCount = await prisma.profile.count();
        console.log(`Profiles: ${profileCount}`);

        // Check Reference Data
        const fakultasCount = await prisma.fakultas.count();
        const prodiCount = await prisma.prodi.count();
        const mkCount = await prisma.mataKuliah.count();
        const mkPengampuCount = await prisma.mataKuliahPengampu.count();

        // Check Academic Data
        const cplCount = await prisma.cpl.count();
        const cpmkCount = await prisma.cpmk.count();
        const nilaiCpmkCount = await prisma.nilaiCpmk.count();
        const nilaiCplCount = await prisma.nilaiCpl.count();

        console.log(`\nReference Data:`);
        console.log(`- Fakultas: ${fakultasCount}`);
        console.log(`- Prodi: ${prodiCount}`);
        console.log(`- Mata Kuliah: ${mkCount}`);
        console.log(`- Penugasan Dosen (MK Pengampu): ${mkPengampuCount}`);

        console.log(`\nAcademic Data:`);
        console.log(`- CPL: ${cplCount}`);
        console.log(`- CPMK: ${cpmkCount}`);
        console.log(`- Nilai CPMK (Raw): ${nilaiCpmkCount}`);
        console.log(`- Nilai CPL (Transkrip): ${nilaiCplCount}`);

        console.log('\n--- Summary ---');
        if (userCount > 0 && mkCount > 0 && nilaiCpmkCount > 0) {
            console.log('✅ Database populated successfully with dummy data!');
        } else {
            console.log('⚠️ Database might be missing some data.');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
