
import { PrismaClient } from '@prisma/client';
import { calculateNilaiCpmk } from '../server/lib/calculation';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding transcript for Ahmad Fajrul Ulum...');

    // 1. Find User
    const userProfile = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: 'Fajrul' } },
        include: { user: true }
    });

    if (!userProfile) {
        console.error('User Ahmad Fajrul Ulum not found!');
        return;
    }

    const userId = userProfile.userId;
    console.log(`Found User: ${userProfile.namaLengkap} (${userId})`);

    // 2. Get Mata Kuliah (Take 8 for variety)
    const mataKuliahList = await prisma.mataKuliah.findMany({
        take: 8,
        orderBy: { semester: 'asc' }
    });

    console.log(`Found ${mataKuliahList.length} Mata Kuliah to grade.`);

    for (const mk of mataKuliahList) {
        console.log(`Processing MK: ${mk.namaMk} (${mk.kodeMk}) - Sem ${mk.semester}`);

        // 3. Ensure CPMK exists
        let cpmks = await prisma.cpmk.findMany({
            where: { mataKuliahId: mk.id }
        });

        if (cpmks.length === 0) {
            console.log(`  - No CPMK found, creating dummy CPMKs...`);
            // Create 2 CPMKs
            for (let i = 1; i <= 2; i++) {
                await prisma.cpmk.create({
                    data: {
                        kodeCpmk: `CPMK-${mk.kodeMk}-${i}`,
                        deskripsi: `Capaian Pembelajaran Mata Kuliah ${i} untuk ${mk.namaMk}`,
                        mataKuliahId: mk.id,
                        createdBy: userId // Self-created for seed simplicity
                    }
                });
            }
            // Refetch
            cpmks = await prisma.cpmk.findMany({ where: { mataKuliahId: mk.id } });
        }

        // 4. Process each CPMK
        for (const cpmk of cpmks) {
            // Ensure Teknik Penilaian exists
            let tekniks = await prisma.teknikPenilaian.findMany({
                where: { cpmkId: cpmk.id }
            });

            if (tekniks.length === 0) {
                console.log(`  - No Teknik Penilaian for ${cpmk.kodeCpmk}, creating...`);
                // Create 2 Teknik: Tugas (50%) and UAS (50%)
                await prisma.teknikPenilaian.create({
                    data: {
                        cpmkId: cpmk.id,
                        namaTeknik: 'Tugas',
                        bobotPersentase: 50,
                        deskripsi: 'Tugas Harian'
                    }
                });
                await prisma.teknikPenilaian.create({
                    data: {
                        cpmkId: cpmk.id,
                        namaTeknik: 'UAS',
                        bobotPersentase: 50,
                        deskripsi: 'Ujian Akhir Semester'
                    }
                });
                // Refetch
                tekniks = await prisma.teknikPenilaian.findMany({ where: { cpmkId: cpmk.id } });
            }

            // 5. Insert Grades (Nilai)
            for (const teknik of tekniks) {
                // Generate random score between 70 and 95
                const score = Math.floor(Math.random() * (95 - 70 + 1)) + 70;

                console.log(`    - Grading ${teknik.namaTeknik}: ${score}`);

                await prisma.nilaiTeknikPenilaian.upsert({
                    where: {
                        mahasiswaId_teknikPenilaianId_semester_tahunAjaran: {
                            mahasiswaId: userId,
                            teknikPenilaianId: teknik.id,
                            semester: mk.semester,
                            tahunAjaran: '2024/2025'
                        }
                    },
                    update: {
                        nilai: score,
                        updatedAt: new Date()
                    },
                    create: {
                        mahasiswaId: userId,
                        teknikPenilaianId: teknik.id,
                        mataKuliahId: mk.id,
                        nilai: score,
                        semester: mk.semester,
                        tahunAjaran: '2024/2025',
                        createdBy: userId
                    }
                });
            }

            // 6. Trigger Calculation
            console.log(`    - Calculating CPMK & CPL...`);
            await calculateNilaiCpmk(userId, cpmk.id, mk.id, mk.semester, '2024/2025');
        }
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
