
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkCpmkMappings() {
  const cpmks = await prisma.cpmk.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          cplMappings: true,
          teknikPenilaian: true
        }
      },
      mataKuliah: true
    }
  });

  console.log('CPMK Mappings Check:');
  cpmks.forEach(c => {
    console.log(`[${c.kodeCpmk}] ${c.mataKuliah.kodeMk}: CPL=${c._count.cplMappings}, Teknik=${c._count.teknikPenilaian}`);
  });
}

checkCpmkMappings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
