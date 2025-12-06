
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFmikom() {
    try {
        const item = await prisma.penilaianTidakLangsung.findFirst({
            where: {
                mahasiswa: {
                    prodi: {
                        fakultas: {
                            // Try to match Fmikom by name or generic search
                            nama: { contains: 'Informatika' } // Assuming Fmikom relates to Informatika
                        }
                    }
                }
            },
            include: { mahasiswa: { include: { prodi: true } } }
        });

        if (item) {
            console.log(`Found item in Fmikom (Prodi: ${item.mahasiswa.prodi?.nama})`);
            console.log(`Tahun Ajaran: "${item.tahunAjaran}"`);
        } else {
            console.log("No Fmikom data found using script.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkFmikom();
