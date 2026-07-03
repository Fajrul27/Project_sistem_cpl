import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const cpls = await prisma.cpl.findMany({ take: 5, select: { kodeCpl: true } });
    console.log(cpls);
}
main().catch(console.error).finally(() => prisma.$disconnect());
