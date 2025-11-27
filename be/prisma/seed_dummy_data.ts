import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to generate random string
const randomString = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Helper to get random item from array
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random number
const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Names for generation
const firstNames = [
    'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko',
    'Kartika', 'Lestari', 'Muhammad', 'Nur', 'Oki', 'Putri', 'Qori', 'Rina', 'Siti', 'Tono',
    'Umar', 'Vina', 'Wahyu', 'Xena', 'Yudi', 'Zainal', 'Adi', 'Bayu', 'Candra', 'Dian',
    'Faisal', 'Gilang', 'Hendra', 'Irfan', 'Jaya', 'Kurnia', 'Lina', 'Maulana', 'Nanda', 'Olivia'
];

const lastNames = [
    'Saputra', 'Wibowo', 'Lestari', 'Kusuma', 'Pratama', 'Santoso', 'Hidayat', 'Nugroho', 'Pertiwi', 'Wijaya',
    'Ramadhan', 'Kurniawan', 'Setiawan', 'Utami', 'Mulyani', 'Rahayu', 'Susanti', 'Handayani', 'Sari', 'Putra',
    'Firmansyah', 'Aditya', 'Pradana', 'Kusumawardhani', 'Anggraini', 'Permata', 'Dewi', 'Suryana', 'Wahyudi', 'Irawan'
];

const generateName = () => `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;

async function seedDummyData() {
    console.log('🌱 Starting Dummy Data Generation (Target: ~1000 Users)...\n');

    try {
        // 1. Ensure Reference Data Exists
        console.log('📦 Checking/Creating Reference Data...');

        // Tahun Ajaran
        const tahunAjaran = await prisma.tahunAjaran.upsert({
            where: { nama: '2024/2025 Ganjil' },
            update: { isActive: true },
            create: { nama: '2024/2025 Ganjil', isActive: true }
        });
        console.log(`   ✅ Tahun Ajaran: ${tahunAjaran.nama}`);

        // Kurikulum
        const kurikulum = await prisma.kurikulum.upsert({
            where: { nama: 'Kurikulum MBKM 2024' },
            update: { isActive: true },
            create: { nama: 'Kurikulum MBKM 2024', tahunMulai: 2024, isActive: true }
        });
        console.log(`   ✅ Kurikulum: ${kurikulum.nama}`);

        // Jenis Mata Kuliah
        const jenisMkNames = ['Wajib', 'Pilihan', 'Wajib Fakultas'];
        const jenisMkMap = new Map();
        for (const name of jenisMkNames) {
            const jmk = await prisma.jenisMataKuliah.upsert({
                where: { nama: name },
                update: {},
                create: { nama: name }
            });
            jenisMkMap.set(name, jmk.id);
        }
        console.log(`   ✅ Jenis MK: ${jenisMkNames.join(', ')}`);

        // 2. Fetch Fakultas & Prodi
        const fakultasList = await prisma.fakultas.findMany({
            include: { prodi: true }
        });

        if (fakultasList.length === 0) {
            throw new Error('❌ No Fakultas found! Please run seed_fakultas_prodi.ts first.');
        }

        const allProdis = fakultasList.flatMap(f => f.prodi);
        console.log(`   ✅ Loaded ${fakultasList.length} Fakultas and ${allProdis.length} Prodi.`);

        // 3. Generate Users & Data
        const passwordHash = await bcrypt.hash('123456', 10); // Default password
        let totalUsers = 0;
        let totalDosen = 0;
        let totalMhs = 0;
        let totalKaprodi = 0;

        for (const prodi of allProdis) {
            const prodiKode = prodi.kode || 'UNKNOWN';
            console.log(`\n🏫 Processing Prodi: ${prodi.nama} (${prodiKode})...`);

            // --- A. Generate Mata Kuliah ---
            const existingMkCount = await prisma.mataKuliah.count({ where: { prodiId: prodi.id } });
            if (existingMkCount < 15) {
                const mkToCreate = 15 - existingMkCount;
                console.log(`   📘 Generating ${mkToCreate} Mata Kuliah...`);

                const mkPrefixes = ['Pengantar', 'Dasar', 'Lanjut', 'Teori', 'Praktikum', 'Manajemen', 'Sistem', 'Analisis'];
                const mkSuffixes = ['Data', 'Informasi', 'Industri', 'Pendidikan', 'Islam', 'Ekonomi', 'Bisnis', 'Komputer', 'Jaringan', 'Software'];

                for (let i = 0; i < mkToCreate; i++) {
                    const mkName = `${getRandomItem(mkPrefixes)} ${getRandomItem(mkSuffixes)} ${randomString(3)}`;
                    const semester = randomNumber(1, 8);

                    await prisma.mataKuliah.create({
                        data: {
                            kodeMk: `${prodiKode}-${semester}${randomNumber(100, 999)}`,
                            namaMk: mkName,
                            sks: randomNumber(2, 4),
                            semester: semester,
                            prodiId: prodi.id,
                            kurikulumId: kurikulum.id,
                            jenisMkId: getRandomItem(Array.from(jenisMkMap.values())),
                            isActive: true
                        }
                    });
                }
            }

            const prodiMataKuliah = await prisma.mataKuliah.findMany({ where: { prodiId: prodi.id } });

            // --- B. Generate Kaprodi (1 per Prodi) ---
            const kaprodiEmail = `kaprodi_${prodiKode.toLowerCase()}@unugha.ac.id`;
            const existingKaprodi = await prisma.user.findUnique({ where: { email: kaprodiEmail } });

            if (!existingKaprodi) {
                const kaprodiUser = await prisma.user.create({
                    data: {
                        email: kaprodiEmail,
                        passwordHash,
                        isActive: true,
                        emailVerified: true,
                        role: { create: { role: 'kaprodi' } },
                        profile: {
                            create: {
                                namaLengkap: `Kaprodi ${prodi.nama}`,
                                nip: `198${randomNumber(0, 9)}01${randomNumber(1000, 9999)}`,
                                nidn: `06${randomNumber(10000000, 99999999)}`,
                                fakultasId: prodi.fakultasId,
                                prodiId: prodi.id,
                                programStudi: prodi.nama
                            }
                        }
                    },
                    include: { profile: true }
                });

                // Create KaprodiData
                if (kaprodiUser.profile) {
                    await prisma.kaprodiData.upsert({
                        where: { prodiId: prodi.id },
                        update: {},
                        create: {
                            prodiId: prodi.id,
                            programStudi: prodi.nama,
                            namaKaprodi: kaprodiUser.profile.namaLengkap || 'Kaprodi',
                            nidnKaprodi: kaprodiUser.profile.nidn || ''
                        }
                    });
                }
                totalKaprodi++;
                totalUsers++;
            }

            // --- C. Generate Dosen (~3-5 per Prodi) ---
            const dosenPerProdi = randomNumber(3, 5);
            const dosenIds: string[] = [];

            for (let i = 0; i < dosenPerProdi; i++) {
                const email = `dosen${i + 1}_${prodiKode.toLowerCase()}@unugha.ac.id`;
                const existing = await prisma.user.findUnique({ where: { email } });

                let dosenId = existing?.id;

                if (!existing) {
                    const user = await prisma.user.create({
                        data: {
                            email,
                            passwordHash,
                            isActive: true,
                            emailVerified: true,
                            role: { create: { role: 'dosen' } },
                            profile: {
                                create: {
                                    namaLengkap: `Dosen ${generateName()}`,
                                    nip: `199${randomNumber(0, 9)}01${randomNumber(1000, 9999)}`,
                                    nidn: `07${randomNumber(10000000, 99999999)}`,
                                    fakultasId: prodi.fakultasId,
                                    prodiId: prodi.id,
                                    programStudi: prodi.nama
                                }
                            }
                        }
                    });
                    dosenId = user.id;
                    totalDosen++;
                    totalUsers++;
                }
                if (dosenId) dosenIds.push(dosenId);
            }

            // Assign Dosen to MK
            if (dosenIds.length > 0 && prodiMataKuliah.length > 0) {
                for (const mk of prodiMataKuliah) {
                    const randomDosenId = getRandomItem(dosenIds);
                    await prisma.mataKuliahPengampu.upsert({
                        where: {
                            mataKuliahId_dosenId: {
                                mataKuliahId: mk.id,
                                dosenId: randomDosenId
                            }
                        },
                        update: {},
                        create: {
                            mataKuliahId: mk.id,
                            dosenId: randomDosenId,
                            isPengampu: true
                        }
                    });
                }
            }

            // --- D. Generate Mahasiswa (~50 per Prodi) ---
            // Total target ~1000 users / ~16 prodis = ~60 mhs per prodi
            const mhsPerProdi = 60;

            for (let i = 0; i < mhsPerProdi; i++) {
                const angkatan = getRandomItem([2021, 2022, 2023, 2024]);
                const semester = (2024 - angkatan) * 2 + 1; // Ganjil
                const nim = `${String(angkatan).slice(2)}${prodiKode}${String(i + 1).padStart(4, '0')}`;
                const email = `mhs${i + 1}_${prodiKode.toLowerCase()}_${angkatan}@unugha.ac.id`;

                const existing = await prisma.user.findUnique({ where: { email } });

                if (!existing) {
                    await prisma.user.create({
                        data: {
                            email,
                            passwordHash,
                            isActive: true,
                            emailVerified: true,
                            role: { create: { role: 'mahasiswa' } },
                            profile: {
                                create: {
                                    namaLengkap: generateName(),
                                    nim: nim,
                                    fakultasId: prodi.fakultasId,
                                    prodiId: prodi.id,
                                    programStudi: prodi.nama,
                                    semester: semester,
                                    tahunMasuk: angkatan
                                }
                            }
                        }
                    });
                    totalMhs++;
                    totalUsers++;
                }
            }
            console.log(`   ✅ Created ${dosenPerProdi} Dosen, 1 Kaprodi, ${mhsPerProdi} Mahasiswa.`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Dummy Data Generation Complete!');
        console.log(`   Total Users Created: ${totalUsers}`);
        console.log(`   - Kaprodi: ${totalKaprodi}`);
        console.log(`   - Dosen: ${totalDosen}`);
        console.log(`   - Mahasiswa: ${totalMhs}`);
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error seeding dummy data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedDummyData();
