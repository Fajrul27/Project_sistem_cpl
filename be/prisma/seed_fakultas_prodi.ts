import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFakultasProdi() {
    console.log('🌱 Seeding Fakultas dan Program Studi UNUGHA...\n');

    try {
        // Data Fakultas & Prodi
        const fakultasData = [
            {
                nama: 'Fakultas Keguruan dan Ilmu Pendidikan',
                kode: 'FKIP',
                prodi: [
                    { nama: 'Bimbingan & Konseling', kode: 'BK', jenjang: 'S1' },
                    { nama: 'Pendidikan Guru Sekolah Dasar', kode: 'PGSD', jenjang: 'S1' },
                    { nama: 'Pendidikan Islam Anak Usia Dini', kode: 'PIAUD', jenjang: 'S1' },
                    { nama: 'Manajemen Pendidikan Islam', kode: 'MPI', jenjang: 'S1' },
                ]
            },
            {
                nama: 'Fakultas Matematika dan Ilmu Komputer',
                kode: 'FMIKOM',
                prodi: [
                    { nama: 'Matematika', kode: 'MAT', jenjang: 'S1' },
                    { nama: 'Informatika', kode: 'INF', jenjang: 'S1' },
                    { nama: 'Sistem Informasi', kode: 'SI', jenjang: 'S1' },
                ]
            },
            {
                nama: 'Fakultas Teknologi Industri',
                kode: 'FTI',
                prodi: [
                    { nama: 'Teknik Industri', kode: 'TIND', jenjang: 'S1' },
                    { nama: 'Teknik Kimia', kode: 'TKIM', jenjang: 'S1' },
                    { nama: 'Teknik Mesin', kode: 'TM', jenjang: 'S1' },
                ]
            },
            {
                nama: 'Fakultas Ekonomi',
                kode: 'FE',
                prodi: [
                    { nama: 'Manajemen', kode: 'MAN', jenjang: 'S1' },
                    { nama: 'Ekonomi Pembangunan', kode: 'EP', jenjang: 'S1' },
                ]
            },
            {
                nama: 'Fakultas Keagamaan Islam',
                kode: 'FKI',
                prodi: [
                    { nama: 'Pendidikan Agama Islam', kode: 'PAI', jenjang: 'S1' },
                    { nama: 'Pendidikan Guru Madrasah Ibtidaiyah', kode: 'PGMI', jenjang: 'S1' },
                    { nama: 'Komunikasi & Penyiaran Islam', kode: 'KPI', jenjang: 'S1' },
                    { nama: 'Ahwal al-Syakhshiyah', kode: 'AS', jenjang: 'S1' },
                ]
            }
        ];

        let totalFakultas = 0;
        let totalProdi = 0;

        // Insert Fakultas dan Prodi
        for (const fakultas of fakultasData) {
            console.log(`\n📚 Creating Fakultas: ${fakultas.nama} (${fakultas.kode})`);

            const createdFakultas = await prisma.fakultas.create({
                data: {
                    nama: fakultas.nama,
                    kode: fakultas.kode,
                }
            });

            totalFakultas++;
            console.log(`   ✅ Created: ${createdFakultas.nama}`);

            // Insert Prodi untuk fakultas ini
            for (const prodi of fakultas.prodi) {
                const createdProdi = await prisma.prodi.create({
                    data: {
                        fakultasId: createdFakultas.id,
                        nama: prodi.nama,
                        kode: prodi.kode,
                        jenjang: prodi.jenjang,
                    }
                });

                totalProdi++;
                console.log(`   └─ Prodi: ${prodi.kode} - ${prodi.nama}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Seeding Complete!');
        console.log(`   Total Fakultas: ${totalFakultas}`);
        console.log(`   Total Prodi: ${totalProdi}`);
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the seed
seedFakultasProdi()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
