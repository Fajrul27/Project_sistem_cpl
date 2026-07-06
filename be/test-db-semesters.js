import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { profile: true },
    where: { role: { role: { name: 'mahasiswa' } } }
  });
  console.log("Total students:", users.length);
  const semesters = {};
  for (const user of users) {
      const s = user.profile?.semester;
      semesters[s] = (semesters[s] || 0) + 1;
  }
  console.log("Students by semester:", semesters);
}
main().catch(console.error).finally(() => prisma.$disconnect());
