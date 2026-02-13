
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTeknikIndustri() {
    const prodi = await prisma.prodi.findFirst({
        where: { kode: 'TIND' }
    });

    if (!prodi) {
        console.log('Prodi TIND not found');
        return;
    }

    const cplCount = await prisma.cpl.count({ where: { prodiId: prodi.id } });
    if (cplCount === 0) {
        console.log('Seeding CPLs for Teknik Industri...');
        for (let i = 1; i <= 5; i++) {
            await prisma.cpl.create({
                data: {
                    kodeCpl: `CPL-TIND-P${i}`,
                    deskripsi: `Capaian Pembelajaran Lulusan Teknik Industri ${i}`,
                    kategori: 'Pengetahuan',
                    prodiId: prodi.id,
                    isActive: true
                }
            });
        }
    }

    console.log('Fix complete.');
}

fixTeknikIndustri()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
