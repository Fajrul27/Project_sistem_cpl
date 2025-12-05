import { prisma } from './server/lib/prisma.js';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log('Checking available filters in PenilaianTidakLangsung...');

    // 1. Get distinct Tahun Ajaran
    const distinctTA = await prisma.penilaianTidakLangsung.findMany({
        select: { tahunAjaran: true },
        distinct: ['tahunAjaran'],
        orderBy: { tahunAjaran: 'asc' }
    });
    console.log('\nAvailable Tahun Ajaran:', distinctTA.map(t => `'${t.tahunAjaran}'`));

    // 2. Get distinct Prodi IDs from the related Mahasiswa profiles
    // Prisma doesn't support distinct on related fields directly in one go easily for this, 
    // so we'll fetch prodiIds and distinct them in JS or use a raw query if needed.
    // Let's try a group by on the relation if possible, or just fetch all and unique them (assuming not millions of records).

    const records = await prisma.penilaianTidakLangsung.findMany({
        select: {
            mahasiswa: {
                select: {
                    prodiId: true,
                    programStudi: true
                }
            }
        }
    });

    const prodiMap = new Map();
    records.forEach(r => {
        const pid = r.mahasiswa?.prodiId || 'NULL';
        const pname = r.mahasiswa?.programStudi || 'Unknown';
        if (!prodiMap.has(pid)) {
            prodiMap.set(pid, { name: pname, count: 0 });
        }
        prodiMap.get(pid).count++;
    });

    const fs = await import('fs');
    const ta = distinctTA.map(t => t.tahunAjaran).join('|');
    const prodis = Array.from(prodiMap.values()).map(v => v.name).join('|');
    fs.writeFileSync('filters_output.txt', `TA: ${ta}\nPRODIS: ${prodis}`);
    console.log('Done writing to filters_output.txt');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
