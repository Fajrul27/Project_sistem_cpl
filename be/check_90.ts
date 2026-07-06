import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const rawScores = await prisma.nilaiCpl.findMany({
        where: { nilai: { gte: 90 } },
        select: { nilai: true }
    });
    console.log(`Raw course grades >= 90: ${rawScores.length}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
