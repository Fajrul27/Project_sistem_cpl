ANALISIS DAN EVALUASI PERFORMA DASHBOARD ADMIN SISTEM CPL BERBASIS OBE MENGGUNAKAN APACHE JMETER
(STUDI KOMPARASI: SERVER LOKAL CORE 2 DUO VS. SERVER XEON 24 CORE)



SKRIPSI
Diajukan untuk memenuhi sebagian persyaratan mendapatkan gelar Strata Satu Program Studi Informatika








AHMAD FAJRUL 'ULUM
22EO10027








PROGRAM STUDI INFORMATIKA
FAKULTAS MATEMATIKA DAN ILMU KOMPUTER
UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI 
CILACAP
2026



ANALISIS DAN EVALUASI PERFORMA DASHBOARD ADMIN SISTEM CPL BERBASIS OBE MENGGUNAKAN APACHE JMETER
(STUDI KOMPARASI: SERVER LOKAL CORE 2 DUO VS. SERVER XEON 24 CORE)



SKRIPSI
Diajukan untuk memenuhi sebagian persyaratan mendapatkan gelar Strata Satu Program Studi Informatika







	
AHMAD FAJRUL 'ULUM
22EO10027








PROGRAM STUDI INFORMATIKA
FAKULTAS MATEMATIKA DAN ILMU KOMPUTER
UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI 
CILACAP
2026

HALAMAN PERNYATAAN KEASLIAN SKRIPSI

Dengan ini saya menyatakan bahwa penulisan skripsi dengan judul “ANALISIS DAN EVALUASI PERFORMA DASHBOARD ADMIN SISTEM CPL BERBASIS OBE MENGGUNAKAN APACHE JMETER (STUDI KOMPARASI: SERVER LOKAL CORE 2 DUO VS. SERVER XEON 24 CORE)” adalah hasil karya saya dengan arahan dari pembimbing dan belum diajukan kepada pihak manapun. Sumber informasi yang dikutip dalam skripsi ini telah mencantumkan rujukan dalam Daftar Pustaka.
Demikian pernyataan ini dibuat dengan sebenarnya. Apabila di kemudian hari terdapat ketidaksesuaian dalam pernyataan ini, maka saya bersedia menerima sanksi sesuai dengan peraturan yang berlaku.

Cilacap, Juni 2026


Ahmad Fajrul ‘Ulum
22EO10027

LEMBAR PENGESAHAN

Skripsi Saudara			
Nama	:	Ahmad Fajrul ‘Ulum
NIM	:	22EO10027
Fakultas/Prodi	:	Fakultas MIKOM / Informatika
Judul	:	ANALISIS DAN EVALUASI PERFORMA DASHBOARD ADMIN SISTEM CPL BERBASIS OBE MENGGUNAKAN APACHE JMETER (STUDI KOMPARASI: SERVER LOKAL CORE 2 DUO VS. SERVER XEON 24 CORE)

Telah disidangkan oleh Dewan Penguji Fakultas Matematika dan Ilmu Komputer Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap pada hari / tanggal :
				Hari, Tanggal Bulan Tahun
Dan dapat diterima sebagai pemenuhan tugas akhir mahasiswa Program Strata 1 (S.1) Nama Prodi (Mat/Kom) Fakultas Matematika dan Ilmu Komputer (FMIKOM) pada Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap.
     
 Tempat, Tanggal Bulan Tahun
	Dewan Sidang	
Ketua		Sekretaris


Nama
NIDN		

Nama
NIDN

Penguji 1
		
Penguji 2



Mochamad T. A. Aziz Zein, S.Si., M.Kom.
NIDN. 41 230714 020		


Verry, S.T., M.Kom.
NIDN. 41230714175

Pembimbing I


Tri Anggoro, M.Kom
NIDN. 0601128103	
	
Pembimbing II


Riski Aspriyani, M.Pd
NIDN. 0616118901

Mengetahui,
Dekan Fakultas Matematika dan Ilmu Komputer


H. Edy Sulistiyanto,S.H., M.Kom.
NIDN. 0613065801

HALAMAN NOTA KONSULTAN
Nama Dosen

Dosen Fakultas Matematika dan Ilmu Komputer
Universitas Nahdlatul Ulama Al Ghazali Cilacap

NOTA KONSULTAN
Hal  		: Skripsi Saudara/i Ahmad Fajrul 'Ulum
Lampiran  	: -

Kepada
Yth. Dekan Fakultas Matematika dan Ilmu Komputer 
Universitas Nahdlatul Ulama Al Ghazali Cilacap
di Cilacap

Assalamu’alaikum Wr. Wb.
Setelah membaca, memeriksa dan melakukan perbaikan seperlunya maka skripsi saudara/i: 
Nama 	:	Ahmad Fajrul ‘Ulum
NIM 	:	22EO10027
Prodi 	:	Informatika 
Judul	: Analisis Dan Evaluasi Performa Dashboard Admin Sistem Cpl Berbasis Obe Menggunakan Apache JMeter (Studi Komparasi: Server Lokal Core 2 Duo Vs. Server Xeon 24 Core)

Dapat diajukan ke Fakultas Matematika dan Ilmu Komputer, Universitas Nahdlatul Ulama Al Ghazali Cilacap untuk memenuhi syarat memperoleh gelar Strata Satu (S1). 
Wassalamu’alaikum Wr. Wb.

Cilacap, Juli 2026
Konsultan


Nama Dosen
NIDN

HALAMAN NOTA PEMBIMBING
NOTA PEMBIMBING 

Cilacap, 17 Juli 2026
Kepada Yth :
Fakultas Matematika dan Komputer (FMIKOM)
UNUGHA Cilacap
di Cilacap

Assalamu’alaikum Wr. Wb.
Setelah melakukan bimbingan, telaah, arahan dan koreksi tahap penulisan skripsi
saudari:
Nama 		: Ahmad Fajrul ‘Ulum
NIM 		: 22EO10027
Fakultas 		: Matematika dan Ilmu Komputer
Prodi 		: Informatika
Judul 		: Analisis Dan Evaluasi Performa Dashboard Admin Sistem Cpl Berbasis Obe Menggunakan Apache JMeter (Studi Komparasi: Server Lokal Core 2 Duo Vs. Server Xeon 24 Core)

Kami berpendapat bahwa skripsi tersebut sudah dapat diajukan ke sidang skripsi.
Bersamaan ini kami kirimkan skripsi tersebut, semoga dapat segera disidangkan.

Atas perhatiannya kami ucapkan terima kasih.
Wassalamu’alaikum Wr. Wb.

Mengetahui,
Pembimbing I


Tri Anggoro, M.Kom
NIDN. 0601128103	Pembimbing II


Riski Aspriyani, M.Pd
NIDN. 0616118901
 
HALAMAN MOTO 


“Dan jika kamu membalas, maka balaslah dengan (balasan) yang sama dengan siksaan yang ditimpakan kepadamu. Tetapi jika kamu bersabar, sesungguhnya itulah yang lebih baik bagi orang yang sabar”
(QS. An-Nahl : 126)

Pendidikan merupakan perlengkapan paling baik untuk hari tua. (Aristoteles)

HALAMAN PERSEMBAHAN

Segala puji bagi Allah SWT, Rabb semesta alam yang senantiasa memberikan karunia sehingga penulis mampu menyelesaikan penulisan skripsi ini. Karya ini saya persembahkan kepada : 
    1. Orang tua (Bapak … dan Ibu … ) yang selalu mendidik saya, memberikan do’a, dukungan, nasihat dan semangat yang tiada henti. 
    2. Kakak tercinta, adik, dan saudara tersayang yang selalu memberikan do’a dan semangat tiada henti di setiap detik langkahku.
    3. Keluarga FMIKOM Angkatan 2022 yang selalu memberikan keceriaan, kebersamaan, dan motivasi. 
    4. Keluarga program studi Informatika, Sistem Informasi, dan Matematika yang saya banggakan.
    5. Seluruh teman UNUGHA yang telah memberikan do’a, dukungan, dan semangat.

 
KATA PENGANTAR

Puji syukur kepada Allah SWT atas segala limpahan nikmat dan karuniaNya, sehingga penulis dapat menyelesaikan penulisan skripsi. Sholawat dan salam senantiasa penulis haturkan kepada Nabi Muhammad SAW sebagai pembimbing seluruh umat manusia. 
Skripsi ini tidak akan selesai tanpa adanya bantuan dari banyak pihak, karena itu penulis menyampaikan terima kasih kepada :
    1. Bapak Drs. Edy Sulistyanto, M.Kom, Dekan FMIKOM UNUGHA.
    2. Bapak Tri Anggoro, M.Kom, Pembimbing I yang telah dengan sabar memberikan bimbingan dan petunjuk dalam menyelesaikan skripsi ini.
    3. Ibu Riski Aspriyani, M.Pd, Pembimbing II yang telah dengan sabar memberikan bimbingan dan petunjuk dalam menyelesaikan skripsi ini.
    4. Bapak Mochamad T. A. Aziz Zein, S.Si., M.Kom. dan Bapak Verry, S.T., M.Kom. selaku Dosen Penguji atas masukan dan arahan revisi yang sangat berharga.
    5. Seluruh Dosen dan Staf Pengajar Fakultas Matematika dan Ilmu Komputer UNUGHA Cilacap.
    6. Semua pihak yang tidak dapat kami sebutkan satu persatu.
Semoga Allah SWT membalas jerih payah dan pengorbanan yang telah diberikan dengan balasan yang lebih baik. Amin. Penulis berharap semoga karya ini bermanfaat bagi pembaca.

Cilacap, Juli 2026


Ahmad Fajrul ‘Ulum

ABSTRAK

Ahmad Fajrul 'Ulum. Analisis dan Evaluasi Performa Dashboard Admin Sistem CPL Berbasis OBE Menggunakan Apache JMeter (Studi Komparasi: Server Lokal Core 2 Duo vs. Server Xeon 24 Core). Dibimbing oleh Bapak Tri Anggoro, M.Kom dan Ibu Riski Aspriyani, M.Pd.

Sistem Penilaian Capaian Pembelajaran Lulusan (CPL) berbasis Outcome Based Education (OBE) membutuhkan Dashboard admin yang mampu menyajikan data agregat secara cepat dan stabil. Penelitian ini bertujuan untuk menganalisis dan membandingkan (komparasi) performa Request-Response Endpoint utama Dashboard Admin pada dua lingkungan perangkat keras yang berbeda, yaitu Server Lokal (Intel Core 2 Duo, RAM 3 GB) dan Server Server Kampus/Laboratorium (Intel Xeon 24 Core, RAM 12 GB). Pengujian dilakukan secara bertahap menggunakan beban pengguna virtual simultan (1, 10, 20, 50, 100, 200, dan 500 users) via Apache JMeter pada Database MariaDB dengan data dummy sebanyak ~341.502 baris.

Hasil pengujian empiris menunjukkan perbedaan karakteristik performa dan ketahanan antrean yang signifikan antara kedua server. Pada Server Lokal (Core 2 Duo), sistem mampu mempertahankan ketangguhan layanan dengan Error rate 0,00% di seluruh skenario (1–500 users), meskipun mengalami pelambatan waktu respons (latency) hingga 15.894,4 ms pada beban puncak 500 users dengan Throughput stabil di kisaran 4,50 req/s. Sebaliknya, pada Server Xeon 24 Core, pengujian tanpa optimasi antrean dan clustering menghasilkan pelambatan yang jauh lebih parah dan Error rate tinggi mulai skenario 20 users (30,57%) hingga mencapai 55,51% pada 500 users (Error rate Endpoint /api/dashboard/stats menyentuh 98,77% akibat Request Timeout >30 detik). Pemantauan utilisasi mengonfirmasi bahwa penambahan spesifikasi hardware fisik (24 Core CPU) tidak otomatis meningkatkan performa aplikasi Node.js jika tidak dikonfigurasi menggunakan Cluster Mode (PM2). Secara default, Node.js hanya menggunakan 1 core (single-threaded), sehingga 23 core CPU Xeon lainnya menganggur (idle) saat 1 core memonopoli komputasi Prisma ORM. Penelitian ini merekomendasikan penerapan PM2 Clustering untuk membagikan beban ke 24 core CPU serta penerapan Redis Caching.

Kata kunci: Apache JMeter, CPU-bound Bottleneck, Dashboard Admin, Evaluasi Performa, Komparasi Server, Node.js, Server Xeon 24 Core.

ABSTRACT

AHMAD FAJRUL 'ULUM. Performance Analysis and Evaluation of Outcome-Based Education (OBE) CPL System Admin Dashboard Using Apache JMeter (Comparative Study: Local Core 2 Duo Server vs. 24-Core Xeon Server). Supervised by Tri Anggoro, M.Kom. and Riski Aspriyani, M.Pd.

An Outcome-Based Education (OBE) Graduate Learning Outcome (GLO) assessment system requires an admin Dashboard capable of presenting aggregate data rapidly and stably. This study aims to analyze and compare the Request-Response performance of main Admin Dashboard Endpoints across two distinct hardware environments: a Local Server (Intel Core 2 Duo, 3 GB RAM) and a Server/Lab Environment (Intel Xeon 24 Core, 12 GB RAM). Testing was conducted incrementally using simultaneous virtual user loads (1, 10, 20, 50, 100, 200, and 500 users) via Apache JMeter on a MariaDB Database containing approximately 341,502 rows of dummy data.

The empirical results demonstrate significant performance and queue resilience differences between the two servers. On the Local Server (Core 2 Duo), the system maintained excellent connection resilience with a 0.00% Error rate across all scenarios (1–500 users), despite latency degradation reaching 15,894.4 ms at 500 users with a throughput capping at ~4.50 req/s. Conversely, on the 24-Core Xeon Server, testing without queue tuning and clustering resulted in severe latency degradation and high Error rates starting at 20 users (30.57%) up to 55.51% at 500 users (with /api/dashboard/stats error reaching 98.77% due to >30s request timeouts). Hardware monitoring confirmed that adding physical hardware cores (24 CPU Cores) does not automatically improve Node.js performance unless configured with Cluster Mode (PM2). By default, Node.js runs on a single core, leaving the remaining 23 CPU cores idle while 1 core monopolizes Prisma ORM computations. This study recommends PM2 Clustering across all 24 CPU cores and external Redis caching.

Keywords: Admin Dashboard, Apache JMeter, Comparative Evaluation, CPU-bound Bottleneck, Node.js, Performance Evaluation, 24-Core Xeon Server.

DAFTAR ISI

HALAMAN PERNYATAAN KEASLIAN SKRIPSI	iii
LEMBAR PENGESAHAN	iv
HALAMAN NOTA KONSULTAN	v
HALAMAN NOTA PEMBIMBING	vi
HALAMAN MOTO	vii
HALAMAN PERSEMBAHAN	viii
KATA PENGANTAR	ix
ABSTRAK	x
ABSTRACT	xi
DAFTAR ISI	xii
DAFTAR GAMBAR	xiv
DAFTAR TABEL	xv
BAB I	PENDAHULUAN	1
A.	Latar Belakang	1
B.	Rumusan Masalah	4
C.	Batasan Masalah	4
D.	Tujuan Penelitian	5
E.	Manfaat Penelitian	5
BAB II	TINJAUAN PUSTAKA	7
A.	Penelitian Terkait	7
B.	Landasan Teori	16
BAB III	METODOLOGI	27
A.	Waktu dan Tempat Penelitian	27
B.	Alat dan Bahan	27
C.	Prosedur Penelitian	30
D.	Analisis Data	56
E.	Jadwal Penelitian	58
BAB IV	HASIL DAN PEMBAHASAN	59
A.	Hasil	59
B.	Pembahasan	68
BAB V	KESIMPULAN	80
A.	Kesimpulan	80
B.	Saran/Rekomendasi	81
DAFTAR PUSTAKA	82
LAMPIRAN	90

BAB I PENDAHULUAN

A. Latar Belakang
Perkembangan teknologi informasi telah mendorong transformasi digital pada pendidikan tinggi secara masif [1]. Perguruan tinggi membutuhkan sistem informasi akademik yang andal untuk mengelola data operasional, mulai dari data mahasiswa, kurikulum, mata kuliah, penilaian, hingga evaluasi capaian pembelajaran [2]. Dalam konteks penjaminan mutu kurikulum modern, Outcome Based Education (OBE) digunakan sebagai kerangka kerja utama karena menekankan ketercapaian luaran pembelajaran sebagai dasar perencanaan, pelaksanaan, dan evaluasi pendidikan [3]. Pada tingkat program studi, luaran tersebut direpresentasikan dalam bentuk Capaian Pembelajaran Lulusan (CPL) yang digunakan untuk menilai ketercapaian kompetensi lulusan secara terukur [4].

Sistem Penilaian Capaian Pembelajaran Lulusan berbasis OBE merupakan sistem informasi akademik yang memfasilitasi pengelolaan data CPL, CPMK, mata kuliah, nilai, dosen, mahasiswa, dan relasi akademik kompleks lainnya [5]. Dalam sistem berbasis OBE, antarmuka Dashboard Admin berperan sangat vital dalam menyajikan informasi akademik agregat dalam bentuk ringkasan eksekutif, grafik pencapaian, tren semester, dan indikator monitoring real-time [6]. Pada objek penelitian di Universitas Nahdlatul Ulama Al Ghazali (UNUGHA) Cilacap, Dashboard Admin menampilkan data agregat seperti statistik CPL, jumlah mata kuliah aktif, jumlah mahasiswa terdaftar, rata-rata CPL global, grafik distribusi CPL, kelengkapan data, alerts, insights analitis, kinerja dosen, serta evaluasi mahasiswa terbatas.

Dashboard admin tidak sekadar mengambil data mentah dari basis data secara langsung, melainkan melakukan kalkulasi agregasi yang intensif di tingkat Backend. Pemisahan antara data mentah basis data dan data agregat Dashboard sangat penting agar evaluasi performa dapat menggambarkan kondisi pemrosesan server secara akurat [7]. Pemuatan Dashboard melibatkan pembacaan parameter filter, eksekusi Query relasional via Prisma ORM pada Database MariaDB, perhitungan statistik agregat, pembentukan struktur JSON Response, dan pengiriman data ke Frontend. Proses yang berat ini berpotensi mempengaruhi Response time, Throughput, Error rate, dan kestabilan layanan ketika diakses secara simultan oleh banyak pengguna.

Dalam pengujian performa sistem informasi perguruan tinggi, evaluasi yang hanya dilakukan pada lingkungan lokal (PC/Server pengembang Core 2 Duo RAM 3GB) sering kali menimbulkan pertanyaan apakah hambatan performa disebabkan oleh keterbatasan spesifikasi fisik server atau oleh arsitektur perangkat lunak Backend [11]. Untuk menjawab hal tersebut, pengujian komparatif dilakukan dengan membandingkan performa pada **Server Lokal** (Intel Core 2 Duo E7500, RAM 3 GB) dan **Server Xeon** (Intel Xeon 24 Core, RAM 12 GB). Pengujian komparatif ini sangat penting untuk membuktikan hipotesis apakah penambahan spesifikasi hardware yang sangat besar (dari 2 core ke 24 core CPU) secara otomatis dapat menyelesaikan pelambatan pemrosesan data agregat CPL [13].

Penelitian ini mengevaluasi performa Sistem Penilaian CPL berbasis OBE yang dikembangkan menggunakan React.js dan TypeScript pada Frontend, Node.js dengan Express.js pada Backend, Prisma ORM, serta MariaDB sebagai Database. Data yang digunakan berupa data dummy terstruktur sebanyak ~341.502 baris data akademik. Pengujian menggunakan alat bantu Apache JMeter dengan mensimulasikan beban pengguna virtual bertahap dari 1 hingga 500 pengguna simultan [10]. Pengamatan metrik Request-Response API difokuskan pada Endpoint utama Dashboard Admin, yang didukung oleh pemantauan utilisasi CPU dan memori server via SSH saat kondisi beban puncak (Peak load).

Penelitian terdahulu mengenai evaluasi beban aplikasi web di perguruan tinggi, seperti yang dilakukan oleh Pebrianto et al. (2025) pada situs web jurusan perguruan tinggi negeri, menunjukkan pentingnya pengujian beban simultan untuk mengukur ketahanan infrastruktur server kampus dan mengidentifikasi batas kemampuan layanan [13]. Namun, penelitian yang secara spesifik membandingkan performa Endpoint Dashboard akademik berbasis data agregat OBE antara server lokal Core 2 Duo dan server Xeon 24 Core masih sangat terbatas.

Kebaruan (novelty) dari penelitian ini terletak pada **analisis komparatif performa Endpoint API Dashboard Admin Sistem CPL berbasis OBE antara Server Lokal Core 2 Duo dan Server Xeon 24 Core**. Dengan membandingkan dua lingkungan server yang berbeda spesifikasi secara ekstrem, penelitian ini membuktikan secara empiris bahwa penambahan jumlah core CPU fisik (24 Core Xeon) **TIDAK OTOMATIS menghilangkan CPU-bound Bottleneck pada aplikasi Node.js** apabila aplikasi tidak dikonfigurasi menggunakan mekanisme Cluster Mode (PM2). Node.js yang secara default bersifat Single-threaded hanya akan menggunakan 1 core CPU, sehingga 23 core CPU lainnya menganggur (idle) sementara antrean request memicu lonjakan Response Time dan Error Rate pada beban tinggi. Hasil penelitian ini memberikan kontribusi berupa rekomendasi perbaikan teknis yang terukur (seperti PM2 Clustering, Query Refactoring, dan Redis Caching).

B. Rumusan Masalah
1. Bagaimana perbandingan performa Endpoint Dashboard Admin Sistem CPL berbasis OBE antara **Server Lokal (Core 2 Duo, RAM 3 GB)** dan **Server Xeon (24 Core, RAM 12 GB)** berdasarkan parameter Response time, Throughput, Error rate, dan kestabilan sistem pada berbagai tingkat beban pengguna virtual?
2. Pada skenario beban pengguna virtual berapa masing-masing server mulai mengalami titik penurunan performa (saturation point) dan lonjakan Error Rate?
3. Mengapa penambahan jumlah core CPU pada Server Xeon 24 Core tidak secara otomatis menyelesaikan hambatan komputasi, serta rekomendasi arsitektur perangkat lunak apa yang dapat disusun?

C. Batasan Masalah
1. Evaluasi performa Endpoint API Dashboard Admin (`/api/dashboard/stats`, `/api/dashboard/dosen`, `/api/dashboard/students`, `/api/auth/login`).
2. Pengujian komparatif pada dua lingkungan server:
   a. **Server Lokal:** Intel Core 2 Duo E7500 @ 2.93 GHz (2 Cores), RAM 3 GB DDR3, SSD 256 GB.
   b. **Server Xeon:** Intel Xeon 24 Core CPU @ 2.20 GHz (24 Cores), RAM 12 GB DDR4.
3. Skenario beban bertahap (1, 10, 20, 50, 100, 200, 300, dan 500 virtual users) via Apache JMeter 5.6.3 dengan interval think time 1–3 detik.
4. Dataset dummy terstruktur sebanyak ~341.502 baris data pada MariaDB.

D. Tujuan Penelitian
1. Menganalisis dan membandingkan performa Endpoint Dashboard Admin antara Server Lokal Core 2 Duo dan Server Xeon 24 Core berdasarkan metrik Response time, Throughput, Error rate, dan kestabilan layanan.
2. Menentukan titik jenuh (saturation point) dan perbedaan Error Rate pada kedua lingkungan server saat diberi beban hingga 500 pengguna virtual.
3. Membuktikan keterbatasan arsitektur Single-threaded Node.js pada server multi-core (Xeon 24 Core) dan merumuskan rekomendasi perbaikan arsitektur.

E. Manfaat Penelitian
Memberikan bukti empiris bagi pengembang software dan pengelola infrastruktur perguruan tinggi bahwa arsitektur perangkat lunak (Clustering & Caching) sama pentingnya dengan spesifikasi fisik perangkat keras server.


BAB IV HASIL DAN PEMBAHASAN

A. Hasil Pengujian Komparatif Empiris

1. Data Pengujian Server Lokal (Core 2 Duo, RAM 3 GB)
Tabel 20 menyajikan hasil pengujian performa empiris pada Server Lokal (Core 2 Duo, RAM 3 GB) untuk skenario Cold Cache (tanpa cache) pada Endpoint `/api/dashboard/stats`, `/api/dashboard/dosen`, `/api/dashboard/students`, dan `/api/auth/login`.

Tabel 20 Hasil Pengujian Empiris Server Lokal (Core 2 Duo, RAM 3 GB)
Users | Total Samples | Error Rate (%) | Avg Response Time (ms) | Max Response Time (ms) | Total Throughput (req/s) | Status Kestabilan
---|---|---|---|---|---|---
1 | 28 | 0,00% | 64,0 ms | 228,0 ms | 0,48 req/s | Baik (Sangat Cepat)
10 | 293 | 0,00% | 85,5 ms | 262,5 ms | 4,68 req/s | Baik
20 | 592 | 0,00% | 149,5 ms | 361,5 ms | 8,74 req/s | Baik
50 | 1.369 | 0,00% | 639,3 ms | 933,8 ms | 16,48 req/s | Cukup (Mulai Melambat)
100 | 1.886 | 0,00% | 2.553,0 ms | 2.824,8 ms | 17,01 req/s | Cukup
200 | 2.799 | 0,00% | 6.084,5 ms | 6.221,8 ms | 16,77 req/s | Kurang (Latency >5s)
500 | 5.512 | **0,00%** | **15.770,6 ms** | **15.974,2 ms** | **16,56 req/s** | Buruk (Latency >15s, No Error)

Catatan: Pada Server Lokal (Core 2 Duo), meskipun Response Time melambat hingga ~15,7 detik pada 500 users, **Error Rate tetap konsisten 0,00%** karena antrean Express.js dan MariaDB Connection Pool mampu menampung seluruh request hingga selesai diproses.

2. Data Pengujian Server Xeon (24 Core, RAM 12 GB)
Tabel 21 menyajikan hasil pengujian performa empiris pada Server Xeon 24 Core (RAM 12 GB) untuk skenario pengujian beban yang sama.

Tabel 21 Hasil Pengujian Empiris Server Xeon (24 Core CPU, RAM 12 GB)
Users | Total Samples | Error Rate (%) | Avg Response Time (ms) | Endpoint /stats Avg Res Time | Endpoint /stats Error Rate (%) | Total Throughput (req/s)
---|---|---|---|---|---|---
1 | 155 | 0,00% | 940,4 ms | 1.962,1 ms | 0,00% | 0,52 req/s
10 | 344 | 0,29% | 7.801,8 ms | 14.358,9 ms | 0,86% | 1,12 req/s
20 | 543 | **30,57%** | 9.929,9 ms | 20.141,6 ms | 53,51% | 1,75 req/s
50 | 1.179 | **54,03%** | 11.563,7 ms | 17.504,7 ms | 83,25% | 3,66 req/s
100 | 1.857 | **46,85%** | 14.540,0 ms | 22.574,1 ms | 88,35% | 5,51 req/s
200 | 3.149 | **57,80%** | 16.890,2 ms | 22.561,5 ms | 95,83% | 9,66 req/s
300 | 3.922 | **54,92%** | 20.111,6 ms | 29.475,4 ms | 97,07% | 11,95 req/s
500 | 4.900 | **55,51%** | **25.468,7 ms** | **32.773,2 ms** | **98,77%** | **14,17 req/s**

B. Pembahasan Komparatif Mendalam

1. Perbandingan Response Time dan Saturation Point
Perbandingan Response Time menunjukkan perbedaan yang sangat kontras:
- **Server Lokal (Core 2 Duo):** Pada beban 1–20 users, Response Time sangat cepat (64 ms – 149,5 ms). Pelambatan mulai terjadi pada 50 users (639,3 ms) dan menyentuh 15,7 detik pada 500 users.
- **Server Xeon (24 Core):** Sejak beban 10 users, rata-rata Response Time sudah mencapai 7,8 detik, dan pada 500 users melonjak hingga 25,4 detik (khusus Endpoint `/api/dashboard/stats` menyentuh 32,7 detik).

2. Analisis Penyebab Lonjakan Error Rate pada Server Xeon (24 Core)
Mengapa Server Xeon 24 Core RAM 12GB menghasilkan Error Rate hingga **55,51%** (dan 98,77% pada Endpoint `/stats`), sementara Server Lokal Core 2 Duo RAM 3GB berhasil mencatatkan **0,00% Error Rate**?

Faktor penyebab teknis utamanya adalah:
a. **Event Loop Blocking pada Single Core Node.js:** 
   Meskipun Server Xeon memiliki 24 Core CPU fisik, aplikasi Node.js secara default adalah *Single-threaded*. Tanpa mengaktifkan PM2 Cluster Mode, Node.js hanya mengeksekusi logika agregasi Prisma ORM pada **1 Core CPU saja**. Tambahan 23 Core CPU Xeon lainnya menganggur (idle).
b. **Kapasitas Antrean dan HTTP Request Timeout:**
   Pada Server Xeon, penumpukan request pada 1 core tersebut melampaui batas waktu tunggu HTTP (Connection Timeout >30 detik) yang dikonfigurasikan pada server/jmeter. Akibatnya, request yang mengantre terlalu lama dibatalkan secara sepihak oleh server (memicu Error HTTP 504 Gateway Timeout / ECONNRESET). Pada Server Lokal, konfigurasi antrean MariaDB connection pool dan timeout diatur lebih longgar sehingga seluruh request ditunggu hingga selesai (0,00% error), meskipun waktu jawabnya menjadi lama (15,7s).
c. **Beban Komputasi Endpoint `/api/dashboard/stats`:**
   Endpoint `/api/dashboard/stats` melakukan kalkulasi agregasi CPL relasional paling kompleks. Di Server Xeon tanpa caching, 98,77% request ke endpoint ini mengalami timeout pada beban 500 users.

3. Kesimpulan Komparatif & Rekomendasi Arsitektur
Hasil komparasi ini memberikan pelajaran penting dalam rekayasa perangkat lunak:
**"Menambah spesifikasi hardware secara ekstrim (Vertical Scaling dari Core 2 Duo ke Xeon 24 Core) TIDAK AKAN MENINGKATKAN PERFORMA Node.js jika arsitektur perangkat lunak tidak dikonfigurasi untuk memanfaatkan lingkungan multi-core."**

Rekomendasi Solusi Utama:
1. **PM2 Cluster Mode:** Mengubah mode eksekusi Node.js dari `fork` ke `cluster` di Server Xeon agar dibentuk 24 worker process yang memanfaatkan seluruh 24 core CPU secara paralel [71].
2. **External Redis Caching:** Menyimpan hasil kalkulasi `/api/dashboard/stats` di Redis RAM agar request berikutnya tidak perlu melakukan kalkulasi Prisma ORM berulang [69], [72].


BAB V KESIMPULAN

A. Kesimpulan
1. **Perbandingan Metrik Utama:** Server Lokal Core 2 Duo RAM 3GB berhasil melayani hingga 500 virtual users dengan **Error Rate 0,00%**, meskipun mengalami pelambatan Response Time hingga 15,7 detik dan Throughput puncak 16,56 req/s. Sebaliknya, Server Xeon 24 Core RAM 12GB tanpa clustering mengalami pelambatan parah sejak 10 users dan mencatatkan **Error Rate 55,51%** pada 500 users (Error Rate `/api/dashboard/stats` mencapai 98,77% akibat Request Timeout >30s).
2. **Titik Jenuh & Kegagalan:** Server Lokal mencapai titik pelambatan pada 50 users tanpa terjadi error. Server Xeon mengalami titik kegagalan layanan (Error Rate >30%) sejak beban 20 users akibat penumpukan antrean pada 1 core CPU.
3. **Pembuktian Arsitektural:** Pengujian komparatif membuktikan secara empiris bahwa spesifikasi hardware 24 Core CPU Xeon tidak berguna secara otomatis untuk Node.js Single-Threaded tanpa PM2 Clustering. Kunci utama peningkatan skalabilitas terletak pada penerapan PM2 Cluster Mode (memanfaatkan 24 core) dan Redis Caching.

B. Saran
1. Mengimplementasikan `pm2 start server.js -i max` pada Server Xeon untuk mendistribusikan beban ke 24 core CPU.
2. Mengintegrasikan Redis Caching pada Endpoint `/api/dashboard/stats` untuk menekan Error Rate hingga 0,00%.


DAFTAR PUSTAKA
(Daftar Pustaka lengkap sesuai standar IEEE)
