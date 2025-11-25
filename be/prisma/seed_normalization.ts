
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING NORMALIZATION MIGRATION ---');

    // 1. Seed Fakultas & Prodi from Profile data
    console.log('\n1. Migrating Fakultas & Prodi...');
    const profiles = await prisma.profile.findMany({
        where: { programStudi: { not: null } },
        select: { id: true, programStudi: true }
    });

    const uniqueProdiStrings = [...new Set(profiles.map(p => p.programStudi).filter(Boolean))];

    for (const prodiString of uniqueProdiStrings) {
        if (!prodiString) continue;

        // Expected format: "Fakultas [NamaFakultas] ([KodeFakultas]) - [NamaProdi] ([KodeProdi?])"
        // Or just "[NamaProdi]"

        let namaFakultas = 'Fakultas Umum';
        let kodeFakultas = 'UMUM';
        let namaProdi = prodiString;
        let kodeProdi = null;

        // Try to parse "Fakultas ... (...) - ..."
        const fakultasMatch = prodiString.match(/Fakultas\s+(.+?)\s+\((.+?)\)\s+-\s+(.+)/);
        if (fakultasMatch) {
            namaFakultas = `Fakultas ${fakultasMatch[1]}`;
            kodeFakultas = fakultasMatch[2];
            namaProdi = fakultasMatch[3];
        } else {
            // Try to handle "Teknik Informatika" -> Fakultas Teknik / FTI default? 
            // For now, let's put them in a "Unassigned" faculty or try to guess.
            // Based on previous check: "Teknik Informatika" exists.
            if (prodiString.toLowerCase().includes('informatika')) {
                namaFakultas = 'Fakultas Teknologi Industri';
                kodeFakultas = 'FTI';
            }
        }

        // Create/Get Fakultas
        const fakultas = await prisma.fakultas.upsert({
            where: { kode: kodeFakultas },
            update: {},
            create: {
                nama: namaFakultas,
                kode: kodeFakultas
            }
        });

        // Create/Get Prodi
        const prodi = await prisma.prodi.upsert({
            where: { nama: namaProdi },
            update: {},
            create: {
                nama: namaProdi,
                fakultasId: fakultas.id
            }
        });

        console.log(`   Processed: ${prodiString} -> ${namaFakultas} / ${namaProdi}`);
    }

    // 2. Link Profiles to Prodi & Fakultas
    console.log('\n2. Linking Profiles...');
    for (const profile of profiles) {
        if (!profile.programStudi) continue;

        // Find the prodi we just created
        // We need to re-parse logic or just search by name part
        // Simpler: search prodi where name is part of the string or exact match
        // But we split the string above. 
        // Let's re-use the parsing logic or fetch all prodis and match.

        let targetProdiName = profile.programStudi;
        const fakultasMatch = profile.programStudi.match(/Fakultas\s+(.+?)\s+\((.+?)\)\s+-\s+(.+)/);
        if (fakultasMatch) {
            targetProdiName = fakultasMatch[3];
        }

        const prodi = await prisma.prodi.findUnique({ where: { nama: targetProdiName } });
        if (prodi) {
            await prisma.profile.update({
                where: { id: profile.id },
                data: {
                    prodiId: prodi.id,
                    fakultasId: prodi.fakultasId
                }
            });
        }
    }

    // 3. Link KaprodiData
    console.log('\n3. Linking KaprodiData...');
    const kaprodiData = await prisma.kaprodiData.findMany();
    for (const kd of kaprodiData) {
        // Kaprodi data might be uppercase "TEKNIK INFORMATIKA"
        // Try to find case-insensitive
        const prodi = await prisma.prodi.findFirst({
            where: {
                nama: kd.programStudi
            }
        });

        if (prodi) {
            await prisma.kaprodiData.update({
                where: { id: kd.id },
                data: { prodiId: prodi.id }
            });
            console.log(`   Linked Kaprodi ${kd.namaKaprodi} to ${prodi.nama}`);
        } else {
            console.log(`   WARNING: Could not find prodi for KaprodiData: ${kd.programStudi}`);
        }
    }

    // 4. Seed KategoriCpl
    console.log('\n4. Seeding KategoriCpl...');
    const categories = ['Sikap', 'Pengetahuan', 'Keterampilan Umum', 'Keterampilan Khusus'];
    for (const cat of categories) {
        await prisma.kategoriCpl.upsert({
            where: { nama: cat },
            update: {},
            create: { nama: cat }
        });
    }

    // Link Cpl to KategoriCpl
    const cpls = await prisma.cpl.findMany();
    for (const cpl of cpls) {
        if (cpl.kategori) {
            const cat = await prisma.kategoriCpl.findUnique({ where: { nama: cpl.kategori } });
            if (cat) {
                await prisma.cpl.update({
                    where: { id: cpl.id },
                    data: { kategoriId: cat.id }
                });
            }
        }
    }

    // 5. Seed LevelTaksonomi
    console.log('\n5. Seeding LevelTaksonomi...');
    const levels = [
        { kode: 'C1', deskripsi: 'Mengingat', kategori: 'Kognitif' },
        { kode: 'C2', deskripsi: 'Memahami', kategori: 'Kognitif' },
        { kode: 'C3', deskripsi: 'Menerapkan', kategori: 'Kognitif' },
        { kode: 'C4', deskripsi: 'Menganalisis', kategori: 'Kognitif' },
        { kode: 'C5', deskripsi: 'Mengevaluasi', kategori: 'Kognitif' },
        { kode: 'C6', deskripsi: 'Mencipta', kategori: 'Kognitif' },
        { kode: 'A1', deskripsi: 'Menerima', kategori: 'Afektif' },
        { kode: 'A2', deskripsi: 'Merespon', kategori: 'Afektif' },
        { kode: 'A3', deskripsi: 'Menghargai', kategori: 'Afektif' },
        { kode: 'A4', deskripsi: 'Mengorganisasikan', kategori: 'Afektif' },
        { kode: 'A5', deskripsi: 'Karakterisasi', kategori: 'Afektif' },
        { kode: 'P1', deskripsi: 'Meniru', kategori: 'Psikomotorik' },
        { kode: 'P2', deskripsi: 'Manipulasi', kategori: 'Psikomotorik' },
        { kode: 'P3', deskripsi: 'Presisi', kategori: 'Psikomotorik' },
        { kode: 'P4', deskripsi: 'Artikulasi', kategori: 'Psikomotorik' },
        { kode: 'P5', deskripsi: 'Naturalisasi', kategori: 'Psikomotorik' },
    ];

    for (const lvl of levels) {
        await prisma.levelTaksonomi.upsert({
            where: { kode: lvl.kode },
            update: {},
            create: lvl
        });
    }

    // Link Cpmk to LevelTaksonomi
    const cpmks = await prisma.cpmk.findMany();
    for (const cpmk of cpmks) {
        if (cpmk.levelTaksonomi) {
            const lvl = await prisma.levelTaksonomi.findUnique({ where: { kode: cpmk.levelTaksonomi } });
            if (lvl) {
                await prisma.cpmk.update({
                    where: { id: cpmk.id },
                    data: { levelTaksonomiId: lvl.id }
                });
            }
        }
    }

    // 6. Seed TeknikPenilaianRef
    console.log('\n6. Seeding TeknikPenilaianRef...');
    const teknikNames = await prisma.teknikPenilaian.groupBy({ by: ['namaTeknik'] });
    for (const t of teknikNames) {
        const ref = await prisma.teknikPenilaianRef.upsert({
            where: { nama: t.namaTeknik },
            update: {},
            create: { nama: t.namaTeknik }
        });
    }

    // Link TeknikPenilaian
    const tekniks = await prisma.teknikPenilaian.findMany();
    for (const t of tekniks) {
        const ref = await prisma.teknikPenilaianRef.findUnique({ where: { nama: t.namaTeknik } });
        if (ref) {
            await prisma.teknikPenilaian.update({
                where: { id: t.id },
                data: { teknikRefId: ref.id }
            });
        }
    }

    // 7. Seed Kurikulum & JenisMataKuliah (Defaults)
    console.log('\n7. Seeding Kurikulum & JenisMataKuliah...');
    const kurikulum = await prisma.kurikulum.upsert({
        where: { nama: 'Kurikulum 2024' },
        update: {},
        create: { nama: 'Kurikulum 2024', tahunMulai: 2024, isActive: true }
    });

    const jenisWajib = await prisma.jenisMataKuliah.upsert({
        where: { nama: 'Wajib' },
        update: {},
        create: { nama: 'Wajib' }
    });

    // Link all MKs to default Kurikulum & Jenis for now
    await prisma.mataKuliah.updateMany({
        data: {
            kurikulumId: kurikulum.id,
            jenisMkId: jenisWajib.id
        }
    });

    console.log('\n--- MIGRATION COMPLETED ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
