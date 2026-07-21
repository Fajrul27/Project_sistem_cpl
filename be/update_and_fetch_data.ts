import { PrismaClient } from '@prisma/client';
import { calculateNilaiCpmk } from './server/lib/calculation.js'; // Assuming this can be imported

const prisma = new PrismaClient();

async function main() {
    const mufti = await prisma.profile.findFirst({
        where: { namaLengkap: { contains: "Mufti Abi" } }
    });
    
    if (!mufti) return;
    const mahasiswaId = mufti.userId;

    const studentWithGrades = await prisma.nilaiCpmk.findFirst({
        where: { mahasiswaId },
        include: { mahasiswa: true }
    });

    if (!studentWithGrades) return;
    const mataKuliahId = studentWithGrades.mataKuliahId;
    const semester = studentWithGrades.semester;
    const tahunAjaranId = studentWithGrades.tahunAjaranId;

    // Change grades in database to be varied
    const grades = [85.5, 78.0, 92.5, 88.0, 76.5];
    
    const nilaiTeknik = await prisma.nilaiTeknikPenilaian.findMany({
        where: { mahasiswaId, mataKuliahId }
    });

    for (let i = 0; i < nilaiTeknik.length; i++) {
        await prisma.nilaiTeknikPenilaian.update({
            where: { id: nilaiTeknik[i].id },
            data: { nilai: grades[i % grades.length] }
        });
    }

    // Recalculate
    const cpmks = await prisma.cpmk.findMany({ where: { mataKuliahId } });
    for (const cpmk of cpmks) {
        if (tahunAjaranId) {
            await calculateNilaiCpmk(mahasiswaId, cpmk.id, mataKuliahId, semester, tahunAjaranId);
        }
    }

    // Fetch and print data again
    const nilaiCpmkList = await prisma.nilaiCpmk.findMany({
        where: { mahasiswaId, mataKuliahId },
        include: { cpmk: { include: { teknikPenilaian: true } } }
    });

    console.log(`\nSelected Student: ${mufti.namaLengkap}`);
    console.log(`--- Data for Tabel 6: Hasil Perhitungan Nilai CPMK ---`);
    for (const nc of nilaiCpmkList) {
        const ntList = await prisma.nilaiTeknikPenilaian.findMany({
            where: {
                mahasiswaId,
                mataKuliahId,
                teknikPenilaianId: { in: nc.cpmk.teknikPenilaian.map(t => t.id) }
            },
            include: { teknikPenilaian: true }
        });
        
        const components = ntList.map(nt => `${nt.teknikPenilaian.namaTeknik}: ${Number(nt.nilai)} (Bobot: ${Number(nt.teknikPenilaian.bobotPersentase)}%)`).join(" | ");
        console.log(`CPMK: ${nc.cpmk.kodeCpmk}\nKomponen: ${components}\nNilai Akhir CPMK: ${Number(nc.nilaiAkhir)}\n-------------------------------------------------`);
    }

    const nilaiCplList = await prisma.nilaiCpl.findMany({
        where: { mahasiswaId, mataKuliahId },
        include: { cpl: true, mataKuliah: { include: { cpmk: { include: { cplMappings: true } } } } }
    });

    console.log(`--- Data for Tabel 7 & 8: Hasil Agregasi Nilai CPL ---`);
    for (const nCpl of nilaiCplList) {
        console.log(`CPL: ${nCpl.cpl.kodeCpl}\nNilai Akhir CPL: ${Number(nCpl.nilai)}`);
        const relatedCpmks = nCpl.mataKuliah.cpmk.filter(cpmk => cpmk.cplMappings.some(m => m.cplId === nCpl.cplId));
        for (const cpmk of relatedCpmks) {
            const mapping = cpmk.cplMappings.find(m => m.cplId === nCpl.cplId);
            const nc = nilaiCpmkList.find(n => n.cpmkId === cpmk.id);
            console.log(`   - CPMK Pendukung: ${cpmk.kodeCpmk} | Nilai CPMK: ${nc ? Number(nc.nilaiAkhir) : 'N/A'} | Bobot Relasi: ${Number(mapping?.bobotPersentase)}%`);
        }
        console.log("-------------------------------------------------");
    }
}

main().catch(e => console.error(e)).finally(async () => { await prisma.$disconnect(); });
