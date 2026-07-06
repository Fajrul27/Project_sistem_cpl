import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.profile.findFirst({ where: { nim: '22E010010' } });
  console.log("Found nim 22E010010?", p);
}
main().catch(console.error).finally(() => prisma.$disconnect());
