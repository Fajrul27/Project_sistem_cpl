import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TAXONOMY_LEVELS = [
    // Cognitive Domain
    { kode: 'C1', deskripsi: 'Mengingat (Remembering)', kategori: 'Kognitif' },
    { kode: 'C2', deskripsi: 'Memahami (Understanding)', kategori: 'Kognitif' },
    { kode: 'C3', deskripsi: 'Menerapkan (Applying)', kategori: 'Kognitif' },
    { kode: 'C4', deskripsi: 'Menganalisis (Analyzing)', kategori: 'Kognitif' },
    { kode: 'C5', deskripsi: 'Mengevaluasi (Evaluating)', kategori: 'Kognitif' },
    { kode: 'C6', deskripsi: 'Mencipta (Creating)', kategori: 'Kognitif' },

    // Affective Domain
    { kode: 'A1', deskripsi: 'Menerima (Receiving)', kategori: 'Afektif' },
    { kode: 'A2', deskripsi: 'Menanggapi (Responding)', kategori: 'Afektif' },
    { kode: 'A3', deskripsi: 'Menilai (Valuing)', kategori: 'Afektif' },
    { kode: 'A4', deskripsi: 'Mengorganisasi (Organizing)', kategori: 'Afektif' },
    { kode: 'A5', deskripsi: 'Karakterisasi (Characterizing)', kategori: 'Afektif' },

    // Psychomotor Domain
    { kode: 'P1', deskripsi: 'Peniruan (Imitation)', kategori: 'Psikomotor' },
    { kode: 'P2', deskripsi: 'Manipulasi (Manipulation)', kategori: 'Psikomotor' },
    { kode: 'P3', deskripsi: 'Presisi (Precision)', kategori: 'Psikomotor' },
    { kode: 'P4', deskripsi: 'Artikulasi (Articulation)', kategori: 'Psikomotor' },
    { kode: 'P5', deskripsi: 'Naturalisasi (Naturalization)', kategori: 'Psikomotor' },
];

async function main() {
    console.log('🌱 Seeding Level Taksonomi...');

    for (const level of TAXONOMY_LEVELS) {
        await prisma.levelTaksonomi.upsert({
            where: { kode: level.kode },
            update: level,
            create: level,
        });
        console.log(`   ✅ Processed ${level.kode}`);
    }

    console.log('✨ Level Taksonomi seeded successfully.');
}

main()
    .catch((e) => {
        console.error('Error seeding taxonomy:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
