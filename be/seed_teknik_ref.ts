
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const teknikRefs = [
    { nama: 'Ujian Tulis', deskripsi: 'Penilaian melalui tes tertulis (UTS, UAS, Kuis)' },
    { nama: 'Ujian Lisan', deskripsi: 'Penilaian melalui tanya jawab lisan' },
    { nama: 'Tugas', deskripsi: 'Penugasan mandiri atau kelompok (Paper, Laporan)' },
    { nama: 'Proyek', deskripsi: 'Pengerjaan proyek atau studi kasus' },
    { nama: 'Presentasi', deskripsi: 'Penyajian materi atau hasil kerja di depan kelas' },
    { nama: 'Observasi', deskripsi: 'Pengamatan langsung terhadap kinerja atau perilaku' },
    { nama: 'Partisipasi', deskripsi: 'Keaktifan dalam kegiatan pembelajaran' },
    { nama: 'Praktikum', deskripsi: 'Kegiatan praktik di laboratorium atau lapangan' },
    { nama: 'Portofolio', deskripsi: 'Kumpulan hasil karya mahasiswa' }
];

async function main() {
    console.log('Seeding Teknik Penilaian Ref...');

    for (const teknik of teknikRefs) {
        await prisma.teknikPenilaianRef.upsert({
            where: { nama: teknik.nama },
            update: {},
            create: teknik
        });
        console.log(`- Upserted: ${teknik.nama}`);
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
