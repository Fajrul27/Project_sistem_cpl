import { PrismaClient } from '@prisma/client';

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
    const classes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    for (const cls of classes) {
        await prisma.kelas.upsert({
            where: { nama: cls },
            update: {},
            create: { nama: cls },
        });
    }
    console.log('Classes seeded.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
