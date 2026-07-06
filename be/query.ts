import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.nilaiCpl.count();
  console.log('Total NilaiCpl:', count);
  const sample = await prisma.nilaiCpl.findFirst();
  console.log('Sample:', sample);
}
main().catch(console.error).finally(() => prisma.$disconnect());
