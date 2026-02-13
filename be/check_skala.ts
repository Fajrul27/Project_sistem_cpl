import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const data = await prisma.skalaNilai.findMany();
    console.log('Current Skala Nilai Data:', JSON.stringify(data, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
