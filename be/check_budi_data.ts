
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Starting check...");
        // 1. Find Budi Santoso
        // Search by name broadly
        const profiles = await prisma.profile.findMany({
            where: { namaLengkap: { contains: 'Budi' } },
            include: { user: true }
        });

        console.log(`Found ${profiles.length} profiles matching 'Budi'`);

        for (const p of profiles) {
            console.log(`Checking Budi: ${p.namaLengkap} (${p.userId})`);
            await checkData(p.userId);
        }
    } catch (err) {
        console.error("Error in main:", err);
    }
}

async function checkData(userId: string) {
    // 2. Get Assigned Classes
    const pengampu = await prisma.mataKuliahPengampu.findMany({
        where: { dosenId: userId },
        include: { mataKuliah: true, kelas: true }
    });

    console.log(`\nAssigned to ${pengampu.length} courses/classes:`);
    const classIds = [];
    for (const p of pengampu) {
        console.log(`- MK: ${p.mataKuliah.namaMk} (${p.mataKuliah.kodeMk}), Class: ${p.kelas?.nama || 'No Class'}`);
        if (p.kelasId) classIds.push(p.kelasId);
    }

    // 3. Count Students in those classes
    if (classIds.length > 0) {
        const students = await prisma.profile.findMany({
            where: {
                kelasId: { in: classIds },
                user: { role: { role: 'mahasiswa' } }
            },
            select: { namaLengkap: true, nim: true, kelas: { select: { nama: true } } }
        });

        console.log(`\nTotal Students in these classes: ${students.length}`);
        students.forEach(s => {
            console.log(`- ${s.namaLengkap} (${s.nim}) in ${s.kelas?.nama}`);
        });
    } else {
        console.log("\nNo classes assigned, so 0 students.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
