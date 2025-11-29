import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugBije() {
    try {
        console.log('=== Debugging Dosen Bije ===\n');

        // 1. Cek user bije
        const user = await prisma.user.findFirst({
            where: { email: { contains: 'bije' } },
            include: { role: true, profile: true }
        });

        console.log('1. User Bije:');
        console.log(JSON.stringify(user, null, 2));

        if (!user) {
            console.log('User bije tidak ditemukan!');
            return;
        }

        // 2. Cek profile
        const profile = await prisma.profile.findUnique({
            where: { userId: user.id },
            include: { prodi: true }
        });

        console.log('\n2. Profile Bije:');
        console.log(JSON.stringify(profile, null, 2));

        // 3. Cek mata kuliah yang diampu
        const teaching = await prisma.mataKuliahPengampu.findMany({
            where: { dosenId: user.id },
            include: {
                mataKuliah: {
                    include: { prodi: true }
                }
            }
        });

        console.log('\n3. Mata Kuliah yang Diampu:');
        console.log(JSON.stringify(teaching, null, 2));

        // 4. Cek prodi MTK
        const prodiMtk = await prisma.prodi.findMany({
            where: {
                OR: [
                    { nama: { contains: 'Matematika' } },
                    { kode: { contains: 'MTK' } }
                ]
            }
        });

        console.log('\n4. Prodi MTK:');
        console.log(JSON.stringify(prodiMtk, null, 2));

        // 5. Cek CPL dari prodi MTK
        if (prodiMtk.length > 0) {
            const cplMtk = await prisma.cpl.findMany({
                where: {
                    isActive: true,
                    prodiId: { in: prodiMtk.map(p => p.id) }
                },
                include: { prodi: true }
            });

            console.log('\n5. CPL Prodi MTK:');
            console.log(JSON.stringify(cplMtk, null, 2));
        }

        // 6. Simulate logic filtering untuk dosen
        console.log('\n6. Simulasi Logic Filtering:');
        const prodiIds = new Set<string>();
        if (profile?.prodiId) {
            prodiIds.add(profile.prodiId);
            console.log(`  - Homebase ProdiId: ${profile.prodiId}`);
        }

        teaching.forEach(t => {
            if (t.mataKuliah.prodiId) {
                prodiIds.add(t.mataKuliah.prodiId);
                console.log(`  - Teaching ProdiId: ${t.mataKuliah.prodiId} (${t.mataKuliah.namaMk})`);
            }
        });

        console.log(`\n  Total Prodi IDs yang akan difilter: ${prodiIds.size}`);
        console.log(`  ProdiIds: ${Array.from(prodiIds).join(', ')}`);

        if (prodiIds.size > 0) {
            const filteredCpl = await prisma.cpl.findMany({
                where: {
                    isActive: true,
                    prodiId: { in: Array.from(prodiIds) }
                },
                include: { prodi: true }
            });

            console.log(`\n  CPL yang akan ditampilkan untuk dosen: ${filteredCpl.length}`);
            filteredCpl.forEach(cpl => {
                console.log(`    - ${cpl.kodeCpl}: ${cpl.deskripsi.substring(0, 50)}... (Prodi: ${cpl.prodi?.nama || 'N/A'})`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugBije();
