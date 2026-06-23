# Panduan Alur Kerja Sistem CPL (Non-Teknis)

Dokumen ini menjelaskan cara kerja sistem manajemen Capaian Pembelajaran Lulusan (CPL) secara sederhana. Sistem ini dirancang untuk membantu Program Studi menjalankan kurikulum berbasis OBE (*Outcome-Based Education*) secara terstruktur.

Secara garis besar, alur kerja sistem dibagi menjadi 5 tahapan utama:

## 1. Tahap Perencanaan (Level Program Studi)
Pada tahap awal, Admin atau Kaprodi menyiapkan fondasi kurikulum.
*   **Visi Misi & Profil Lulusan**: Menentukan arah tujuan prodi dan profil lulusan yang ingin dihasilkan (misal: menjadi Analis Sistem, Pengembang Software).
*   **Rumusan CPL**: Menetapkan kemampuan spesifik (Sikap, Pengetahuan, Keterampilan) yang wajib dimiliki oleh setiap lulusan.
    *   *Contoh*: "Mampu merancang perangkat lunak yang efisien."

## 2. Tahap Pemetaan (Level Kurikulum)
Setelah CPL ditetapkan, langkah selanjutnya adalah mendistribusikan tanggung jawab pencapaian CPL tersebut ke mata kuliah.
*   **Mapping CPL ke Mata Kuliah**: Menentukan mata kuliah mana saja yang bertanggung jawab untuk mengajarkan CPL tertentu.
*   **Penetapan Bobot**: Menentukan seberapa besar peran mata kuliah tersebut dalam membentuk CPL (misal: Mata Kuliah "Pemrograman Web" berkontribusi besar terhadap CPL "Keterampilan Coding").

## 3. Tahap Perancangan Mata Kuliah (Level Dosen)
Sebelum semester dimulai, Dosen merancang detail pembelajaran di dalam sistem.
*   **Membuat CPMK**: Dosen menurunkan CPL yang dibebankan padanya menjadi Capaian Pembelajaran Mata Kuliah (CPMK) yang lebih spesifik.
*   **Rencana Penilaian**: Dosen menentukan bagaimana cara mengukur kemampuan mahasiswa.
    *   Apakah menggunakan Tes (UTS/UAS)?
    *   Apakah menggunakan Tugas Proyek?
    *   Dosen juga membuat **Rubrik Penilaian** agar standar penilaian jelas dan objektif (misal: kriteria "Sangat Baik" jika kode berjalan tanpa error).

## 4. Tahap Penilaian (Selama Semester Berjalan)
Saat proses perkuliahan berlangsung atau berakhir, Dosen memasukkan data kinerja mahasiswa.
*   **Input Nilai**: Dosen memasukkan nilai mahasiswa berdasarkan teknik penilaian yang sudah direncanakan sebelumnya.
*   **Kalkulasi Otomatis**: Sistem secara otomatis menghitung:
    1.  Nilai Akhir Mata Kuliah (Angka/Huruf).
    2.  **Ketercapaian CPL**: Sistem menghitung apakah mahasiswa tersebut sudah memenuhi standar CPL berdasarkan nilai-nilai tugas/ujiannya tadi.

## 5. Tahap Evaluasi & Laporan (Akhir Semester)
Ini adalah tahap terpenting dalam OBE untuk perbaikan berkelanjutan.
*   **Transkrip CPL**: Mahasiswa dan Dosen bisa melihat "Rapor CPL". Bukan hanya nilai A/B/C, tapi grafik yang menunjukkan kemampuan spesifik mana yang sudah dikuasai dan mana yang masih kurang.
*   **Evaluasi Mata Kuliah**: Dosen mengisi formulir evaluasi diri tentang kendala selama mengajar dan rencana perbaikan untuk semester depan.
*   **Feedback Kaprodi**: Kaprodi memberikan masukan atas evaluasi dosen tersebut untuk peningkatan kualitas pembelajaran.
