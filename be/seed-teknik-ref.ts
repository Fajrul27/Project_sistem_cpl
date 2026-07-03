import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const data = [
  { k: "Tes", n: ["Kuis", "UTS", "UAS", "Tes Lisan"] },
  { k: "Penugasan", n: ["Tugas Individu", "Tugas Kelompok", "Makalah", "Review Artikel", "Resume"] },
  { k: "Presentasi", n: ["Presentasi Individu", "Presentasi Kelompok"] },
  { k: "Praktik", n: ["Praktikum", "Demonstrasi", "Simulasi"] },
  { k: "Proyek", n: ["Proyek Akhir", "Mini Project"] },
  { k: "Produk", n: ["Produk/Hasil Karya"] },
  { k: "Portofolio", n: ["Portofolio"] },
  { k: "Laporan", n: ["Laporan Praktikum", "Laporan Proyek"] },
  { k: "Observasi", n: ["Keaktifan Diskusi", "Partisipasi Kelas", "Sikap"] },
  { k: "Penilaian Diri", n: ["Self Assessment"] },
  { k: "Penilaian Teman Sebaya", n: ["Peer Assessment"] },
  { k: "Refleksi", n: ["Jurnal Refleksi"] }
];

async function main() {
    let count = 0;
    for (const group of data) {
        for (const nama of group.n) {
            await prisma.teknikPenilaianRef.upsert({
                where: { nama },
                update: { deskripsi: `Kategori: ${group.k}` },
                create: { nama, deskripsi: `Kategori: ${group.k}` }
            });
            count++;
        }
    }
    console.log(`Berhasil insert/update ${count} referensi teknik penilaian.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
