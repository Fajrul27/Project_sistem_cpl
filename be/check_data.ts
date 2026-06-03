import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Fetching exact calculation data for Bab 4...");
    
    const nilaiCpmk = await prisma.nilaiCpmk.findMany({
        include: {
            cpmk: true,
            mahasiswa: true,
            mataKuliah: true
        }
    });

    console.log("\n--- Nilai CPMK ---");
    for (const n of nilaiCpmk) {
        console.log(`Mahasiswa: ${n.mahasiswa.namaLengkap}, MK: ${n.mataKuliah.namaMk}, CPMK: ${n.cpmk.kodeCpmk}, Nilai Akhir: ${n.nilaiAkhir}`);
    }

    const nilaiCpl = await prisma.nilaiCpl.findMany({
        include: {
            cpl: true,
            mahasiswa: true,
            mataKuliah: true
        }
    });

    console.log("\n--- Nilai CPL ---");
    for (const n of nilaiCpl) {
        console.log(`Mahasiswa: ${n.mahasiswa.namaLengkap}, MK: ${n.mataKuliah.namaMk}, CPL: ${n.cpl.kodeCpl}, Nilai: ${n.nilai}`);
    }

    const teknikPenilaian = await prisma.teknikPenilaian.findMany({
        include: {
            cpmk: true,
            nilaiTeknik: true
        }
    });

    console.log("\n--- Komponen Penilaian (Algoritma Pemrograman I) ---");
    for (const t of teknikPenilaian) {
        if (t.cpmk.mataKuliahId === nilaiCpmk[0]?.mataKuliahId) {
             console.log(`CPMK: ${t.cpmk.kodeCpmk}, Teknik: ${t.namaTeknik}, Bobot: ${t.bobotPersentase}%`);
             for (const nt of t.nilaiTeknik) {
                 console.log(`  -> Nilai Mahasiswa: ${nt.nilai}`);
             }
        }
    }

    const pemetaan = await prisma.cpmkCplMapping.findMany({
        include: {
            cpmk: true,
            cpl: true
        },
        where: {
            cpmk: {
                mataKuliahId: nilaiCpmk[0]?.mataKuliahId
            }
        }
    });

    console.log("\n--- Pemetaan CPMK ke CPL (Algoritma Pemrograman I) ---");
    for (const p of pemetaan) {
        console.log(`CPMK: ${p.cpmk.kodeCpmk} -> CPL: ${p.cpl.kodeCpl}, Bobot Persentase: ${p.bobotPersentase}%`);
    }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
