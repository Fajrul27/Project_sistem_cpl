import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const levelTaksonomiMap: { [key: string]: string } = {
    "C1": "Mengingat",
    "C2": "Memahami",
    "C3": "Menerapkan",
    "C4": "Menganalisis",
    "C5": "Mengevaluasi",
    "C6": "Mencipta",
    "P1": "Persepsi",
    "P2": "Respon",
    "P3": "Penilaian",
    "P4": "Organisasi",
    "P5": "Karakterisasi",
    "A1": "Menerima",
    "A2": "Merespons",
    "A3": "Menghargai",
    "A4": "Mengelola",
    "A5": "Menginternalisasi",
    "K1": "Mengingat",
    "K2": "Memahami",
    "K3": "Menerapkan",
    "K4": "Menganalisis",
    "K5": "Mengevaluasi",
    "K6": "Mencipta"
};

async function main() {
    console.log('Seeding Level Taksonomi...');

    for (const [kode, deskripsi] of Object.entries(levelTaksonomiMap)) {
        let kategori = 'Uncategorized';
        if (kode.startsWith('C')) kategori = 'Kognitif';
        else if (kode.startsWith('A')) kategori = 'Afektif';
        else if (kode.startsWith('P')) kategori = 'Psikomotorik';
        else if (kode.startsWith('K')) kategori = 'Kognitif'; // Assuming K is also Cognitive based on descriptions

        await prisma.levelTaksonomi.upsert({
            where: { kode },
            update: {
                deskripsi,
                kategori
            },
            create: {
                kode,
                deskripsi,
                kategori
            }
        });
    }

    console.log('Level Taksonomi seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
