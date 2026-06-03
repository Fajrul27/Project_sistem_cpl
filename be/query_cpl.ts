import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const mk = await prisma.mata_kuliah.findFirst({
    where: { nama_mk: { contains: 'Algoritma Pemrograman I' } },
    include: {
      cpmk: {
        include: {
          komponen_nilai: true,
          cpl_cpmk: {
            include: {
              cpl: true
            }
          }
        }
      }
    }
  });

  console.log(JSON.stringify(mk, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
