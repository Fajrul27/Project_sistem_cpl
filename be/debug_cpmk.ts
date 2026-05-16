
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function debugCpmk() {
  const cpmk = await prisma.cpmk.findFirst({
    where: { kodeCpmk: 'CPMK-021', isActive: true },
    include: {
      cplMappings: true,
      teknikPenilaian: true,
      mataKuliah: true
    }
  });

  console.log('DEBUG CPMK-021:');
  console.log(JSON.stringify(cpmk, null, 2));
}

debugCpmk()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
