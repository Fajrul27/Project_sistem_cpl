import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Skala Nilai...');

    console.log('Clearing existing Skala Nilai...');
    await prisma.skalaNilai.deleteMany({});

    // Default Grade Scale based on standard academic systems
    const scales = [
        { huruf: 'A', nilaiMin: 85, nilaiMax: 100, isLulus: true, isSystem: true, isActive: true },
        { huruf: 'B', nilaiMin: 70, nilaiMax: 85, isLulus: true, isSystem: true, isActive: true },
        { huruf: 'C', nilaiMin: 55, nilaiMax: 70, isLulus: true, isSystem: true, isActive: true },
        { huruf: 'D', nilaiMin: 40, nilaiMax: 55, isLulus: false, isSystem: true, isActive: true },
        { huruf: 'E', nilaiMin: 0, nilaiMax: 40, isLulus: false, isSystem: true, isActive: true },
    ];

    console.log('Inserting default Skala Nilai...');
    for (const scale of scales) {
        await prisma.skalaNilai.create({ data: scale });
        console.log(`Created: ${scale.huruf} (${scale.nilaiMin}-${scale.nilaiMax}) - Lulus: ${scale.isLulus}`);
    }

    console.log('Seeding Skala Nilai Completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
