import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Current categories might be "Keterampilan Khusus", "Keterampilan Umum", "Pengetahuan Khusus", "Pengetahuan Umum", "Sikap Khusus", "Sikap Umum"
    const targetKategori = ['Keterampilan', 'Pengetahuan', 'Sikap'];

    // Create the targets if they don't exist
    const categoryMap: any = {};
    for (const name of targetKategori) {
        let cat = await prisma.kategoriCpl.findFirst({ where: { nama: name } });
        if (!cat) {
            cat = await prisma.kategoriCpl.create({ data: { nama: name } });
        }
        categoryMap[name] = cat.id;
    }

    // Map existing CPLs
    const cpls = await prisma.cpl.findMany();
    for (const cpl of cpls) {
        let targetName = '';
        if (cpl.kategori?.toLowerCase().includes('keterampilan') || (await prisma.kategoriCpl.findUnique({where:{id: cpl.kategoriId||''}}))?.nama.toLowerCase().includes('keterampilan')) {
            targetName = 'Keterampilan';
        } else if (cpl.kategori?.toLowerCase().includes('pengetahuan') || (await prisma.kategoriCpl.findUnique({where:{id: cpl.kategoriId||''}}))?.nama.toLowerCase().includes('pengetahuan')) {
            targetName = 'Pengetahuan';
        } else if (cpl.kategori?.toLowerCase().includes('sikap') || (await prisma.kategoriCpl.findUnique({where:{id: cpl.kategoriId||''}}))?.nama.toLowerCase().includes('sikap')) {
            targetName = 'Sikap';
        }

        if (targetName) {
            await prisma.cpl.update({
                where: { id: cpl.id },
                data: {
                    kategori: targetName,
                    kategoriId: categoryMap[targetName]
                }
            });
        }
    }

    // Delete old unused categories
    const oldCats = await prisma.kategoriCpl.findMany({
        where: {
            NOT: {
                nama: { in: targetKategori }
            }
        }
    });

    for (const oldCat of oldCats) {
        // Ensure no CPL is using it
        const count = await prisma.cpl.count({ where: { kategoriId: oldCat.id } });
        if (count === 0) {
            await prisma.kategoriCpl.delete({ where: { id: oldCat.id } });
        }
    }

    console.log("Kategori CPL updated successfully");
}

main().catch(console.error).finally(() => prisma.$disconnect());
