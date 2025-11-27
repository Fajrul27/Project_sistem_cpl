import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get random item
const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to generate random number
const randomNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to generate random decimal
const randomDecimal = (min: number, max: number) => (Math.random() * (max - min) + min).toFixed(2);

async function seedAcademicData() {
    console.log('🌱 Starting Academic Data Generation (CPL, CPMK, Grades)...\n');

    try {
        // 1. Fetch Prerequisites
        const prodis = await prisma.prodi.findMany({
            include: {
                mataKuliah: true,
                kaprodiData: true
            }
        });

        const tahunAjaran = await prisma.tahunAjaran.findFirst({ where: { isActive: true } });
        if (!tahunAjaran) throw new Error('No active Tahun Ajaran found');

        let totalCpl = 0;
        let totalCpmk = 0;
        let totalNilai = 0;

        for (const prodi of prodis) {
            console.log(`\n🏫 Processing Prodi: ${prodi.nama}...`);

            // --- A. Find Kaprodi User ---
            // We need the User ID of the Kaprodi to set 'createdBy'
            // We can find them via the KaprodiData -> User link or email convention
            const kaprodiEmail = `kaprodi_${prodi.kode?.toLowerCase() || 'unknown'}@unugha.ac.id`;
            const kaprodiUser = await prisma.user.findUnique({ where: { email: kaprodiEmail } });

            if (!kaprodiUser) {
                console.log(`   ⚠️ Kaprodi user not found for ${prodi.nama}, skipping CPL generation.`);
                continue;
            }

            // --- B. Generate CPLs (~10 per Prodi) ---
            const cplCategories = ['Sikap', 'Pengetahuan', 'Keterampilan Umum', 'Keterampilan Khusus'];
            const cplIds: string[] = [];

            // Check existing CPLs created by this Kaprodi
            const existingCpls = await prisma.cpl.findMany({ where: { createdBy: kaprodiUser.id } });

            if (existingCpls.length < 10) {
                const cplToCreate = 10 - existingCpls.length;
                console.log(`   📘 Generating ${cplToCreate} CPLs...`);

                for (let i = 0; i < cplToCreate; i++) {
                    const category = getRandomItem(cplCategories);
                    const codeNum = existingCpls.length + i + 1;
                    const cpl = await prisma.cpl.create({
                        data: {
                            kodeCpl: `CPL-${prodi.kode}-${codeNum}`,
                            deskripsi: `Mampu menerapkan ${category.toLowerCase()} dalam konteks ${prodi.nama} secara profesional.`,
                            kategori: category,
                            createdBy: kaprodiUser.id,
                            isActive: true
                        }
                    });
                    cplIds.push(cpl.id);
                }
            } else {
                cplIds.push(...existingCpls.map(c => c.id));
            }
            totalCpl += cplIds.length;

            // --- C. Process Mata Kuliah (CPMK & Mapping) ---
            for (const mk of prodi.mataKuliah) {
                // 1. Generate CPMK (~3-5 per MK)
                const existingCpmk = await prisma.cpmk.findMany({ where: { mataKuliahId: mk.id } });
                const cpmkIds: string[] = [];

                if (existingCpmk.length < 3) {
                    const cpmkToCreate = randomNumber(3, 5);
                    // console.log(`      Generating ${cpmkToCreate} CPMK for ${mk.namaMk}...`);

                    for (let i = 0; i < cpmkToCreate; i++) {
                        const cpmk = await prisma.cpmk.create({
                            data: {
                                kodeCpmk: `CPMK-${randomNumber(100, 999)}`,
                                deskripsi: `Mahasiswa mampu memahami konsep dasar ${mk.namaMk} bagian ${i + 1}.`,
                                mataKuliahId: mk.id,
                                createdBy: kaprodiUser.id, // Assuming Kaprodi/Dosen creates it
                                isActive: true
                            }
                        });
                        cpmkIds.push(cpmk.id);
                    }
                } else {
                    cpmkIds.push(...existingCpmk.map(c => c.id));
                }
                totalCpmk += cpmkIds.length;

                // 2. Map CPMK to CPL (Randomly)
                for (const cpmkId of cpmkIds) {
                    const existingMap = await prisma.cpmkCplMapping.findFirst({ where: { cpmkId } });
                    if (!existingMap && cplIds.length > 0) {
                        await prisma.cpmkCplMapping.create({
                            data: {
                                cpmkId: cpmkId,
                                cplId: getRandomItem(cplIds),
                                bobotPersentase: 100 // Simple 1-to-1 mapping for now
                            }
                        });
                    }
                }
            }

            // --- D. Generate Grades (Nilai) for Mahasiswa ---
            const mahasiswaList = await prisma.profile.findMany({
                where: {
                    prodiId: prodi.id,
                    user: { role: { role: 'mahasiswa' } }
                },
                include: { user: true }
            });

            console.log(`   🎓 Generating Grades for ${mahasiswaList.length} Mahasiswa...`);

            for (const mhs of mahasiswaList) {
                if (!mhs.semester) continue;

                // Find courses this student "has taken" (semester <= current semester)
                const takenCourses = prodi.mataKuliah.filter(mk => mk.semester <= (mhs.semester || 1));

                for (const mk of takenCourses) {
                    // 1. Generate Nilai CPMK
                    const cpmks = await prisma.cpmk.findMany({ where: { mataKuliahId: mk.id } });
                    let courseAverage = 0;
                    let cpmkCount = 0;

                    for (const cpmk of cpmks) {
                        const existingNilai = await prisma.nilaiCpmk.findUnique({
                            where: {
                                mahasiswaId_cpmkId_semester_tahunAjaran: {
                                    mahasiswaId: mhs.userId,
                                    cpmkId: cpmk.id,
                                    semester: mk.semester,
                                    tahunAjaran: tahunAjaran.nama
                                }
                            }
                        });

                        let score;
                        if (!existingNilai) {
                            const rand = Math.random();
                            if (rand > 0.2) score = randomNumber(75, 100);
                            else if (rand > 0.05) score = randomNumber(60, 74);
                            else score = randomNumber(40, 59);

                            await prisma.nilaiCpmk.create({
                                data: {
                                    mahasiswaId: mhs.userId,
                                    cpmkId: cpmk.id,
                                    mataKuliahId: mk.id,
                                    nilaiAkhir: score,
                                    semester: mk.semester,
                                    tahunAjaran: tahunAjaran.nama,
                                    isCalculated: true
                                }
                            });
                            totalNilai++;
                        } else {
                            score = Number(existingNilai.nilaiAkhir);
                        }
                        courseAverage += score;
                        cpmkCount++;
                    }

                    // 2. Generate Nilai CPL (Required for Transcript)
                    if (cpmkCount > 0) {
                        const avgScore = courseAverage / cpmkCount;

                        // Find CPLs linked to this course (via CPMK mapping)
                        const cpmkIds = cpmks.map(c => c.id);
                        const mappings = await prisma.cpmkCplMapping.findMany({
                            where: { cpmkId: { in: cpmkIds } },
                            select: { cplId: true },
                            distinct: ['cplId']
                        });

                        for (const map of mappings) {
                            await prisma.nilaiCpl.upsert({
                                where: {
                                    mahasiswaId_cplId_mataKuliahId_semester_tahunAjaran: {
                                        mahasiswaId: mhs.userId,
                                        cplId: map.cplId,
                                        mataKuliahId: mk.id,
                                        semester: mk.semester,
                                        tahunAjaran: tahunAjaran.nama
                                    }
                                },
                                update: {},
                                create: {
                                    mahasiswaId: mhs.userId,
                                    cplId: map.cplId,
                                    mataKuliahId: mk.id,
                                    nilai: avgScore, // Use average of CPMK scores
                                    semester: mk.semester,
                                    tahunAjaran: tahunAjaran.nama
                                }
                            });

                            // Also ensure CplMataKuliah link exists for weight calculation
                            await prisma.cplMataKuliah.upsert({
                                where: {
                                    cplId_mataKuliahId: {
                                        cplId: map.cplId,
                                        mataKuliahId: mk.id
                                    }
                                },
                                update: {},
                                create: {
                                    cplId: map.cplId,
                                    mataKuliahId: mk.id,
                                    bobotKontribusi: 1.0
                                }
                            });
                        }
                    }
                }
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎉 Academic Data Generation Complete!');
        console.log(`   Total CPL Created/Checked: ${totalCpl}`);
        console.log(`   Total CPMK Created/Checked: ${totalCpmk}`);
        console.log(`   Total Nilai Records Created: ${totalNilai}`);
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('❌ Error seeding academic data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAcademicData();
