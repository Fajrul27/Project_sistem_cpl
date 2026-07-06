import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { profile: true },
    where: { role: { role: { name: 'mahasiswa' } } },
    take: 3
  });
  console.dir(users, { depth: null });
}
main().catch(console.error).finally(() => prisma.$disconnect());
