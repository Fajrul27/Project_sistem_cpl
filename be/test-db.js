import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'gmail' } },
    include: { profile: true }
  });
  console.log("Users:", users.length);
  if (users.length > 0) {
    console.log("Sample user:", users[0]);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
