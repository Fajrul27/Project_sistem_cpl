import { prisma } from './server/lib/prisma.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log('Checking PenilaianTidakLangsung table...');
    const count = await prisma.penilaianTidakLangsung.count();
    console.log(`Total records: ${count}`);

    const data = await prisma.penilaianTidakLangsung.findMany({
        include: {
            mahasiswa: {
                include: {
                    user: {
                        select: { email: true }
                    }
                }
            },
            cpl: {
                select: { kodeCpl: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10
    });

    console.log('Latest 10 records:');
    data.forEach(item => {
        // @ts-ignore
        const email = item.mahasiswa?.user?.email || 'no-email';
        // @ts-ignore
        const nama = item.mahasiswa?.namaLengkap || 'no-name';
        // @ts-ignore
        const prodiId = item.mahasiswa?.prodiId || 'no-prodi';
        // @ts-ignore
        const kodeCpl = item.cpl?.kodeCpl || 'no-cpl';
        console.log(`User: ${nama} (${email}), Prodi: ${prodiId}, CPL: ${kodeCpl}, Nilai: ${item.nilai}, Sem: ${item.semester}, TA: ${item.tahunAjaran}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
