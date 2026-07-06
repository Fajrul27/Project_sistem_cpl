import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const cplMk = await prisma.cplMataKuliah.count();
  const cpmkCpl = await prisma.cpmkCplMapping.count();
  console.log('Total cplMataKuliah:', cplMk);
  console.log('Total cpmkCplMapping:', cpmkCpl);
}
main().catch(console.error).finally(() => prisma.$disconnect());
