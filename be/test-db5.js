import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const role = await prisma.role.findFirst({ where: { name: 'mahasiswa' } });
  console.log("Found role mahasiswa?", role);
}
main().catch(console.error).finally(() => prisma.$disconnect());
