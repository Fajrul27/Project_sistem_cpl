import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Semester and Kelas...');

    // Seed Semester
    const semesters = [
        { nama: 'Semester 1', angka: 1 },
        { nama: 'Semester 2', angka: 2 },
        { nama: 'Semester 3', angka: 3 },
        { nama: 'Semester 4', angka: 4 },
        { nama: 'Semester 5', angka: 5 },
        { nama: 'Semester 6', angka: 6 },
        { nama: 'Semester 7', angka: 7 },
        { nama: 'Semester 8', angka: 8 },
    ];

    for (const sem of semesters) {
        await prisma.semester.upsert({
            where: { angka: sem.angka },
            update: {},
            create: sem,
        });
    }
    console.log('Semesters seeded.');

    // Seed Kelas
    const classMappings = {
        'A': 'Kelas A',
        'B': 'Kelas B',
        'C': 'Kelas C',
        'D': 'Kelas D',
        'E': 'Kelas E',
        'F': 'Kelas F',
        'G': 'Kelas G',
        'H': 'Kelas H'
    };

    const targetClasses = ['Kelas A', 'Kelas B', 'Kelas C'];

    console.log('Renaming/Creating Classes...');

    // 1. Rename existing single-letter classes if they exist
    for (const [oldName, newName] of Object.entries(classMappings)) {
        const existing = await prisma.kelas.findUnique({ where: { nama: oldName } });
        if (existing) {
            console.log(`Renaming class ${oldName} to ${newName}...`);
            await prisma.kelas.update({
                where: { id: existing.id },
                data: { nama: newName }
            });
        }
    }

    // 2. Ensure target classes exist
    for (const cls of targetClasses) {
        await prisma.kelas.upsert({
            where: { nama: cls },
            update: {},
            create: { nama: cls },
        });
    }
    console.log('Classes seeded/updated.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
