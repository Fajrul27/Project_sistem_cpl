import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const counts = await prisma.nilaiCpl.groupBy({
    by: ['tahunAjaranId'],
    _count: {
      _all: true
    }
  });

  const taDetails = await prisma.tahunAjaran.findMany({
    where: { id: { in: counts.map(c => c.tahunAjaranId) } }
  });

  const map = new Map(taDetails.map(t => [t.id, t.nama]));

  counts.forEach(c => {
    console.log(`Tahun Ajaran: ${map.get(c.tahunAjaranId)} (ID: ${c.tahunAjaranId}) -> Total Nilai: ${c._count._all}`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
