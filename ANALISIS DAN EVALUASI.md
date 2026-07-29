 

ANALISIS DAN EVALUASI PERFORMA DASHBOARD ADMIN SISTEM CPL BERBASIS OBE MENGGUNAKAN APACHE JMETER



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



SKRIPSI
Diajukan untuk memenuhi sebagian persyaratan mendapatkan gelar Strata Satu Program Studi Informatika







	
AHMAD FAJRUL 'ULUM
22EO10027








PROGRAM STUDI INFORMATIKA
FAKULTAS MATEMATIKA DAN ILMU KOMPUTER
UNIVERSITAS NAHDLATUL ULAMA AL GHAZALI 
CILACAP
2026
    A. 
HALAMAN PERNYATAAN KEASLIAN SKRIPSI

Dengan ini saya menyatakan bahwa penulisan skripsi dengan judul “ANALISIS DAN EVALUASI PERFORMA DASHBOARD ADMIN SISTEM CPL BERBASIS OBE MENGGUNAKAN APACHE JMETER” adalah hasil karya saya dengan arahan dari pembimbing dan belum diajukan kepada pihak manapun. Sumber informasi yang dikutip dalam skripsi ini telah dicantumkan dalam Daftar Pustaka.
Demikian pernyataan ini dibuat dengan sebenarnya. Apabila di kemudian hari terdapat ketidaksesuaian dalam pernyataan ini, maka saya bersedia menerima sanksi sesuai dengan peraturan yang berlaku.

Cilacap, Juni 2026


Ahmad Fajrul ‘Ulum
22EO10027

LEMBAR PENGESAHAN

Skripsi Saudara			
Nama	:	Ahmad Fajrul ‘Ulum
NIM	:	22EO10027
Fakultas/Prodi	:	Fakultas MIKOM / Informatika
Judul	:	ANALISIS DAN EVALUASI PERFORMA DASHBOARD ADMIN SISTEM CPL BERBASIS OBE MENGGUNAKAN APACHE JMETER

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



Nama
NIDN		


Nama
NIDN

Pembimbing I


Nama
NIDN	
	
Pembimbing II


Nama
NIDN

Mengetahui,
Dekan Fakultas Matematika dan Ilmu Komputer


H. Edy Sulistiyanto,S.H., M.Kom.
NIDN. 0613065801

HALAMAN NOTA KONSULTAN
Nama Dosen

Dosen Fakultas Matematika dan Ilmu Komputer
Universitas Nahdlatul Ulama Al Ghazali Cilacap

NOTA KONSULTAN
Hal  		: Skripsi Saudara/i Nama Mahasiswa
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
Judul	: Analisis Dan Evaluasi Performa Dashboard Admin Sistem Cpl Berbasis Obe Menggunakan Apache JMeter

Dapat diajukan ke Fakultas Matematika dan Ilmu Komputer, Universitas Nahdlatul Ulama Al Ghazali Cilacap untuk memenuhi syarat memperoleh gelar Strata Satu (S1). 
Wassalamu’alaikum Wr. Wb.

Cilacap, Hari Juli 2026
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
Judul 		: Analisis Dan Evaluasi Performa Dashboard Admin Sistem Cpl Berbasis Obe Menggunakan Apache JMeter

Kami berpendapat bahwa skripsi tersebut sudah dapat diajukan ke sidang skripsi.
Bersamaan ini kami kirimkan skripsi tersebut, semoga dapat segera disidangkan.

Atas perhatiannya kami ucapkan terima kasih.
Wassalamu’alaikum Wr. Wb.

Mengetahui,
Pembimbing I


Tri Anggoro, M.Kom
 0601128103	Pembimbing II


Riski Aspriyani, M.Pd
0616118901
 
HALAMAN MOTO 


“Dan jika kamu membalas, maka balaslah dengan (balasan) yang sama dengan siksaan yang ditimpakan kepadamu. TetAPI jika kamu bersabar, sesungguhnya itulah yang lebih baik bagi orang yang sabar”
(QS. An-Nahl : 126)

Pendidikan merupakan perlengkapan paling baik untuk hari tua. (Aristoteles)

HALAMAN PERSEMBAHAN

Segala puji bagi Allah SWT, Rabb semesta alam yang senantiasa memberikan karunia sehingga penulis mampu menyelesaikan penulisan skripsi ini. Karya ini saya persembahkan kepada : 
    1. Orang tua (Bapak … dan Ibu … ) yang selalu mendidik saya, memberikan do’a, dukungan, nasihat dan semangat yang tiada henti. 
    2. Kakak tercinta (nama..) adik dan saudara tersayang (nama..) yang selalu memberikan do’a dan semangat tiada henti di setiap detik langkahku.
    3. Keluarga FMIKOM Angkatan … yang selalu memberikan keceriaan, kebersamaan dan motivasi. 
    4. Keluarga program studi Informatika, Sistem Informasi, Matematika yang saya banggakan
    5. Seluruh teman UNUGHA yang telah memberikan do’a, dukungan, dan semangat.

 
KATA PENGANTAR

Puji syukur kepada Allah SWT atas segala limpahan nikmat dan karuniaNya, sehingga penulis dapat menyelesaikan penulisan skripsi. Sholawat dan salam senantiasa penulis haturkan kepada Nabi Muhammad SAW sebagai pembimbing seluruh umat manusia. 
Skripsi ini tidak akan selesai tanpa adanya bantuan dari banyak pihak, karena itu penulis menyampaikan terima kasih kepada :
    1. Bapak Drs. Edy Sulistyanto, M.Kom, Dekan FMIKOM UNUGHA
    2. Bapak Tri Anggoro, M.Kom, pembimbing I yang telah dengan sabar memberikan bimbingan dan petunjuk dalam menyelesaikan skripsi ini.
    3. Ibu Riski Aspriyani, M.Pd, pembimbing II yang telah dengan sabar memberikan bimbingan dan petunjuk dalam menyelesaikan skripsi ini.
    4. Bapak xxxx, sebagai Pembimbing Akademis
    5. (Instansi lain yang terkait dalam pelaksanaan skripsi)
    6. Bapak-Ibu dosen Program Studi …. FMIKOM UNUGHA
    7. Semua pihak yang tidak dapat kami sebutkan satu persatu
Semoga Allah SWT membalas jerih payah  dan pengorbanan yang telah diberikan dengan balasan yang lebih baik.  Amiin. Penulis berharap semoga karya kecil ini bermanfaat bagi pembaca.    
	
									Cilacap,  tanggal bulan tahun


	Ahmad Fajrul ‘Ulum

    B. 
ABSTRAK

Ahmad Fajrul 'Ulum. Analisis dan Evaluasi Performa Dashboard admin Sistem CPL Berbasis OBE Menggunakan Apache JMeter. Dibimbing oleh Bapak Tri Anggoro, M.Kom dan Ibu Riski Aspriyani, M.Pd
Sistem Penilaian Capaian Pembelajaran Lulusan (CPL) berbasis Outcome Based Education (OBE) membutuhkan Dashboard admin yang mampu menyajikan data agregat secara cepat dan stabil. Penelitian ini bertujuan untuk menganalisis dan mengevaluasi performa Request-Response tiga Endpoint utama Dashboard Admin, yaitu /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students, menggunakan Apache JMeter. Pengujian dilakukan secara bertahap menggunakan beban pengguna virtual simultan (1, 10, 20, 50, 100, 200, dan 500 users) pada Database MariaDB yang berisi data dummy sebanyak ~341.502 baris. Pemantauan utilitas perangkat keras Server juga dilakukan menggunakan utilitas Glances via SSH pada kondisi beban puncak (Peak load).  
Hasil penelitian menunjukkan bahwa sistem memiliki ketangguhan (resilience) koneksi yang sangat baik dengan Error rate yang konsisten bertahan pada angka 0,00% di seluruh skenario pengujian. Namun, degradasi performa berupa pelambatan waktu respons (latency) mulai terjadi secara signifikan sejak skenario 50 pengguna. Pada beban puncak 500 pengguna, ketiga Endpoint mengalami lonjakan waktu respons melebihi 15 detik. Endpoint /API/Dashboard/students teridentifikasi sebagai titik Bottleneck utama dengan menghasilkan Response time tertinggi mencapai 15.894,4 ms dan Throughput terendah sebesar 3,77 req/s. Hasil pemantauan Glances mengonfirmasi terjadinya CPU-bound Bottleneck, di mana proses Node.js memonopoli salah satu core prosesor hingga >101% akibat keterbatasan arsitektur Single-threaded dalam menangani kalkulasi relasional Prisma ORM pada Server berspesifikasi Intel Core 2 Duo. Penelitian ini merekomendasikan penerapan mekanisme Clustering (seperti PM2) untuk mendistribusikan beban secara paralel ke seluruh core prosesor guna meningkatkan kapasitas Throughput Server pada pengembangan sistem selanjutnya.
Kata kunci: Apache JMeter, CPU-bound Bottleneck, Clustering, Dashboard Admin, evaluasi performa, Node.js.
ABSTRACT

AHMAD FAJRUL 'ULUM. Performance Analysis and Evaluation of Outcome-Based Education (OBE) CPL System Admin Dashboard Using Apache JMeter. Supervised by Tri Anggoro, M.Kom. and Riski Aspriyani, M.Pd.  
An Outcome-Based Education (OBE) Graduate Learning Outcome (GLO) assessment system requires an admin Dashboard capable of presenting aggregate data rAPIdly and stably. This study aims to analyze and evaluate the Request-Response performance of three main Admin Dashboard Endpoints—namely /API/Dashboard/stats, /API/Dashboard/dosen, and /API/Dashboard/students—using Apache JMeter. Testing was conducted incrementally using simultaneous virtual user loads (1, 10, 20, 50, 100, 200, and 500 users) on a MariaDB Database containing approximately 341,502 rows of Dummy data. Server hardware utilization monitoring was also performed using the Glances utility via SSH during Peak load conditions.
The results indicate that the system exhibits excellent connection resilience, with the Error rate consistently remaining at 0.00% across all testing scenarios. However, performance degradation in the form of increased latency began to occur significantly starting at the 50-user scenario. At the Peak load of 500 users, all three Endpoints experienced a surge in Response time exceeding 15 seconds. The /API/Dashboard/students Endpoint was identified as the primary Bottleneck, generating the highest Response time of 15,894.4 ms and the lowest Throughput of 3.77 req/s. Monitoring results from Glances confirmed a CPU-bound Bottleneck, where the Node.js process monopolized a single processor core up to >101% due to its Single-threaded architectural limitations in handling Prisma ORM relational calculations on a Server equipped with an Intel Core 2 Duo processor. This study recommends implementing a Clustering mechanism (such as PM2) to distribute the load in parallel across all processor cores to increase Server Throughput capacity in future system development.
Keywords: Apache JMeter, CPU-bound Bottleneck, Clustering, Admin Dashboard, performance evaluation, Node.js. 
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
B.	Rumusan Masalah	3
C.	Batasan Masalah	3
D.	Tujuan Penelitian	4
E.	Manfaat Penelitian	4
BAB II	TINJAUAN PUSTAKA	6
A.	Penelitian Terkait	6
B.	Landasan Teori	14
BAB III	METODOLOGI	25
A.	Waktu dan Tempat Penelitian	25
B.	Alat dan Bahan	25
C.	Prosedur Penelitian	27
D.	Analisis Data	51
E.	Jadwal Penelitian	53
BAB IV	HASIL DAN PEMBAHASAN	55
A.	Hasil	55
B.	Pembahasan	59
BAB V	KESIMPULAN	71
A.	Kesimpulan	71
B.	Saran/Rekomendasi	72
DAFTAR PUSTAKA	73
LAMPIRAN	82

DAFTAR GAMBAR

Gambar 1 Mindmap Penelitian	13
Gambar 2 Lingkungan Pengujian	25
Gambar 3 Diagram Alir Prosedur Penelitian	28
Gambar 4 Tampilan Dashboard Admin Sistem CPL	31
Gambar 5  Activity Diagram Pengujian Performa	38
Gambar 6 Sequence Diagram Pengujian Performa	42
Gambar 7 Jadwal Penelitian	54
Gambar 8 Hasil Pemantauan Glances pada Skenario Pengujian 500 Pengguna Virtual	58

DAFTAR TABEL

Tabel 1 Rangkuman Penelitian Terdahulu	6
Tabel 2 Bentuk Data	16
Tabel 3 Alat Penelitian	26
Tabel 4 Skenario Pengujian	29
Tabel 5 Endpoint	31
Tabel 6 Ringkasan Data Dummy Sistem CPL	32
Tabel 7 Karakteristik Data yang Diproses oleh Endpoint Dashboard Admin	33
Tabel 8 Keterlibatan Tabel Database pada Endpoint Dashboard Admin	34
Tabel 9 Kelompok Data Agregat dan Kontrol Dashboard Admin	35
Tabel 10 Spesifikasi Lingkungan Pengujian	40
Tabel 11 Konfigurasi Apache JMeter	41
Tabel 12 Skenario Pengujian Performa	43
Tabel 13 Parameter Analisis Performa	45
Tabel 14 Kriteria Operasional Evaluasi Performa	46
Tabel 15 Kriteria Identifikasi Dugaan Bottleneck Berdasarkan Hasil Pengujian	48
Tabel 16 Karakteristik Teknis Endpoint yang Dianalisis	49
Tabel 17 Arah Rekomendasi Perbaikan	50
Tabel 18 Hasil Pengujian dan Kategori Performa Endpoint /API/Dashboard/stats	55
Tabel 19 Hasil Pengujian dan Kategori Performa Endpoint /API/Dashboard/dosen	56
Tabel 20 Hasil Pengujian dan Kategori Performa Endpoint /API/Dashboard/students	57
Tabel 21 Ringkasan Hasil Pemantauan CPU dan Memori Server	58
Tabel 22 Ringkasan Hasil Pengujian Response time	60
Tabel 23 Ringkasan Hasil Pengujian Throughput	61
Tabel 24 Ringkasan Hasil Pengujian Error rate	62
Tabel 25 Ringkasan Analisis Kestabilan Sistem	63
Tabel 26 Dugaan Bottleneck Berdasarkan Hasil Pengujian	66
Tabel 27 Rekomendasi Perbaikan Berdasarkan Dugaan Bottleneck	67




    BAB I PENDAHULUAN

    A. Latar Belakang
Perkembangan teknologi informasi telah mendorong transformasi digital pada pendidikan tinggi [1]. Perguruan tinggi membutuhkan sistem informasi untuk mengelola data akademik secara terstruktur, mulai dari data mahasiswa, kurikulum, mata kuliah, penilaian, hingga evaluasi capaian pembelajaran [2]. Dalam konteks tersebut, Outcome Based Education atau OBE digunakan karena menekankan ketercapaian luaran pembelajaran sebagai dasar perencanaan dan evaluasi pendidikan [3]. Pada tingkat program studi, luaran tersebut direpresentasikan dalam bentuk Capaian Pembelajaran Lulusan atau CPL yang digunakan untuk menilai ketercapaian kompetensi lulusan [4].
Sistem Penilaian Capaian Pembelajaran Lulusan berbasis OBE merupakan sistem informasi akademik yang membantu pengelolaan data CPL, CPMK, mata kuliah, nilai, dosen, mahasiswa, dan relasi akademik lainnya [5]. Dalam sistem seperti ini, Dashboard berperan menyajikan informasi akademik dalam bentuk ringkasan, grafik, tren, dan indikator monitoring [6]. Pada objek penelitian, Dashboard admin menampilkan data agregat seperti statistik CPL, jumlah mata kuliah aktif, jumlah mahasiswa, rata-rata CPL global, grafik CPL, tren semester, kelengkapan data, alerts, insights, analisis dosen, evaluasi mahasiswa terbatas, serta Filter Dashboard.
Dashboard admin tidak mengambil seluruh data mentah dari Database secara langsung, tetAPI menampilkan hasil pengolahan Backend dalam bentuk ringkasan dan agregasi. Pemisahan antara data mentah Database dan data agregat Dashboard penting agar evaluasi performa tidak keliru, karena Dashboard berbasis data agregat memiliki karakteristik pemrosesan yang berbeda dengan halaman web sederhana [7]. Proses pemuatan Dashboard melibatkan pembacaan parameter Filter, akses data melalui Prisma ORM, Query ke MariaDB, perhitungan agregat, penyusunan Response, dan pengiriman data ke Frontend. Proses tersebut dapat memengaruhi Response time, Throughput, Error rate, dan kestabilan sistem ketika Endpoint diakses secara simultan. Selain itu, peningkatan beban pemrosesan juga dapat tercermin dari perubahan penggunaan sumber daya Server, seperti CPU dan memori, yang diamati sebagai indikator pendukung selama proses pengujian [8].
Sistem yang menjadi objek penelitian ini adalah Sistem Penilaian CPL berbasis OBE yang dikembangkan di lingkungan Universitas Nahdlatul Ulama Al Ghazali Cilacap. Sistem menggunakan React.js dan TypeScript pada Frontend, Node.js dengan Express.js pada Backend, Prisma ORM, serta MariaDB sebagai Database. Data yang digunakan berupa data dummy karena sistem belum digunakan secara nyata dalam proses akademik. Data dummy digunakan sebagai konteks skala data sistem, bukan untuk menilai validitas akademik perhitungan CPL.
Permasalahan performa perlu dikaji karena Dashboard admin berpotensi diakses secara simultan atau diproses berulang ketika pengguna menggunakan Filter tertentu. Apabila Endpoint Dashboard membutuhkan waktu lama untuk menghasilkan Response, proses monitoring akademik dapat menjadi kurang efektif dan pengambilan keputusan berbasis data dapat terhambat [9]. Oleh karena itu, diperlukan evaluasi performa untuk mengetahui kemampuan Endpoint Dashboard Admin dalam menangani Request pengguna secara simultan. Evaluasi dilakukan melalui pengukuran metrik performa Endpoint dan didukung oleh pengamatan penggunaan CPU serta memori Server untuk membantu menginterpretasikan perubahan performa yang terjadi selama pengujian.
Evaluasi performa sistem berbasis web dilakukan melalui pengujian performa pada berbagai tingkat beban pengguna. Salah satu perangkat lunak yang banyak digunakan untuk tujuan tersebut adalah Apache JMeter [10]. Pengujian performa dilakukan untuk mengamati kemampuan sistem pada beban pengguna bertahap, sedangkan Stress testing digunakan untuk mengetahui perilaku sistem pada beban tinggi [11]. Dalam penelitian ini, Apache JMeter digunakan untuk menyimulasikan pengguna virtual dan mengirim Request HTTP/API ke Endpoint Dashboard admin [12]. Pengujian difokuskan pada performa Request-Response Endpoint yang menghasilkan data agregat dari Backend, bukan pada rendering React, tampilan Frontend, atau seluruh fitur sistem. Selain metrik performa yang dihasilkan Apache JMeter, penelitian ini juga mengamati penggunaan CPU dan memori Server selama pelaksanaan setiap skenario sebagai indikator pendukung dalam analisis performa Endpoint
Penelitian sebelumnya telah membahas implementasi OBE, Dashboard akademik, dan pengujian performa aplikasi web. Namun, kajian yang secara khusus mengevaluasi performa Dashboard admin Sistem CPL berbasis OBE sebagai Endpoint penghasil data agregat dari Backend masih terbatas. Banyak penelitian OBE berfokus pada implementasi kurikulum, sistem monitoring capaian pembelajaran, atau penyajian Dashboard, sedangkan penelitian Performance testing umumnya menguji aplikasi web secara umum tanpa menyoroti karakteristik Dashboard akademik berbasis data agregat [13].
Menjawab keterbatasan tersebut, kebaruan penelitian ini terletak pada evaluasi performa Endpoint API Dashboard Admin Sistem CPL berbasis OBE secara spesifik. Pengujian menggunakan metrik Response time, Throughput, dan Error rate yang didukung dengan observasi utilitas CPU serta memori (RAM) melalui utilitas Glances via Secure Shell (SSH). Data utilitas perangkat keras direkam pada kondisi beban puncak (Peak load) untuk setiap skenario, guna memperkuat analisis dugaan Bottleneck dari sisi pemrosesan Backend maupun kapasitas sumber daya Server.
Berdasarkan uraian tersebut, penelitian ini penting dilakukan untuk mengetahui kemampuan Endpoint Dashboard Admin Sistem CPL berbasis OBE dalam menangani Request pengguna secara simultan. Hasil penelitian diharapkan menunjukkan perubahan performa pada setiap skenario pengujian, pola penggunaan CPU dan memori selama Endpoint diproses, titik awal penurunan performa, indikasi dugaan Bottleneck, serta rekomendasi perbaikan teknis secara terukur.
    B. Rumusan Masalah
Berdasarkan permasalahan yang telah diuraikan pada latar belakang, maka rumusan masalah dalam penelitian ini adalah sebagai berikut:
    1. Bagaimana performa Endpoint Dashboard Admin Sistem CPL berbasis OBE berdasarkan parameter Response time, Throughput, Error rate, dan kestabilan sistem pada berbagai tingkat beban pengguna?
    2. Pada skenario beban pengguna berapa Endpoint Dashboard admin mulai menunjukkan penurunan performa secara signifikan?
    3. Faktor teknis apa yang diduga berkontribusi terhadap munculnya indikasi Bottleneck pada Endpoint Dashboard Admin, serta rekomendasi perbaikan apa yang dapat disusun berdasarkan hasil pengujian?
    C. Batasan Masalah
Agar penelitian dapat dilakukan secara lebih terarah dan sesuai dengan ruang lingkup skripsi, maka penelitian ini memiliki beberapa batasan sebagai berikut:
    1. Penelitian difokuskan pada evaluasi performa Endpoint API Dashboard Admin Sistem CPL berbasis OBE, yang meliputi Endpoint /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students.
    2. Pengujian dilakukan menggunakan data dummy yang disusun untuk merepresentasikan struktur, relasi, volume, dan karakteristik data pada kondisi operasional Sistem CPL.
    3. Evaluasi performa dilakukan menggunakan Apache JMeter pada berbagai skenario beban pengguna dengan parameter pengukuran meliputi Response time, Throughput, Error rate, dan kestabilan sistem.
    4. Pengujian dilakukan pada lingkungan Server yang telah ditentukan tanpa membandingkan performa dengan Server, infrastruktur, maupun aplikasi lain.
    5. Pemantauan utilisasi CPU dan memori Server dilakukan menggunakan utilitas Glances via SSH, dengan teknik perekaman data melalui tangkapan layar pada kondisi beban puncak (Peak load). Data ini berfungsi sebagai indikator pendukung dalam analisis teknis dugaan Bottleneck.
    6. Penelitian ini berfokus pada pengujian empiris, sehingga tidak mencakup code profiling mendalam, tracing Query secara real-time, maupun implementasi optimasi kode sumber sistem secara langsung.
    D. Tujuan Penelitian
Berdasarkan rumusan masalah yang telah dijelaskan, maka tujuan penelitian ini adalah sebagai berikut:
    1. Menganalisis performa Endpoint Dashboard Admin berdasarkan metrik Response time, Throughput, dan Error rate pada berbagai tingkat beban pengguna, dengan dukungan data utilitas CPU serta memori Server saat beban puncak.
    2. Menentukan skenario beban pengguna yang menyebabkan Endpoint Dashboard admin mulai mengalami penurunan performa secara signifikan.
    3. Mengidentifikasi indikasi dugaan Bottleneck pada Endpoint Dashboard Admin dan menyusun rekomendasi untuk meningkatkan performa sistem berdasarkan hasil pengujian.
    E. Manfaat Penelitian
        1. Manfaat Teoritis
Penelitian ini diharapkan dapat memberikan kontribusi dalam pengembangan ilmu pengetahuan, khususnya pada bidang rekayasa perangkat lunak dan pengujian performa sistem. Adapun manfaat teoritis dari penelitian ini adalah:
    a. Menambah referensi mengenai evaluasi performa aplikasi web berbasis Outcome Based Education.
    b. Memberikan contoh penerapan Load testing dan Stress testing pada sistem akademik berbasis web.
    c. Memperkuat pemahaman mengenai hubungan antara peningkatan beban pengguna dan performa Endpoint Dashboard.
    d. Menjadi acuan bagi penelitian lanjutan yang membahas Bottleneck pada Dashboard akademik berbasis data agregat.
        2. Manfaat Praktis
Penelitian ini diharapkan memberikan manfaat langsung bagi berbagai pihak yang terkait dengan pengembangan dan penggunaan sistem. Manfaat praktis dari penelitian ini adalah sebagai berikut:
    a. Bagi peneliti, penelitian ini dapat meningkatkan pemahaman dalam melakukan evaluasi performa sistem menggunakan Apache JMeter.
    b. Bagi pengembang sistem, penelitian ini dapat memberikan bahan evaluasi mengenai bagian sistem yang berpotensi mengalami Bottleneck.
    c. Bagi program studi atau instansi, penelitian ini dapat memberikan gambaran awal mengenai kesiapan performa Dashboard admin sebelum sistem digunakan secara lebih luas.
    d. Bagi pengguna sistem, penelitian ini dapat mendukung peningkatan kualitas layanan Dashboard pada pengembangan sistem berikutnya.
    e. Bagi pengembangan sistem selanjutnya, rekomendasi teknis yang dihasilkan dapat digunakan sebagai arahan awal dalam meningkatkan performa sistem, seperti optimasi Query, penggunaan Indexing, penerapan Caching pada data agregat yang sering diakses, pembatasan Payload Response, maupun penyesuaian konfigurasi aplikasi dan Server.

    BAB II TINJAUAN PUSTAKA

    A. Penelitian Terkait
Penelitian terkait merupakan bagian yang menjelaskan perkembangan penelitian sebelumnya yang relevan dengan topik penelitian. Pada penelitian ini, kajian penelitian terkait diarahkan pada tiga kelompok utama, yaitu sistem berbasis Outcome Based Education (OBE), Dashboard akademik atau Learning analytics, serta pengujian performa aplikasi web menggunakan metode Load testing dan Stress testing. Pengelompokan tersebut digunakan agar posisi penelitian dapat terlihat secara jelas dalam konteks evaluasi performa Endpoint Dashboard admin Sistem CPL berbasis OBE.
Penelitian terdahulu digunakan untuk mengetahui ruang lingkup kajian yang sudah dilakukan, metode yang digunakan, hasil yang diperoleh, serta celah penelitian yang masih dapat dikembangkan. Beberapa penelitian sebelumnya telah membahas pengembangan sistem OBE, sistem evaluasi capaian pembelajaran, Dashboard akademik, dan pengujian performa aplikasi web. Namun, penelitian yang secara khusus mengevaluasi performa Endpoint Dashboard admin Sistem CPL berbasis OBE yang memuat data agregat dari Backend masih terbatas. Oleh karena itu, rangkuman penelitian terdahulu disajikan pada Tabel 1 sebagai dasar untuk menunjukkan keterkaitan, perbedaan, dan posisi penelitian ini.



Tabel 1 Rangkuman Penelitian Terdahulu

Sumber : Hasil olahan peneliti, 2026.
Berdasarkan Tabel 1, penelitian terdahulu dapat dikelompokkan ke dalam tiga fokus utama. Kelompok pertama berkaitan dengan sistem berbasis OBE dan evaluasi capaian pembelajaran. Penelitian pada kelompok ini menunjukkan bahwa sistem informasi dapat digunakan untuk membantu pengukuran capaian program, pemetaan capaian pembelajaran, serta evaluasi proses akademik secara lebih terstruktur. Namun, fokus penelitian tersebut umumnya masih berada pada pengembangan sistem, evaluasi capaian pembelajaran, atau penyusunan indikator monitoring, belum pada pengujian performa Endpoint sistem ketika menerima Request pengguna secara simultan.
Kelompok kedua berkaitan dengan Dashboard akademik dan Learning analytics. Penelitian dalam kelompok ini menunjukkan bahwa Dashboard dapat membantu penyajian informasi akademik melalui ringkasan data, visualisasi, monitoring capaian, dan dukungan pengambilan keputusan. Akan tetAPI, penelitian tersebut lebih banyak membahas fungsi Dashboard, desain informasi, dan peran analitik pembelajaran. Aspek teknis seperti Response time, Throughput, Error rate, dan kestabilan Endpoint Dashboard ketika memproses data agregat belum menjadi fokus utama.
Kelompok ketiga berkaitan dengan pengujian performa aplikasi web menggunakan Apache JMeter. Penelitian pada kelompok ini menunjukkan bahwa Load testing dan Stress testing dapat digunakan untuk mengevaluasi kemampuan sistem dalam menangani beban pengguna, mengukur Response time, Throughput, Error rate, serta mengidentifikasi indikasi penurunan performa. Meskipun demikian, objek penelitian pada kajian tersebut umumnya berupa website akademik, aplikasi web umum, atau aplikasi layanan tertentu, belum secara spesifik membahas Dashboard admin Sistem CPL berbasis OBE yang memproses data agregat akademik.
Dengan demikian, posisi penelitian ini berada pada irisan antara Dashboard berbasis OBE dan pengujian performa aplikasi web. Penelitian ini tidak berfokus pada pengembangan Dashboard baru, karena Dashboard admin Sistem CPL telah dikembangkan sebelumnya oleh peneliti pada kegiatan Praktik Kerja Lapangan. Fokus penelitian ini adalah mengevaluasi performa Endpoint Dashboard admin menggunakan Apache JMeter, menganalisis perubahan Response time, Throughput, Error rate, dan kestabilan sistem, mengidentifikasi dugaan Bottleneck, serta menyusun rekomendasi perbaikan secara terbatas berdasarkan pola hasil pengujian. Pendekatan tersebut menjadi pembeda utama penelitian ini dibandingkan penelitian terdahulu.
Untuk memperjelas hubungan antarpenelitian terdahulu, kajian penelitian terkait disajikan dalam bentuk mind map. Mind map ini memetakan beberapa kelompok kajian yang berhubungan dengan topik penelitian, yaitu transformasi digital, Outcome Based Education (OBE), Dashboard monitoring, dan Performance testing. Pemetaan tersebut digunakan untuk menunjukkan ruang lingkup penelitian sebelumnya serta keterkaitan antarbidang yang mendukung penelitian ini.


Gambar 1 Mindmap Penelitian



Gambar 1 menunjukkan bahwa penelitian terdahulu tersebar pada empat kelompok utama, yaitu transformasi digital, OBE, Dashboard monitoring, dan Performance testing. Pemetaan tersebut memperlihatkan bahwa belum banyak penelitian yang secara khusus menghubungkan Dashboard monitoring berbasis OBE dengan evaluasi performa Endpoint menggunakan Apache JMeter. Hal ini menjadi dasar bagi penelitian ini untuk mengevaluasi performa Dashboard admin Sistem CPL berbasis OBE berdasarkan hasil pengujian beban.
    B. Landasan Teori
        1. Outcome Based Education (OBE)
Outcome Based Education (OBE) merupakan pendekatan pendidikan yang menempatkan hasil pembelajaran sebagai dasar dalam perencanaan, pelaksanaan, dan evaluasi pendidikan [24]. Pendekatan ini menilai proses pembelajaran berdasarkan ketercapaian kompetensi yang harus dimiliki mahasiswa setelah menyelesaikan program pendidikan [25]. OBE juga menekankan keselarasan antara capaian pembelajaran, proses pembelajaran, metode penilaian, dan evaluasi hasil belajar agar seluruh kegiatan akademik mengarah pada capaian yang telah ditetapkan [26].
Dalam konteks pendidikan tinggi, OBE berkaitan erat dengan pengelolaan data akademik seperti kurikulum, mata kuliah, capaian pembelajaran, indikator penilaian, dan nilai mahasiswa. Data tersebut perlu dikelola secara sistematis agar dapat digunakan dalam pemantauan capaian pembelajaran dan perbaikan berkelanjutan [27]. Pada penelitian ini, OBE digunakan sebagai dasar konseptual karena sistem yang diuji merupakan Sistem CPL berbasis OBE. Pembahasan OBE tidak diarahkan pada aspek pedagogis secara mendalam, tetAPI sebagai konteks kebutuhan sistem monitoring dan Dashboard yang menyajikan informasi capaian pembelajaran secara terukur.
        2. Capaian Pembelajaran Lulusan (CPL)
Capaian Pembelajaran Lulusan (CPL) merupakan rumusan kemampuan yang harus dimiliki mahasiswa setelah menyelesaikan pendidikan pada suatu program studi [28]. CPL umumnya mencakup aspek sikap, pengetahuan, keterampilan umum, dan keterampilan khusus yang menjadi acuan dalam penyusunan kurikulum serta evaluasi keberhasilan pembelajaran [29].
Dalam sistem berbasis OBE, CPL berperan sebagai rujukan utama dalam pemetaan mata kuliah, CPMK, metode penilaian, dan evaluasi hasil belajar mahasiswa [30]. Setiap mata kuliah dapat berkontribusi terhadap satu atau beberapa CPL, sehingga pengelolaan CPL membutuhkan relasi data yang jelas antara mata kuliah, CPMK, CPL, dan nilai mahasiswa.
Pada penelitian ini, CPL digunakan sebagai konteks data yang diproses oleh Sistem CPL berbasis OBE, khususnya pada Dashboard admin. Pembahasan CPL tidak diarahkan pada validitas akademik perhitungannya, tetAPI untuk menjelaskan bahwa informasi pada Dashboard merupakan hasil pengolahan data akademik yang saling berelasi dan dapat memengaruhi proses pemuatan data agregat pada Endpoint Dashboard.

        3. Sistem Monitoring Capaian Pembelajaran
Sistem penilaian CPL berbasis web merupakan sistem informasi akademik yang digunakan untuk mengelola data capaian pembelajaran secara terstruktur dan terpusat [31]. Dalam konteks OBE, sistem ini menghubungkan data CPL, CPMK, mata kuliah, teknik penilaian, mahasiswa, dosen, nilai, dan kurikulum agar proses pemantauan serta evaluasi capaian pembelajaran dapat dilakukan secara lebih sistematis [32].
Pada penelitian ini, sistem penilaian CPL diposisikan sebagai objek evaluasi performa, bukan sebagai objek pengembangan fitur baru. Fokus pembahasan diarahkan pada karakteristik sistem yang memengaruhi proses pemuatan Dashboard admin, terutama alur kerja antara Frontend, Backend, dan Database. Frontend berperan sebagai antarmuka pengguna, Backend memproses Request dan data agregat, sedangkan Database menyimpan data akademik yang dibutuhkan sistem. Alur Request-Response dari Frontend ke Backend, proses pengambilan data, perhitungan agregat, dan pengiriman Response menjadi bagian penting yang dapat memengaruhi performa Dashboard [33].

        4. Dashboard Sistem Informasi
Dashboard merupakan antarmuka informasi yang menyajikan data penting secara ringkas, visual, dan mudah dipahami untuk mendukung pemantauan serta pengambilan keputusan [34]. Dalam sistem akademik berbasis OBE, Dashboard dapat digunakan untuk menampilkan informasi capaian pembelajaran, seperti rata-rata CPL, distribusi capaian, tren semester, grafik CPL, serta hubungan antara mata kuliah dan capaian pembelajaran [35]. Dashboard membantu pengguna memahami kondisi akademik tanpa harus membaca seluruh data mentah, karena informasi telah diringkas dan divisualisasikan sesuai kebutuhan monitoring.
Pada penelitian ini, Dashboard admin Sistem CPL diposisikan sebagai modul utama yang menampilkan data agregat dari Backend, seperti statistik global, grafik CPL, tren capaian, kelengkapan data, alerts, insights, analisis dosen, evaluasi mahasiswa terbatas, serta Filter Dashboard. Pengujian tidak diarahkan pada komponen tampilan React atau performa rendering browser, tetAPI pada Endpoint Dashboard admin yang menghasilkan Response data agregat. Dengan demikian, performa yang dianalisis adalah performa Request-Response Endpoint Dashboard, bukan performa visual antarmuka secara penuh [36].
Karakteristik Dashboard admin lebih kompleks dibandingkan halaman sederhana karena memuat beberapa kelompok informasi yang membutuhkan proses Query, relasi data, perhitungan, Filter, dan penyusunan Response. Oleh karena itu, Endpoint Dashboard admin relevan untuk diuji menggunakan skenario beban pengguna simultan [7].

        5. Data Mentah, Data Dummy, dan Data Agregat Dashboard
Data mentah Database merupakan data asli yang tersimpan pada tabel sebelum melalui proses pengolahan, perhitungan, atau peringkasan informasi [37]. Dalam penelitian ini, data yang digunakan bukan data akademik asli, melainkan data dummy yang disusun mengikuti struktur data pada Sistem CPL berbasis OBE. Data dummy digunakan sebagai data utama pengujian untuk menggambarkan skala Database, relasi antardata, dan bentuk data yang diproses oleh Dashboard.
Tabel 2 Bentuk Data
Jenis Data	Contoh Data	Keterangan
Data angka	nilai CPL, nilai CPMK, bobot penilaian, jumlah mahasiswa, rata-rata capaian	Digunakan untuk proses perhitungan dan agregasi Dashboard
Teks pendek	nama mahasiswa, nama dosen, kode mata kuliah, kode CPL, semester, kelas	Digunakan sebagai identitas atau label data
Teks panjang	deskripsi CPL, deskripsi CPMK, keterangan evaluasi	Digunakan sebagai informasi penjelas dalam sistem
Data relasional	relasi mata kuliah-CPL, CPMK-CPL, dosen-mata kuliah, mahasiswa-nilai	Digunakan untuk menghubungkan data antarentitas
Berbeda dengan data mentah, data agregat merupakan data hasil pengolahan yang telah diringkas, dihitung, diFilter, atau dikelompokkan sesuai kebutuhan analisis [38]. Dalam konteks Dashboard admin Sistem CPL, data dummy tidak dikirim seluruhnya ke Frontend, tetAPI diproses terlebih dahulu oleh Backend melalui Query Database, relasi data, perhitungan, Filter, dan penyusunan Response.

Dengan demikian, objek pengujian dalam penelitian ini difokuskan pada Endpoint Dashboard admin yang menghasilkan Response data agregat, seperti statistik global, grafik CPL, tren semester, analisis dosen, dan evaluasi mahasiswa terbatas, bukan pada seluruh isi Database atau seluruh fitur sistem.

        6. Teknologi Sistem yang Diuji
Teknologi sistem yang diuji perlu dijelaskan untuk memahami arsitektur aplikasi dan alur pemrosesan data pada Dashboard admin. Sistem terdiri dari Frontend, Backend, ORM, dan Database yang saling berperan dalam proses Request-Response, mulai dari permintaan data, pemrosesan Server, pengambilan data, hingga pengiriman Response kembali ke Frontend.
    a) Frontend: React.js dan TypeScript
Frontend berfungsi sebagai antarmuka pengguna. Sistem menggunakan React.js untuk membangun antarmuka berbasis komponen dan TypeScript untuk mendukung struktur tipe data dalam pengembangan aplikasi [39]. React memang dirancang untuk membangun antarmuka berbasis komponen, sedangkan TypeScript menambahkan dukungan tipe pada JavaScript.
    b) Backend: Node.js dan Express.js
Backend berfungsi menerima Request, memproses logika aplikasi, mengambil data, melakukan agregasi, dan mengirimkan Response. Pada sistem ini, Node.js digunakan sebagai Runtime Server dan Express.js digunakan sebagai Framework API [40]. Dalam konteks Dashboard admin, Backend berperan penting dalam membaca parameter Filter, memproses data, dan menyusun Response Dashboard.
    c) ORM: Prisma ORM
Prisma ORM digunakan sebagai penghubung antara Backend dan Database. Prisma membantu akses data melalui kode aplikasi dan menyediakan Type-safe Query, tetAPI Query yang dihasilkan tetap dapat memengaruhi performa sistem, terutama pada proses relasi data, Filter, dan agregasi [41].
    d) Database: MariaDB
MariaDB digunakan sebagai sistem manajemen basis data relasional untuk menyimpan data akademik seperti mahasiswa, dosen, mata kuliah, CPL, CPMK, relasi, dan nilai [42]. Karena data tersebut saling berhubungan, proses pemuatan Dashboard admin dapat melibatkan Query dan relasi data yang cukup kompleks.
    e) Alur Request-Response Dashboard
Alur kerja dimulai dari Request Frontend ke Backend. Backend kemudian mengambil data melalui Prisma ORM, memproses Query Database, melakukan perhitungan atau agregasi, menyusun Response, lalu mengirimkan data kembali ke Frontend.

    f) Batasan Pembahasan Teknologi
Pembahasan teknologi tidak diarahkan pada pembangunan ulang sistem atau analisis kode secara rinci. Teknologi hanya dijelaskan sebagai konteks arsitektur yang memengaruhi performa Endpoint Dashboard admin. Fokus utama penelitian tetap pada evaluasi performa Request-Response menggunakan Apache JMeter.

        7. Performance testing
Performance testing merupakan metode pengujian untuk mengevaluasi kemampuan sistem dalam menangani beban kerja tertentu, terutama ketika jumlah Request atau pengguna meningkat [43]. Pengujian ini digunakan untuk melihat respons, kestabilan, dan kemampuan sistem dalam mempertahankan performa pada berbagai kondisi beban [44].
Dalam aplikasi berbasis web, Performance testing penting dilakukan karena sistem yang berjalan normal pada satu pengguna belum tentu tetap stabil ketika diakses banyak pengguna secara simultan. Evaluasi biasanya dilakukan menggunakan parameter seperti Response time, Throughput, Error rate, dan kestabilan sistem. Selain parameter tersebut, penelitian performa juga dapat memanfaatkan informasi penggunaan sumber daya Server, seperti CPU dan memori, sebagai indikator pendukung untuk membantu menginterpretasikan perubahan performa aplikasi ketika menerima peningkatan beban kerja. Pengamatan terhadap kedua sumber daya tersebut tidak menggantikan metrik utama pengujian, tetAPI digunakan untuk memperkuat analisis terhadap perilaku sistem selama proses pengujian [45].
Pada penelitian ini, Performance testing digunakan untuk mengevaluasi Endpoint Dashboard admin Sistem CPL berbasis OBE. Hasil pengujian tidak digunakan untuk memastikan dugaan penyebab Bottleneck secara mutlak, tetAPI untuk membaca pola penurunan performa dan menyusun dugaan teknis berdasarkan data pengujian. JMeter juga menyediakan laporan pengujian yang memuat grafik dan statistik seperti Response time, Throughput, serta error untuk mendukung analisis performa [46].

        8. Load testing
Load testing merupakan bagian dari Performance testing yang dilakukan dengan memberikan beban pengguna secara bertahap untuk mengetahui kemampuan sistem pada kondisi beban normal hingga meningkat [47]. Pengujian ini digunakan untuk melihat respons Endpoint ketika jumlah pengguna virtual yang mengakses sistem bertambah secara simultan [48].
Dalam penelitian ini, konsep Load testing digunakan sebagai salah satu kategori skenario pengujian performa untuk mengevaluasi perubahan performa Endpoint pada kondisi peningkatan beban pengguna secara bertahap. Pengujian difokuskan pada Endpoint Dashboard yang menghasilkan data agregat dari Backend, bukan pada seluruh fitur sistem atau seluruh isi Database. Parameter yang diamati meliputi Response time, Throughput, Error rate, dan kestabilan sistem [49].
Apache JMeter digunakan untuk mengatur skenario pengguna virtual melalui Thread Group dan mengirim Request ke Endpoint menggunakan HTTP Request. Dokumentasi JMeter menjelaskan bahwa Thread Group digunakan untuk menentukan jumlah pengguna yang disimulasikan, sedangkan HTTP Request digunakan untuk mengirim Request HTTP/HTTPS ke Server.

        9. Stress testing
Stress testing merupakan bagian dari Performance testing yang dilakukan dengan memberikan beban melebihi kondisi normal untuk mengetahui batas kemampuan dan kestabilan sistem [50]. Pengujian ini digunakan untuk mengamati perilaku sistem ketika menerima tekanan tinggi, seperti peningkatan Response time, kenaikan Error rate, penurunan Throughput, atau munculnya indikasi penurunan kestabilan sistem [11].
Pada penelitian ini, konsep Stress testing diterapkan sebagai salah satu kategori dalam skenario pengujian performa untuk mengevaluasi perilaku Endpoint ketika menerima beban yang melebihi kondisi operasional normal. Pengujian ini tidak bertujuan untuk membuktikan penyebab Bottleneck secara langsung, melainkan untuk mengidentifikasi dugaan Bottleneck berdasarkan perubahan parameter performa, yaitu Response time, Throughput, Error rate, dan kestabilan sistem. Hasil pengujian kemudian dianalisis bersama seluruh skenario pengujian performa sebagai dasar penyusunan dugaan teknis dan rekomendasi perbaikan [51]. Dalam JMeter, skenario beban dapat diatur melalui Thread Group yang menentukan jumlah pengguna virtual dan pola pengiriman Request.

        10. Parameter Pengujian Performa
Parameter pengujian performa digunakan untuk mengukur kinerja Endpoint Dashboard admin secara kuantitatif pada setiap skenario pengujian [52] . Dalam penelitian ini, parameter utama yang digunakan meliputi Response time, Throughput, Error rate, dan kestabilan sistem karena mampu menggambarkan kecepatan respons, kapasitas pemrosesan, tingkat kegagalan, serta konsistensi performa sistem [53].
    a) Response time
Response time merupakan waktu yang dibutuhkan sistem untuk merespons Request pengguna. Parameter ini digunakan untuk mengetahui seberapa cepat Endpoint Dashboard admin memproses dan mengirimkan Response data agregat dari Backend [54].
    b) Throughput
Throughput menunjukkan jumlah Request yang dapat diproses sistem dalam satuan waktu tertentu. Parameter ini digunakan untuk melihat kapasitas Endpoint dalam menangani Request ketika jumlah pengguna simultan meningkat [55].
    c) Error rate
Error rate merupakan persentase Request yang gagal selama pengujian. Nilai ini digunakan untuk melihat tingkat keberhasilan Endpoint dalam memproses Request pada setiap skenario beban.
    d) Penggunaan CPU
Penggunaan CPU menunjukkan tingkat aktivitas prosesor ketika aplikasi memproses Request. Dalam penelitian performa aplikasi web, peningkatan utilisasi CPU dapat menunjukkan bertambahnya beban komputasi akibat meningkatnya jumlah Request yang diproses. Pada penelitian ini, penggunaan CPU diamati sebagai indikator pendukung dalam menginterpretasikan perubahan performa Endpoint Dashboard Admin.
    e) Penggunaan Memori
Penggunaan memori menunjukkan besarnya kapasitas RAM yang digunakan aplikasi selama menjalankan proses. Pada pengujian performa, peningkatan penggunaan memori dapat memberikan gambaran mengenai kebutuhan sumber daya aplikasi ketika memproses beban pengguna yang semakin besar. Dalam penelitian ini, penggunaan memori digunakan sebagai indikator pendukung dalam analisis performa Endpoint.
    f) Kestabilan Sistem
Kestabilan sistem diamati dari pola perubahan Response time, Throughput, dan Error rate. Sistem dianggap relatif stabil apabila peningkatan jumlah pengguna tidak menyebabkan lonjakan waktu respons, penurunan Throughput signifikan, atau peningkatan error yang tinggi.
    g) Batasan Interpretasi
Parameter tersebut digunakan untuk mengevaluasi performa Request-Response Endpoint Dashboard admin, bukan performa seluruh sistem, tampilan Frontend, atau proses rendering browser. Apache JMeter sendiri menyediakan laporan pengujian yang memuat metrik seperti ringkasan keberhasilan/gagal, statistik transaksi, Response time, dan Throughput.

        11. Apache JMeter
Apache JMeter merupakan perangkat lunak open-source berbasis Java yang digunakan untuk melakukan Load testing dan mengukur performa aplikasi, termasuk aplikasi web, API, Database, dan layanan jaringan [56]. JMeter dapat mensimulasikan beban tinggi pada Server untuk menguji kekuatan sistem dan menganalisis performa pada berbagai jenis beban. Selain itu, JMeter bekerja pada level protokol, sehingga tidak mengukur rendering halaman seperti browser.
Dalam penelitian ini, Apache JMeter dipilih sebagai alat utama karena sesuai dengan kebutuhan pengujian performa Endpoint Dashboard admin Sistem CPL berbasis OBE. Objek pengujian berupa Endpoint HTTP/API yang menghasilkan data agregat dari Backend, yaitu /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students. JMeter mendukung pengaturan jumlah pengguna virtual, pengiriman Request ke Endpoint, serta pencatatan metrik performa seperti Response time, Throughput, Error rate, dan status Request [57] .
Beberapa komponen JMeter yang relevan dalam penelitian ini adalah sebagai berikut:
    a) Thread Group
Digunakan untuk mengatur jumlah pengguna virtual, ramp-up period, durasi pengujian, dan jumlah iterasi Request. Thread Group menentukan jumlah pengguna yang disimulasikan serta pola pengiriman Request dalam test plan [58].
    b) HTTP Request
Digunakan untuk menentukan Endpoint yang diuji, yaitu Endpoint Dashboard admin yang menghasilkan data agregat dari Backend.
    c) HTTP Header Manager
Digunakan untuk mengatur header Request, seperti token autentikasi atau tipe konten yang diperlukan Server.
    d) Cookie Manager
Digunakan apabila pengujian membutuhkan pengelolaan sesi atau cookie selama proses Request berlangsung.
    e) Listener
Listener digunakan untuk menampilkan dan menyimpan hasil pengujian, seperti Response time, Throughput, Error rate, dan ringkasan hasil Request. Data dari Listener menjadi dasar analisis performa pada penelitian ini.
Dengan komponen tersebut, Apache JMeter digunakan untuk menyusun skenario Load testing dan Stress testing secara terukur. Hasil pengujian dari JMeter kemudian digunakan untuk mengevaluasi performa Endpoint Dashboard admin pada setiap tingkat beban pengguna serta membantu mengidentifikasi dugaan Bottleneck berdasarkan pola hasil pengujian.

        12. Bottleneck Sistem
Bottleneck merupakan kondisi ketika salah satu bagian sistem menjadi titik hambat yang membatasi performa sistem secara keseluruhan [59] Pada aplikasi berbasis web, Bottleneck dapat terjadi pada proses Backend, Query Database, relasi antartabel, ukuran Response, konfigurasi Server, jaringan, atau proses pemrosesan data yang tidak efisien. 
Dalam konteks Dashboard admin Sistem CPL berbasis OBE, potensi Bottleneck dapat muncul karena Endpoint Dashboard memproses data agregat dari beberapa sumber data sebelum dikirimkan ke Frontend. Proses tersebut dapat melibatkan pembacaan parameter Filter, akses data melalui Prisma ORM, Query ke MariaDB, relasi antartabel, perhitungan agregat, dan penyusunan Response.
Pada penelitian ini, Bottleneck tidak diidentifikasi melalui profiling kode atau tracing Query secara mendalam. Identifikasi dilakukan sebagai dugaan teknis berdasarkan pola hasil pengujian menggunakan Apache JMeter. Dugaan Bottleneck ditelusuri dengan membandingkan performa tiga Endpoint Dashboard admin, yaitu /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students. [60].
Endpoint yang menunjukkan Response time paling tinggi, Throughput paling rendah, Error rate lebih besar, atau kestabilan paling buruk pada skenario beban tertentu diposisikan sebagai Endpoint yang berpotensi menjadi sumber Bottleneck. Dengan demikian, analisis Bottleneck dalam penelitian ini digunakan untuk membantu menyusun rekomendasi perbaikan, bukan sebagai pembuktian final terhadap kode program atau Query Database tertentu.
        13. Rekomendasi Perbaikan Performa Terbatas
Rekomendasi perbaikan performa merupakan arahan teknis yang akan disusun berdasarkan hasil evaluasi pengujian, karakteristik Endpoint Dashboard admin, dan dugaan Bottleneck yang diidentifikasi [61]. Rekomendasi ini tidak diposisikan sebagai hasil optimasi yang sudah diimplementasikan, tetAPI sebagai arahan awal untuk pengembangan sistem berikutnya.
Dalam penelitian ini, rekomendasi diarahkan pada Endpoint yang menunjukkan performa paling lemah berdasarkan hasil pengujian. Apabila Endpoint tertentu memiliki Response time tinggi, Throughput menurun, Error rate meningkat, atau performa tidak stabil, maka rekomendasi disusun sesuai dengan karakteristik proses pada Endpoint tersebut.
Beberapa bentuk rekomendasi yang dapat disusun dalam penelitian ini meliputi:
    a) Evaluasi Query Database
Evaluasi dilakukan untuk melihat kemungkinan adanya Query yang terlalu berat, relasi yang kompleks, atau proses pengambilan data yang belum efisien.
    b) Indexing pada kolom relasi dan Filter
Indexing dapat diarahkan pada kolom yang sering digunakan dalam proses pencarian, Filter, atau relasi data, seperti program studi, semester, mata kuliah, CPL, CPMK, dan nilai [62]. Index pada MariaDB dapat membantu meningkatkan performa Query dan mempercepat pengambilan data.
    c) Pengurangan Over-fetching
Over-fetching terjadi ketika sistem mengambil data lebih banyak daripada yang dibutuhkan. Rekomendasi ini diarahkan agar Endpoint Dashboard admin hanya mengambil data yang diperlukan untuk membentuk Response [63].
    d) Caching data agregat
Bersifat relatif statis dapat dipertimbangkan sebagai salah satu alternatif untuk mengurangi proses perhitungan dan pengambilan data yang dilakukan secara berulang. Pendekatan ini berpotensi menurunkan beban Query pada Backend dan basis data sehingga dapat membantu meningkatkan waktu respons sistem, terutama pada fitur/halaman yang sering mengakses data agregat [64].
    e) Pembatasan Payload Response
Data yang dikirim dari Backend ke Frontend perlu dibatasi sesuai kebutuhan tampilan agar ukuran Response tidak terlalu besar dan proses pengiriman data lebih efisien.
    f) Evaluasi Endpoint yang berat
Apabila salah satu Endpoint memiliki proses yang lebih berat dibanding Endpoint lainnya, maka perlu dilakukan evaluasi terhadap proses agregasi, relasi antartabel, penggunaan Filter, atau kemungkinan pemisahan proses agar pemuatan data lebih terkontrol.
    g) Penyesuaian konfigurasi Server
Jika hasil pengujian menunjukkan keterbatasan sumber daya, rekomendasi dapat diarahkan pada penyesuaian konfigurasi atau spesifikasi Server.

Dengan demikian, rekomendasi perbaikan dalam penelitian ini berfungsi sebagai arahan teknis awal untuk meningkatkan kesiapan performa Endpoint Dashboard admin. Rekomendasi tetap dibatasi pada hasil evaluasi pengujian dan dugaan teknis, bukan berdasarkan implementasi optimasi atau pembuktian langsung melalui profiling kode secara mendalam.



    BAB III METODOLOGI

    A. Waktu dan Tempat Penelitian
Waktu penelitian direncanakan dimulai setelah pelaksanaan seminar proposal, dengan durasi kurang lebih 45 hari kerja. Selama waktu tersebut, kegiatan penelitian meliputi tahap persiapan, pelaksanaan pengujian, analisis hasil pengujian, penyusunan rekomendasi perbaikan secara terbatas, penulisan laporan, serta persiapan sidang.
Penelitian ini dilakukan pada lingkungan pengujian lokal yang terdiri dari perangkat Client dan Server pengujian. Perangkat Client digunakan untuk menjalankan Apache JMeter sebagai alat pengujian beban. Perangkat ini memiliki spesifikasi Intel Core i7-6820HQ, RAM 16 GB, SSD 500 GB, dan menggunakan sistem operasi Debian. Sementara itu, Server pengujian digunakan untuk menjalankan Sistem Penilaian CPL berbasis OBE, dengan spesifikasi Intel Core 2 Duo, RAM 3 GB, SSD 256 GB, dan sistem operasi Debian Server.
    B. Alat dan Bahan
        1. Alat
Alat yang digunakan dalam penelitian ini terdiri atas perangkat keras dan perangkat lunak yang mendukung pelaksanaan pengujian performa Dashboard Admin Sistem Capaian Pembelajaran Lulusan (CPL) berbasis Outcome Based Education (OBE). Perangkat Server digunakan untuk menjalankan sistem yang diuji, sedangkan perangkat Client digunakan untuk menjalankan Apache JMeter untuk melakukan simulasi pengguna virtual.
Alat yang digunakan dalam penelitian ini terdiri atas perangkat keras dan perangkat lunak yang mendukung pelaksanaan pengujian performa Dashboard Admin Sistem Capaian Pembelajaran Lulusan (CPL) berbasis Outcome Based Education (OBE). Perangkat Server digunakan untuk menjalankan sistem yang diuji, sedangkan perangkat Client digunakan untuk menjalankan Apache JMeter dan utilitas pemantauan. Kedua perangkat tersebut dihubungkan dalam satu jaringan lokal secara LAN-to-LAN menggunakan sebuah router sebagai penengah jalur komunikasi.
Tabel 3 Alat Penelitian
No	Alat	Spesifikasi	Fungsi
1	Server Pengujian	Intel Core 2 Duo, RAM 3 GB, SSD 256 GB, Debian Server	Menjalankan Sistem CPL berbasis OBE, Backend Node.js dan Express.js, Prisma ORM, serta Database MariaDB
2	Client Penguji	Intel Core i7-6820HQ, RAM 16 GB, SSD 500 GB, Debian	Menjalankan Apache JMeter untuk melakukan simulasi pengguna virtual dan mengirim Request ke Endpoint Dashboard Admin
3	Apache JMeter	Versi 5.6.3	Digunakan untuk mensimulasikan pengguna virtual, mengirim Request ke Endpoint, serta mengumpulkan data hasil pengujian performa.
4	Web Browser	Chrome	Digunakan untuk memverifikasi fungsi sistem dan Endpoint yang diuji
5	Jaringan Lokal	LAN-to-LAN (via Router)	Menghubungkan perangkat Client dan Server pengujian, serta menjadi jalur akses SSH secara lokal dengan perantara router
6	Secure Shell (SSH)	Bawaan OS / Terminal	Digunakan pada Client penguji untuk mengakses Server selama skenario berjalan
7	Glances	Versi 3.3.1.1	Utilitas pemantauan untuk merekam metrik penggunaan CPU dan RAM Server secara real-time

        2. Bahan
Bahan penelitian merupakan objek dan data yang digunakan selama proses pengujian performa sistem. Bahan penelitian yang digunakan dalam penelitian ini meliputi sistem yang diuji, data pengujian, serta Endpoint Dashboard Admin yang menjadi fokus evaluasi performa.
No	Bahan	Keterangan
1	Sistem CPL Berbasis OBE	Sistem yang menjadi objek penelitian dan digunakan untuk mengelola data capaian pembelajaran lulusan
2	Dashboard Admin	Modul Dashboard yang menampilkan statistik CPL, grafik capaian, tren semester, analisis dosen, evaluasi mahasiswa terbatas, dan informasi monitoring lainnya
3	Data Dummy	Data pengujian yang disusun sesuai struktur Database Sistem CPL untuk menggambarkan relasi dan skala data sistem
4	Endpoint Dashboard Admin	Endpoint yang diuji meliputi /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students
5	Database MariaDB	Basis data yang digunakan untuk menyimpan dan mengelola data Sistem CPL
6	Token Autentikasi JWT	Digunakan untuk mengakses Endpoint yang memerlukan autentikasi selama proses pengujian


    C. Prosedur Penelitian
Prosedur penelitian merupakan tahapan operasional yang disusun secara sistematis mulai dari tahap awal hingga akhir penelitian. Pada penelitian ini, prosedur difokuskan pada evaluasi performa Endpoint Dashboard admin Sistem CPL berbasis OBE menggunakan metode Load testing dan Stress testing. Tahapan penelitian dirancang untuk mengetahui performa Endpoint Dashboard, menganalisis perubahan parameter pengujian, mengidentifikasi dugaan Bottleneck, serta menyusun rekomendasi perbaikan berdasarkan hasil pengujian.



Diagram alir pada Gambar 3 menunjukkan tahapan penelitian yang dilakukan secara sistematis. Penelitian diawali dengan studi literatur dan analisis sistem eksisting untuk memahami karakteristik objek penelitian. Selanjutnya dilakukan perancangan skenario pengujian performa serta konfigurasi lingkungan pengujian menggunakan Apache JMeter. Setelah konfigurasi selesai, pelaksanaan pengujian performa dilakukan sesuai skenario yang telah dirancang. Apabila selama proses pengujian terjadi kegagalan, seperti Server tidak merespons atau proses pengujian tidak selesai, maka pengujian diulang hingga seluruh skenario berhasil dilaksanakan. Setelah pengujian berhasil, data hasil pengujian dikumpulkan untuk selanjutnya dianalisis berdasarkan parameter Response time, Throughput, Error rate, dan kestabilan sistem. Hasil analisis tersebut digunakan untuk mengidentifikasi dugaan Bottleneck serta menyusun rekomendasi perbaikan, kemudian penelitian diakhiri dengan penarikan kesimpulan.
Tabel 4 Skenario Pengujian
No	Jumlah Pengguna Simultan	Jenis Pengujian	Tujuan Pengujian
1	1	Baseline	Mengetahui kondisi dasar performa Endpoint Dashboard admin
2	10	Load testing ringan	Mengamati performa Endpoint pada beban awal
3	20	Load testing sedang	Mengamati perubahan performa ketika jumlah pengguna meningkat
4	50	Load testing tinggi	Mengetahui kemampuan Endpoint pada beban menengah menuju tinggi
5	100	Stress testing	Mengamati perilaku Endpoint pada beban tinggi
6	200	Stress testing tinggi	Mengamati potensi penurunan performa dan kestabilan sistem
7	500	Stress testing ekstrem	Menguji batas kemampuan Endpoint pada beban maksimum pengujian

Pengujian dilakukan secara bertahap (incremental load), dimulai dari kondisi baseline, dilanjutkan dengan skenario Load testing, kemudian Stress testing. Melalui skenario tersebut perubahan Response time, Throughput, Error rate, dan kestabilan sistem dianalisis untuk mengidentifikasi indikasi penurunan performa dan dugaan Bottleneck.
    1. Studi Literatur
Tahap studi literatur dilakukan untuk memperoleh dasar teori, konsep, dan referensi yang mendukung pelaksanaan penelitian. Literatur yang dikaji berkaitan dengan Outcome Based Education (OBE), Capaian Pembelajaran Lulusan (CPL), sistem monitoring capaian pembelajaran, Dashboard Admin, data agregat, Performance testing, parameter pengujian performa, skenario pengujian performa, serta penggunaan Apache JMeter.
Studi literatur dilakukan dengan menelaah jurnal ilmiah, artikel konferensi, buku, dan dokumentasi resmi perangkat lunak yang relevan. Referensi mengenai OBE dan CPL digunakan untuk memahami konteks sistem yang diuji, sedangkan referensi mengenai Dashboard dan data agregat digunakan untuk memahami karakteristik pemuatan informasi pada Dashboard Admin. Selain itu, referensi mengenai Performance testing, termasuk konsep Load testing dan Stress testing, digunakan sebagai landasan dalam menyusun skenario pengujian performa serta menentukan parameter yang akan dianalisis.
Pada tahap ini juga dipelajari dokumentasi teknis yang berkaitan dengan teknologi sistem dan alat pengujian, seperti Apache JMeter, Node.js, Express.js, Prisma ORM, dan MariaDB. Dokumentasi tersebut digunakan untuk memahami alur kerja sistem berbasis web, proses Request-Response, akses basis data, serta kemungkinan faktor teknis yang dapat memengaruhi performa Endpoint Dashboard Admin.
Hasil dari tahap studi literatur digunakan sebagai dasar dalam menentukan ruang lingkup penelitian, menyusun skenario pengujian performa, menetapkan parameter pengujian, serta merumuskan dasar analisis terhadap hasil pengujian. Dengan demikian, tahap studi literatur menjadi landasan awal sebelum dilakukan analisis sistem eksisting dan perancangan skenario pengujian performa.
    2. Analisis Sistem Eksisting
Tahap analisis sistem eksisting dilakukan untuk memahami karakteristik Sistem Penilaian Capaian Pembelajaran Lulusan berbasis OBE, khususnya pada bagian Dashboard admin. Analisis difokuskan pada alur kerja Dashboard, Endpoint API,  struktur data, serta proses pemuatan data dari Backend agar pengujian performa sesuai dengan ruang lingkup penelitian.

Gambar 4 Tampilan Dashboard Admin Sistem CPL
Berdasarkan Gambar 4, Dashboard admin memuat beberapa kelompok informasi yang diproses oleh Backend sebelum dikirimkan ke Frontend. Oleh karena itu, pengujian difokuskan pada Endpoint Dashboard admin yang menghasilkan Response data agregat, bukan pada seluruh fitur sistem atau proses rendering antarmuka. Endpoint yang diuji dalam penelitian ini ditunjukkan pada tabel 5.
Tabel 5 Endpoint
No	Endpoint	Metode	Fokus Data yang Diuji
1	/API/Dashboard/stats	GET	Statistik global, grafik CPL, tren semester, alert, dan insight
2	/API/Dashboard/dosen	GET	Analisis dosen, jumlah kelas, rata-rata nilai kelas, dan progres input nilai
3	/API/Dashboard/students	GET	Evaluasi mahasiswa terbatas dan ringkasan nilai mahasiswa

Pada tahap ini, Dashboard admin dipahami sebagai modul yang menampilkan data agregat, bukan seluruh data mentah dari Database. Data mentah seperti mahasiswa, dosen, mata kuliah, CPL, CPMK, relasi, dan nilai tetap tersimpan pada Database, sedangkan data yang ditampilkan pada Dashboard merupakan hasil pengolahan Backend berupa ringkasan, perhitungan, Filter, dan susunan Response sesuai kebutuhan tampilan. Pendekatan ini sejalan dengan konsep Dashboard berbasis agregasi, karena pengolahan data ringkasan dapat memengaruhi performa Query dan pemuatan Dashboard.
Selain itu, tahap ini juga mengidentifikasi data dummy yang digunakan sebagai data utama pengujian. Data dummy disusun mengikuti struktur data pada Sistem CPL berbasis OBE, sehingga dapat menggambarkan skala Database, relasi antardata, dan bentuk data yang diproses oleh Dashboard. Jumlah data dibuat tetap selama pengujian agar perubahan performa lebih dipengaruhi oleh jumlah pengguna simultan, bukan oleh perubahan volume data pada Database.
Tabel 6 Ringkasan Data Dummy Sistem CPL
Komponen	Jumlah	Keterangan
Jumlah tabel Database	50 tabel	Struktur data Sistem CPL berbasis OBE
Total baris data	~341.502 baris	Total seluruh tabel pada Database
Ukuran Database	417,8 MiB	Ukuran keseluruhan Database
Mahasiswa	2.733 data	Sumber data ringkasan mahasiswa pada Dashboard
Users	2.873 data	Akun pengguna sistem
Profiles	2.868 data	Profil pengguna
CPL	367 data	Capaian Pembelajaran Lulusan
Mata kuliah aktif	247 data	Sumber data ringkasan mata kuliah pada Dashboard
nilai_cpmk	~226.396 baris	Data nilai CPMK
nilai_cpl	~66.512 baris	Data rekap nilai CPL
nilai_sub_cpmk	7.628 baris	Data nilai sub-CPMK
nilai_teknik_penilaian	7.527 baris	Data nilai teknik penilaian
cpmk_cpl_mapping	3.246 baris	Relasi CPMK ke CPL

Berdasarkan Tabel 6, data dummy menunjukkan bahwa Database sistem memiliki struktur cukup besar dan saling berelasi. Selain data utama, terdapat tabel pendukung seperti fakultas, prodi, angkatan, kurikulum, semester, rubrik, teknik penilaian, role, role_permissions, dan audit_logs. Keberadaan tabel relasional seperti cpl_mata_kuliah, mata_kuliah_pengampu, cpmk_cpl_mapping, dan profil_lulusan_cpl menunjukkan bahwa sistem memiliki keterkaitan data akademik yang kompleks.
Selain jumlah data dan struktur relasi basis data, karakteristik data yang diproses oleh Endpoint Dashboard Admin juga perlu diperhatikan karena dapat memengaruhi proses Query, relasi antartabel, dan agregasi data. Sistem CPL berbasis Outcome Based Education (OBE) menggunakan berbagai jenis data yang terdiri atas string, numerik, dan boolean. Sebagian besar relasi antarentitas menggunakan UUID dengan panjang 36 karakter sebagai primary key dan foreign key, sedangkan data identitas seperti nama, NIM, NIDN, email, kode CPL, dan kode mata kuliah menggunakan tipe VARCHAR dengan panjang yang bervariasi. Selain itu, sistem juga memproses data numerik berupa semester, SKS, nilai CPL, dan bobot kontribusi yang digunakan dalam perhitungan capaian pembelajaran.
Tabel 7 Karakteristik Data yang Diproses oleh Endpoint Dashboard Admin
Kategori Data	Tipe Basis Data	Panjang Data	Contoh Data
String Pendek	VARCHAR(36)	36 karakter	UUID, ID relasi
String Pendek	VARCHAR(10–20)	5–20 karakter	Kode CPL, kode mata kuliah
String Sedang	VARCHAR(191)	10–100 karakter	Nama mahasiswa, nama dosen, NIM, NIDN, email
String Panjang	TEXT	>100 karakter	Deskripsi CPL
Angka Bulat	INT	1–8 digit	Semester, SKS
Angka Desimal	DECIMAL(5,2)	0,00–100,00	Nilai CPL
Angka Desimal	DECIMAL(3,2)	0,00–1,00	Bobot kontribusi CPL
Boolean	TINYINT(1)	0 atau 1	Status aktif

Berdasarkan karakteristik tersebut, Endpoint Dashboard Admin tidak hanya memproses data teks sederhana, tetAPI juga melibatkan relasi data dan agregasi numerik dari beberapa tabel akademik yang berpotensi memengaruhi performa sistem ketika menerima Request secara simultan.
Dalam proses penyusunan informasi Dashboard, sistem tidak mengambil data dari satu tabel saja, melainkan melakukan pengolahan data dari beberapa tabel yang saling berelasi. Setiap Endpoint memiliki kebutuhan data yang berbeda sehingga jumlah tabel dan kompleksitas Query yang digunakan juga berbeda.
Tabel 8 Keterlibatan Tabel Database pada Endpoint Dashboard Admin
Endpoint	Tabel yang Diakses	Fungsi Utama
/API/Dashboard/stats	nilai_cpl, cpl, mata_kuliah, cpl_mata_kuliah, users, user_roles	Menampilkan statistik CPL, mata kuliah, dan pengguna
/API/Dashboard/dosen	nilai_cpl, profiles, mata_kuliah, mata_kuliah_pengampu	Menampilkan analisis capaian pembelajaran berdasarkan dosen pengampu
/API/Dashboard/students	nilai_cpl, profiles	Menampilkan evaluasi dan ringkasan capaian mahasiswa

Berdasarkan Tabel 8, Endpoint /API/Dashboard/stats memiliki kompleksitas pengolahan data yang lebih tinggi karena melibatkan lebih banyak tabel dan proses agregasi dibandingkan Endpoint lainnya. Perbedaan kompleksitas tersebut berpotensi menghasilkan karakteristik performa yang berbeda ketika sistem menerima beban pengguna secara bersamaan.
Meskipun volume data dummy di dalam Database cukup besar, data tersebut tidak seluruhnya dikirimkan ke sisi Frontend. Data yang dipetakan pada Tabel 6, Tabel 7, dan Tabel 8 murni digunakan untuk menggambarkan skala, karakteristik fisik, serta kompleksitas relasi pada Database internal sistem. Sementara itu, fokus pengujian tetap diarahkan pada Endpoint Dashboard Admin yang menghasilkan Response berupa data agregat. Dengan demikian, analisis performa dalam penelitian ini mutlak difokuskan pada kemampuan proses Backend dalam mengambil, mengolah, menghitung, memFilter, dan mengirimkan data ringkasan tersebut. Adapun kelompok data agregat dan kontrol interaksi pada Dashboard Admin ditunjukkan pada Tabel 9.
Tabel 9 Kelompok Data Agregat dan Kontrol Dashboard Admin
Kelompok Data	Objek Data / State	Fungsi
Statistik global	stats.cpl	Menampilkan jumlah keseluruhan CPL yang terdaftar pada sistem
Statistik global	stats.mataKuliah	Menampilkan jumlah mata kuliah aktif yang digunakan dalam pemetaan nilai
Statistik global	stats.users	Menampilkan jumlah mahasiswa atau pengguna sesuai cakupan Filter
Statistik global	stats.avgScore	Menampilkan rata-rata capaian CPL secara global berdasarkan data nilai yang telah diproses
Visualisasi	chartData	Menampilkan rata-rata nilai tiap CPL dalam bentuk grafik
Visualisasi	trendData	Menampilkan tren rata-rata capaian dari semester ke semester
Visualisasi	distributionData	Menampilkan distribusi nilai berdasarkan kategori tertentu
Visualisasi	performanceData	Menampilkan CPL dengan performa tertinggi atau terendah
Kelengkapan data	cplEmpty	Menampilkan jumlah atau daftar CPL yang belum memiliki data nilai referensi
Kelengkapan data	mkUnmapped	Menampilkan jumlah mata kuliah yang belum terpetakan dengan CPMK atau CPL
Kelengkapan data	progressPengisian	Menampilkan progres pengisian nilai oleh dosen dalam bentuk persentase
Peringatan sistem	alerts	Menampilkan kondisi penting, seperti CPL rendah atau mata kuliah yang perlu ditinjau
Wawasan otomatis	insights	Menampilkan ringkasan analitis, seperti CPL tertinggi, CPL terendah, atau perubahan tren
Monitoring operasional	dosenAnalysis	Menampilkan analisis dosen, jumlah kelas, rata-rata nilai kelas, dan progres input nilai
Monitoring mahasiswa	studentEvaluation	Menampilkan evaluasi mahasiswa secara terbatas, misalnya ringkasan nilai mahasiswa tertentu
Kontrol interaksi	activeFilters	Menyimpan parameter Filter seperti fakultas, program studi, semester, angkatan, kelas, atau mata kuliah
Kontrol interaksi	cplSortMode	Mengatur pengurutan grafik CPL berdasarkan nilai tertinggi atau terendah

Tabel 9 menunjukkan bahwa Dashboard admin memuat beberapa kelompok data agregat sesuai kebutuhan monitoring, seperti statistik global, visualisasi CPL, tren semester, distribusi nilai, kelengkapan data, peringatan sistem, insight otomatis, analisis dosen, evaluasi mahasiswa terbatas, serta kontrol Filter. Data yang ditampilkan bukan seluruh data mentah dari Database, melainkan hasil pengolahan Backend yang telah diringkas dan disusun sesuai kebutuhan tampilan Dashboard.
Selain itu, kontrol seperti activeFilters dan cplSortMode digunakan untuk menentukan cakupan dan urutan data yang ditampilkan. Perubahan Filter dapat menghasilkan Response yang berbeda karena Backend perlu memproses ulang data sesuai parameter yang digunakan. Oleh karena itu, pada tahap ini dilakukan identifikasi karakteristik Endpoint Dashboard admin, meliputi alamat Endpoint, metode Request, autentikasi, parameter Filter, dan jenis Response yang dihasilkan.
Analisis sistem eksisting juga mencakup pemahaman terhadap teknologi yang digunakan, yaitu React.js dan TypeScript pada Frontend, Node.js dan Express.js pada Backend, Prisma ORM, serta MariaDB. Pemahaman ini diperlukan karena performa Dashboard dapat dipengaruhi oleh proses Request-Response, Query Database, relasi antardata, penggunaan Filter, dan ukuran Response. Prisma sendiri menyediakan panduan optimasi Query untuk mengidentifikasi dan memperbaiki Query yang lambat atau mahal, sedangkan JMeter menggunakan Thread Group dan HTTP Request untuk menyusun skenario pengujian web berbasis Request.
Dengan demikian, Dashboard admin dipahami sebagai modul informasi akademik yang lebih kompleks dibandingkan fitur ringan karena memuat ringkasan, visualisasi, peringatan, monitoring, dan data agregat. Hasil analisis sistem eksisting digunakan sebagai dasar penyusunan skenario pengujian agar evaluasi performa tetap terarah pada Endpoint Dashboard admin dan tidak melebar ke fitur lain di luar ruang lingkup penelitian.
    3. Perancangan Skenario Pengujian
Pada tahap ini dilakukan perancangan skenario pengujian performa menggunakan Apache JMeter. Skenario dirancang untuk mensimulasikan akses pengguna secara simultan terhadap Endpoint Dashboard admin Sistem CPL berbasis OBE. Pengujian difokuskan pada proses Request-Response Endpoint yang menghasilkan data agregat dari Backend.
Endpoint yang diuji dalam skenario ini meliputi /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students. Ketiga Endpoint tersebut dipilih karena digunakan dalam proses pemuatan Dashboard admin dan menghasilkan data agregat yang dibutuhkan untuk menampilkan statistik CPL, analisis dosen, serta evaluasi mahasiswa.
Activity diagram pada Gambar 5 menggambarkan alur pengujian performa Endpoint Dashboard admin menggunakan Apache JMeter. Alur dimulai dari penyiapan lingkungan, penentuan skenario pengguna, penyusunan test plan, pengaturan Request dan header autentikasi, hingga pelaksanaan pengujian. Sistem memproses Request Dashboard melalui validasi token, Prisma ORM, dan MariaDB, kemudian Response dicatat oleh JMeter berdasarkan Response time, Throughput, Error rate, dan status Request. Jika seluruh skenario telah selesai, hasil pengujian dianalisis untuk mengidentifikasi dugaan Bottleneck dan menyusun rekomendasi perbaikan.
Skenario pengujian performa disusun menggunakan pendekatan peningkatan beban pengguna secara bertahap (incremental load). Pengujian diawali dengan 1 pengguna sebagai kondisi baseline, kemudian dilanjutkan dengan 10, 20, dan 50 pengguna sebagai kategori Load testing, serta 100, 200, dan 500 pengguna sebagai kategori Stress testing. Pengelompokan tersebut bertujuan untuk mengamati perubahan karakteristik performa Endpoint mulai dari kondisi operasional normal hingga kondisi beban tinggi dalam satu rangkaian skenario pengujian performa. Pada Apache JMeter, jumlah pengguna virtual diatur menggunakan Thread Group, sedangkan pengiriman Request ke setiap Endpoint dilakukan menggunakan HTTP Request.
Parameter yang diukur dalam pengujian ini meliputi:
    a) Response time, yaitu waktu yang dibutuhkan sistem untuk memberikan Response terhadap Request.
    b) Throughput, yaitu jumlah Request yang dapat diproses oleh sistem dalam satuan waktu tertentu.
    c) Error rate, yaitu persentase Request yang gagal selama proses pengujian.
    d) Kestabilan sistem, yaitu konsistensi performa Endpoint Dashboard berdasarkan pola perubahan Response time, Throughput, dan Error rate.
Hasil dari tahap ini berupa rancangan skenario pengujian performa beserta konfigurasi test plan Apache JMeter yang digunakan untuk melaksanakan seluruh skenario pengujian, mulai dari kondisi baseline, kategori Load testing, hingga kategori Stress testing.
    4. Konfigurasi Lingkungan Pengujian
Pada tahap ini dilakukan konfigurasi lingkungan pengujian yang terdiri dari perangkat Server dan perangkat Client. Server digunakan untuk menjalankan Sistem CPL berbasis OBE, sedangkan Client digunakan untuk menjalankan Apache JMeter sebagai alat pengujian beban. Pemisahan antara Server dan Client dilakukan agar proses simulasi pengguna virtual tidak membebani sumber daya Server aplikasi secara langsung.
Pengujian dilakukan sepenuhnya pada lingkungan jaringan lokal (LAN). Perangkat Client dan Server dihubungkan secara LAN-to-LAN menggunakan sebuah router yang berfungsi sebagai penengah lalu lintas jaringan. Topologi ini memastikan bahwa pengiriman Request HTTP/API dari Apache JMeter ke Endpoint Dashboard Admin, sekaligus koneksi Secure Shell (SSH) untuk pemantauan Glances, berjalan stabil tanpa intervensi atau latensi dari jaringan publik luar. Endpoint yang diuji meliputi /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students. Ketiga Endpoint tersebut membutuhkan autentikasi, sehingga konfigurasi JMeter juga mencakup pengaturan header Request, token autentikasi, dan sesi.
Dalam konfigurasi Apache JMeter, Thread Group digunakan untuk mengatur jumlah pengguna virtual, ramp-up period, dan jumlah iterasi pengujian. HTTP Request digunakan untuk menentukan Endpoint yang diuji, sedangkan HTTP Header Manager digunakan untuk menambahkan token autentikasi atau tipe konten yang dibutuhkan oleh Server. Listener digunakan untuk mencatat hasil pengujian, seperti Response time, Throughput, Error rate, dan status Request.
Sebelum pengujian utama dilakukan, koneksi antara Client dan Server diperiksa terlebih dahulu. Pemeriksaan dilakukan untuk memastikan Endpoint dapat diakses, autentikasi berhasil, Response yang diterima sesuai, serta konfigurasi Apache JMeter berjalan sesuai skenario. Hasil dari tahap ini adalah lingkungan pengujian dan konfigurasi test plan Apache JMeter yang siap digunakan untuk pelaksanaan skenario pengujian performa.
Tabel 10 Spesifikasi Lingkungan Pengujian
Komponen	Spesifikasi	Fungsi
Server Pengujian	Intel Core 2 Duo, RAM 3 GB, SSD 256 GB, Debian Server	Menjalankan Sistem CPL berbasis OBE, Backend Node.js dan Express.js, Prisma ORM, serta Database MariaDB
Client Penguji	Intel Core i7-6820HQ, RAM 16 GB, SSD 500 GB, Debian	Menjalankan Apache JMeter untuk membangkitkan beban Request ke Endpoint Dashboard admin
Jaringan	LAN-to-LAN (via Router)	Menghubungkan Client penguji dengan Server pengujian sebagai penengah lalu lintas Request HTTP/API (JMeter) dan koneksi pemantauan (SSH)

Konfigurasi Apache JMeter dilakukan dengan menyiapkan test plan sesuai skenario pengujian yang telah dirancang. Komponen utama yang digunakan dalam test plan ditunjukkan pada Tabel 12.

Tabel 11 Konfigurasi Apache JMeter
Komponen JMeter	Fungsi
Thread Group	Mengatur jumlah pengguna virtual, ramp-up period, dan jumlah iterasi pengujian
HTTP Request	Menentukan Endpoint Dashboard admin yang diuji
HTTP Header Manager	Menambahkan header Request, seperti token autentikasi atau tipe konten
Cookie Manager	Mengelola cookie atau sesi apabila diperlukan selama pengujian
Listener	Mencatat hasil pengujian, seperti Response time, Throughput, Error rate, dan ringkasan Request

Pada tahap ini juga dipastikan bahwa Endpoint Dashboard Admin dapat diakses dengan benar dari perangkat Client. Pemeriksaan dilakukan terhadap koneksi jaringan, keberhasilan autentikasi, penggunaan token atau sesi, serta Response yang dihasilkan oleh Endpoint. Hasil dari tahap konfigurasi ini adalah lingkungan pengujian dan konfigurasi Apache JMeter yang siap digunakan untuk melaksanakan seluruh skenario pengujian performa sesuai rancangan penelitian.
Sequence diagram pada Gambar 6 menjelaskan interaksi antar komponen saat Endpoint Dashboard admin diuji menggunakan Apache JMeter. JMeter mengirim Request GET dengan token JWT ke Auth Middleware untuk divalidasi. Jika token tidak valid, sistem mengembalikan Response 401 Unauthorized dan error dicatat oleh Listener/Report. Jika token valid, Request diteruskan ke Dashboard Controller untuk mengambil data agregat melalui Prisma ORM dan MariaDB, kemudian Response JSON dikirim kembali ke JMeter untuk dicatat berdasarkan Response time, Throughput, Error rate, dan status Request.
    5. Pelaksanaan Pengujian Performa
Pelaksanaan pengujian performa dilakukan untuk memperoleh data mengenai kemampuan Endpoint API Dashboard Admin Sistem CPL berbasis Outcome Based Education (OBE) dalam menangani peningkatan beban pengguna secara simultan. Pengujian dilaksanakan menggunakan Apache JMeter dengan memberikan beban secara bertahap pada setiap Endpoint, sehingga perubahan performa sistem dapat diamati pada berbagai tingkat beban pengguna.
Pada penelitian ini, Load testing dan Stress testing tidak dilaksanakan sebagai dua tahapan pengujian yang terpisah, melainkan sebagai satu rangkaian pengujian performa. Pendekatan ini dipilih agar pengujian mampu menggambarkan perubahan karakteristik performa sistem secara menyeluruh, mulai dari kondisi beban normal hingga beban tinggi. Hasil pengujian yang diperoleh selanjutnya digunakan sebagai dasar untuk menganalisis parameter performa, mengidentifikasi dugaan Bottleneck, serta menyusun rekomendasi perbaikan.
Pelaksanaan pengujian diawali dengan pengujian baseline menggunakan satu pengguna virtual untuk memperoleh gambaran performa awal sistem. Selanjutnya, jumlah pengguna virtual ditingkatkan secara bertahap menjadi 10, 20, 50, 100, 200, dan 500 pengguna. Peningkatan beban dilakukan secara bertingkat agar perubahan performa pada setiap Endpoint dapat diamati secara sistematis, sekaligus memudahkan identifikasi titik awal terjadinya penurunan performa. Rincian skenario pengujian yang digunakan dalam penelitian ini disajikan pada Tabel 12.
Tabel 12 Skenario Pengujian Performa
Tingkat Beban Pengguna	Kategori Pengujian	Tujuan
1 User	Baseline	Mengetahui performa awal Endpoint
10 User	Load testing	Mengamati perubahan performa pada beban rendah
20 User	Load testing	Mengamati perubahan performa pada beban operasional
50 User	Load testing	Mengidentifikasi awal penurunan performa
100 User	Stress testing	Mengevaluasi performa pada beban tinggi
200 User	Stress testing	Mengamati kestabilan Endpoint pada beban tinggi
500 User	Stress testing	Mengidentifikasi indikasi batas kemampuan Endpoint
Sumber: Diolah oleh penulis (2026)
Selain merekam metrik performa menggunakan Apache JMeter, penelitian ini juga melakukan pemantauan terhadap penggunaan sumber daya Server selama proses pengujian berlangsung. Pemantauan dilakukan melalui koneksi Secure Shell (SSH) menuju Server pengujian dengan memanfaatkan utilitas Glances. Parameter yang diamati meliputi utilisasi CPU dan penggunaan memori (RAM). Data penggunaan sumber daya direkam melalui tangkapan layar (screenshot) pada saat kondisi beban puncak (Peak load) untuk setiap skenario jumlah pengguna virtual. Selanjutnya, data tersebut dikonversi menjadi data kuantitatif yang digunakan sebagai informasi pendukung dalam analisis parameter performa, khususnya untuk mengidentifikasi dugaan Bottleneck serta menyusun rekomendasi perbaikan sistem.
    6. Pengumpulan Data Hasil Pengujian
Setelah seluruh skenario pengujian performa selesai dilaksanakan, tahap berikutnya adalah pengumpulan data hasil pengujian. Data yang dikumpulkan berasal dari dua sumber, yaitu hasil pengujian menggunakan Apache JMeter dan hasil pemantauan penggunaan sumber daya Server menggunakan Glances. Data dari Apache JMeter meliputi nilai Response time, Throughput, dan Error rate untuk setiap Endpoint dan setiap skenario jumlah pengguna virtual. Sementara itu, data dari Glances meliputi utilisasi CPU dan penggunaan memori (RAM) yang direkam pada saat kondisi beban puncak (Peak load).
Seluruh data hasil pengujian kemudian didokumentasikan dan dikelompokkan berdasarkan Endpoint yang diuji serta skenario jumlah pengguna virtual. Pengelompokan data bertujuan untuk mempermudah proses analisis pada tahap berikutnya sehingga setiap parameter performa dapat dievaluasi dan dibandingkan secara sistematis. Data yang telah terkumpul selanjutnya digunakan sebagai dasar dalam analisis Response time, Throughput, Error rate, kestabilan sistem, serta analisis penggunaan CPU dan memori untuk mengidentifikasi dugaan Bottleneck dan menyusun rekomendasi perbaikan.
    7. Analisis Parameter Performa
Pada tahap ini dilakukan analisis terhadap data hasil pengujian yang telah dikumpulkan pada tahap sebelumnya. Data yang dianalisis meliputi hasil pengujian Endpoint Dashboard Admin menggunakan Apache JMeter serta data pemantauan penggunaan sumber daya Server menggunakan Glances. Analisis difokuskan pada tiga Endpoint Dashboard Admin, yaitu /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students.
Analisis dilakukan dengan membandingkan hasil pengujian pada setiap skenario jumlah pengguna virtual, yaitu 1, 10, 20, 50, 100, 200, dan 500 pengguna. Perbandingan tersebut bertujuan untuk mengetahui perubahan performa Endpoint seiring dengan meningkatnya beban pengguna berdasarkan parameter Response time, Throughput, Error rate, dan kestabilan sistem. Sebagai data pendukung, analisis juga memanfaatkan informasi utilisasi CPU dan penggunaan memori (RAM) untuk membantu mengidentifikasi dugaan penyebab terjadinya penurunan performa.
Parameter Response time dianalisis untuk mengetahui perubahan waktu yang dibutuhkan setiap Endpoint dalam memproses permintaan dan mengirimkan respons. Parameter Throughput dianalisis untuk mengevaluasi kemampuan Endpoint dalam memproses jumlah permintaan per satuan waktu, sedangkan Error rate digunakan untuk mengetahui tingkat kegagalan permintaan pada setiap skenario pengujian. Kestabilan sistem dianalisis berdasarkan pola perubahan Response time, Throughput, dan Error rate pada setiap tingkat beban pengguna. Sementara itu, data utilisasi CPU dan penggunaan memori digunakan sebagai indikator pendukung untuk membantu mengidentifikasi dugaan Bottleneck yang memengaruhi performa sistem.
Parameter yang digunakan dalam analisis performa beserta bentuk analisis yang dilakukan disajikan pada Tabel 13
Tabel 13 Parameter Analisis Performa

Hasil analisis digunakan untuk menilai kemampuan setiap Endpoint Dashboard Admin dalam mempertahankan performa pada berbagai skenario pengujian. Berdasarkan hasil tersebut, kondisi performa Endpoint dapat diklasifikasikan ke dalam kategori baik, mulai menurun, atau tidak stabil sesuai dengan kriteria operasional evaluasi performa yang telah ditetapkan.
Untuk menginterpretasikan hasil analisis pada setiap parameter, penelitian ini menggunakan kriteria operasional evaluasi performa sebagai instrumen evaluasi. Kriteria tersebut digunakan sebagai pedoman dalam mengklasifikasikan kondisi performa Endpoint pada setiap skenario pengujian sehingga hasil analisis dapat diinterpretasikan secara objektif dan konsisten. Evaluasi difokuskan pada mekanisme Request-Response API dalam menghasilkan data agregat dari Backend, sehingga tidak mencakup aspek Frontend, proses rendering pada browser, maupun komponen lain di luar Endpoint API yang diuji [65].
Kriteria operasional evaluasi performa disusun berdasarkan karakteristik Performance Efficiency dan Reliability pada ISO/IEC 25010 [66], serta sintesis berbagai penelitian mengenai evaluasi performa aplikasi web dan API menggunakan Load testing [67], [68]. Kriteria tersebut tidak dimaksudkan sebagai standar baku yang berlaku secara universal, melainkan sebagai kriteria operasional yang disesuaikan dengan karakteristik objek penelitian.
Berdasarkan landasan tersebut, disusun kriteria operasional evaluasi yang mengintegrasikan parameter Response time, Throughput, Error rate, dan kestabilan sistem sehingga evaluasi performa dapat dilakukan secara menyeluruh terhadap Endpoint Dashboard Admin. Kriteria operasional evaluasi performa yang digunakan pada penelitian ini disajikan pada Tabel 14.
Tabel 14 Kriteria Operasional Evaluasi Performa
Parameter	Baik	Cukup	Kurang	Buruk / Tidak Stabil
Response time	≤ 3 detik	> 3–5 detik	> 5–10 detik	> 10 detik
Error rate	0%	> 0–1%	> 1–5%	> 5%
Throughput	Meningkat secara konsisten pada setiap peningkatan beban pengguna	Masih meningkat, tetAPI laju peningkatannya mulai melambat pada beban tinggi	Cenderung stagnan meskipun jumlah pengguna terus bertambah	Menurun meskipun jumlah pengguna meningkat
Kestabilan Sistem	Seluruh Request berhasil diproses, Throughput meningkat secara konsisten, dan tidak terjadi error selama pengujian	Seluruh Request berhasil diproses, namun terjadi peningkatan Response time atau perlambatan Throughput pada beban tinggi tanpa adanya Request gagal	Terjadi lonjakan Response time disertai stagnasi Throughput yang menunjukkan penurunan kemampuan sistem dalam mempertahankan performa	Terjadi banyak Request gagal, Response time sangat tinggi, Throughput menurun, atau sistem tidak mampu mempertahankan layanan pada beban tinggi
Sumber : Disusun peneliti berdasarkan karakteristik Performance Efficiency dan Reliability pada ISO/IEC 25010 [65], serta sintesis penelitian mengenai evaluasi performa aplikasi web dan API menggunakan Load testing [66], [67], [68].
Kriteria pada Tabel 14 digunakan sebagai dasar dalam mengevaluasi hasil analisis performa pada seluruh skenario pengujian. Berdasarkan hasil evaluasi tersebut, ditentukan kategori performa masing-masing Endpoint sehingga dapat diidentifikasi dugaan Bottleneck yang memengaruhi performa sistem. Selanjutnya, hasil identifikasi tersebut digunakan sebagai dasar dalam penyusunan rekomendasi perbaikan performa Dashboard Admin Sistem CPL.
    8. Identifikasi Dugaan Bottleneck
Pada tahap ini dilakukan identifikasi dugaan Bottleneck berdasarkan pola perubahan Response time, Throughput, Error rate, dan kestabilan sistem pada setiap skenario pengujian. Identifikasi ini bertujuan untuk mengetahui Endpoint atau proses yang berpotensi menyebabkan penurunan performa pada Dashboard admin Sistem CPL berbasis OBE.
Identifikasi dugaan Bottleneck dilakukan dengan membandingkan performa masing-masing Endpoint Dashboard admin, yaitu /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students. Endpoint yang menunjukkan Response time paling tinggi, Throughput paling rendah, Error rate lebih besar, atau kestabilan paling buruk pada skenario pengujian tertentu diposisikan sebagai Endpoint yang berpotensi menjadi sumber Bottleneck.
Penelusuran ini dilakukan secara hati-hati karena penelitian tidak melakukan profiling kode, tracing Query secara mendalam, maupun pemeriksaan internal basis data secara langsung. Oleh karena itu, hasil identifikasi tidak diposisikan sebagai pembuktian pasti terhadap satu komponen tertentu, melainkan sebagai dugaan teknis yang disusun berdasarkan pola hasil pengujian serta karakteristik Endpoint yang diuji.
Faktor yang dianalisis meliputi proses agregasi pada Backend, kompleksitas Query basis data, relasi antartabel, penggunaan Filter, ukuran Payload Response, antrean Request, serta keterbatasan sumber daya Server. Faktor-faktor tersebut dipilih karena Endpoint Dashboard Admin tidak hanya mengambil satu jenis data, tetAPI juga melakukan proses pengolahan dan agregasi beberapa kelompok data sebelum respons dikirimkan ke Frontend. Analisis terhadap faktor-faktor tersebut digunakan sebagai dasar dalam mengidentifikasi dugaan Bottleneck serta menyusun rekomendasi perbaikan performa sistem.
Tabel 15 Kriteria Identifikasi Dugaan Bottleneck Berdasarkan Hasil Pengujian
No	Indikasi Hasil Pengujian	Interpretasi Hasil	Dugaan Faktor Penyebab
1	Salah satu Endpoint memiliki Response time paling tinggi dibanding Endpoint lainnya	Endpoint memerlukan waktu pemrosesan lebih lama dibanding Endpoint lain sehingga terdapat indikasi proses yang lebih kompleks	Diduga berkaitan dengan proses agregasi pada Backend, kompleksitas Query basis data, relasi antartabel, penggunaan Filter, atau ukuran Payload Response yang lebih besar
2	Response time meningkat secara signifikan seiring bertambahnya jumlah pengguna virtual	Waktu pemrosesan meningkat ketika beban bertambah sehingga kapasitas pemrosesan mulai mendekati batas kemampuan sistem	Diduga berkaitan dengan peningkatan beban proses Backend, Query basis data, atau antrean Request
3	Throughput tidak meningkat secara proporsional terhadap penambahan jumlah pengguna	Sistem tidak mampu meningkatkan jumlah Request yang diproses sebanding dengan peningkatan beban	Diduga kapasitas pemrosesan Endpoint atau sumber daya Server mulai menjadi pembatas
4	Error rate tetap rendah atau mulai meningkat pada skenario tertentu	Menunjukkan kemampuan sistem dalam mempertahankan keberhasilan pemrosesan Request pada berbagai tingkat beban	Diduga berkaitan dengan kapasitas layanan, mekanisme penanganan Request, atau stabilitas Backend
5	Terjadi peningkatan Response time disertai stagnasi Throughput pada beban tinggi	Menunjukkan penurunan kestabilan performa sistem ketika menerima peningkatan beban	Diduga berkaitan dengan keterbatasan sumber daya Server, peningkatan kompleksitas proses Backend, atau beban Query yang semakin tinggi

Selain berdasarkan indikasi umum pada Tabel 15, analisis juga diarahkan pada karakteristik masing-masing Endpoint. Hal ini dilakukan agar dugaan Bottleneck dapat dikaitkan dengan bagian Dashboard admin yang diuji.
Tabel 16 Karakteristik Teknis Endpoint yang Dianalisis
Endpoint	Karakteristik Proses Backend	Parameter yang Menjadi Fokus Analisis
/API/Dashboard/stats	Agregasi statistik Dashboard	Response time, Throughput, Error rate
/API/Dashboard/dosen	Agregasi data dosen dan progres nilai	Response time, Throughput, Error rate
/API/Dashboard/students	Agregasi data evaluasi mahasiswa	Response time, Throughput, Error rate

Selain analisis terhadap masing-masing Endpoint, penelitian ini juga mengevaluasi kestabilan sistem secara keseluruhan dengan mengintegrasikan hasil pengujian Response time, Throughput, dan Error rate, serta data pendukung berupa penggunaan CPU dan memori Server. Evaluasi tersebut bertujuan untuk memberikan gambaran menyeluruh mengenai kemampuan sistem dalam mempertahankan performanya pada berbagai tingkat beban pengguna. Selanjutnya, hasil identifikasi dugaan Bottleneck digunakan sebagai dasar dalam penyusunan rekomendasi perbaikan sehingga setiap rekomendasi yang diusulkan tetap berlandaskan pada temuan empiris hasil pengujian, bukan hanya berdasarkan asumsi atau pertimbangan umum.
    9. Penyusunan Rekomendasi Perbaikan
Pada tahap ini disusun rekomendasi perbaikan berdasarkan hasil evaluasi performa dan identifikasi dugaan Bottleneck. Rekomendasi diarahkan pada Endpoint Dashboard admin yang menunjukkan performa paling lemah, baik dari sisi Response time, Throughput, Error rate, maupun kestabilan sistem.
Jika Endpoint /API/Dashboard/stats menunjukkan performa paling rendah, maka rekomendasi diarahkan pada evaluasi proses agregasi statistik, grafik CPL, tren semester, alert, dan insight. Jika Endpoint /API/Dashboard/dosen lebih lambat, maka rekomendasi diarahkan pada proses analisis dosen, relasi dosen dengan mata kuliah, dan progres input nilai. Sementara itu, jika Endpoint /API/Dashboard/students bermasalah, maka rekomendasi diarahkan pada evaluasi relasi mahasiswa dengan nilai, ukuran Response, dan pembatasan data yang dikirim.
Rekomendasi dalam penelitian ini bersifat terbatas karena tidak dilakukan implementasi optimasi secara penuh. Rekomendasi hanya disusun berdasarkan pola hasil pengujian dan dugaan teknis dari proses pemuatan data agregat Dashboard admin.
Tabel 17 Arah Rekomendasi Perbaikan
No	Dugaan Masalah	Contoh Arah Rekomendasi Perbaikan
1	Query Database membutuhkan waktu lama	Evaluasi Query dan penggunaan Indexing pada kolom yang sering digunakan
2	Proses agregasi data dilakukan berulang	Penerapan Caching pada data agregat yang sering diakses
3	Ukuran Response terlalu besar	Pembatasan ukuran Payload Response dan pengambilan data sesuai kebutuhan
4	Backend mengambil data atau relasi melebihi kebutuhan	Pengurangan Over-fetching dengan membatasi field, relasi, dan data yang diambil
5	Salah satu Endpoint memuat proses terlalu berat	Evaluasi atau pemisahan proses berat pada Endpoint yang bermasalah
6	Server mengalami keterbatasan sumber daya	Penyesuaian konfigurasi atau spesifikasi Server

Hasil dari tahap ini berupa rekomendasi teknis yang dapat digunakan sebagai dasar pengembangan lanjutan agar Endpoint Dashboard admin lebih responsif dan stabil ketika menerima Request pengguna secara simultan.
    10. Penarikan Kesimpulan
Pada tahap ini dilakukan penarikan kesimpulan berdasarkan seluruh hasil analisis pengujian. Kesimpulan disusun untuk menjawab rumusan masalah, mencakup kondisi performa Endpoint Dashboard admin, perubahan parameter pada setiap skenario pengujian, Endpoint yang menunjukkan penurunan performa paling besar, serta dugaan Bottleneck yang ditemukan.
Kesimpulan didasarkan pada hasil skenario pengujian performa terhadap tiga Endpoint Dashboard Admin, yaitu /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students. Skenario pengujian meliputi kondisi baseline, kategori Load testing, dan kategori Stress testing. Parameter yang dianalisis meliputi Response time, Throughput, Error rate, dan kestabilan sistem. Hasil pengujian pada setiap Endpoint dibandingkan untuk mengetahui perubahan performa, mengidentifikasi dugaan Bottleneck, serta menjadi dasar penyusunan rekomendasi perbaikan.
Selain itu, kesimpulan juga memuat rekomendasi perbaikan performa secara terbatas. Rekomendasi tersebut disusun berdasarkan pola hasil pengujian dan dugaan teknis, seperti evaluasi Query Database, penggunaan Indexing, penerapan Caching data agregat, pengurangan Over-fetching, pembatasan ukuran Payload Response, serta penyesuaian konfigurasi Server apabila diperlukan.
Dengan demikian, hasil akhir penelitian ini berupa gambaran performa Endpoint Dashboard admin Sistem CPL berbasis OBE, indikasi Endpoint yang paling berpotensi menjadi sumber Bottleneck, serta arahan perbaikan yang dapat digunakan sebagai dasar pengembangan sistem selanjutnya.
    D. Analisis Data
Analisis data dilakukan terhadap hasil pengujian performa yang diperoleh menggunakan Apache JMeter dan data pemantauan sumber daya Server menggunakan Glances. Analisis difokuskan pada tiga Endpoint Dashboard Admin, yaitu /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students. Evaluasi dilakukan dengan membandingkan hasil pengujian pada setiap skenario jumlah pengguna virtual menggunakan kriteria operasional evaluasi performa yang telah ditetapkan. Analisis mencakup parameter Response time, Throughput, Error rate, kestabilan sistem, serta didukung oleh data utilisasi CPU dan penggunaan memori untuk mengidentifikasi dugaan Bottleneck dan menyusun rekomendasi perbaikan.
Tahapan analisis data pada penelitian ini terdiri atas analisis parameter performa, identifikasi dugaan Bottleneck, dan penyusunan rekomendasi perbaikan
        1. Analisis Parameter Performa
Analisis parameter performa dilakukan dengan mengevaluasi hasil pengujian berdasarkan parameter Response time, Throughput, Error rate, kestabilan sistem, serta utilisasi CPU dan penggunaan memori. Evaluasi dilakukan menggunakan kriteria operasional evaluasi performa yang telah ditetapkan sehingga perubahan performa sistem pada setiap skenario pengujian dapat diinterpretasikan secara objektif dan konsisten.
Tahapan analisis parameter performa meliputi:
            a. Analisis Response time
Analisis Response time dilakukan untuk mengetahui waktu yang dibutuhkan sistem dalam memberikan respons terhadap Request yang dikirimkan. Nilai Response time pada setiap skenario dibandingkan untuk melihat perubahan performa seiring meningkatnya jumlah pengguna virtual
            b. Analisis Throughput
Analisis Throughput dilakukan untuk mengetahui jumlah Request yang dapat diproses sistem dalam satuan waktu tertentu. Nilai Throughput digunakan untuk mengevaluasi kemampuan sistem dalam menangani peningkatan beban pengguna.
            c. Analisis Error rate
Analisis Error rate dilakukan untuk mengetahui persentase Request yang gagal diproses oleh sistem selama pengujian berlangsung. Peningkatan Error rate digunakan sebagai salah satu indikator penurunan performa sistem.
            d. Analisis Kestabilan Sistem
Analisis kestabilan sistem dilakukan dengan mengamati konsistensi Response time, Throughput, dan Error rate pada setiap skenario pengujian. Sistem dianggap mengalami penurunan kestabilan apabila terjadi peningkatan Response time yang signifikan, penurunan Throughput, atau peningkatan Error rate pada tingkat beban tertentu.
            e. Analisis Penggunaan CPU dan Memori
Analisis penggunaan CPU dan memori dilakukan berdasarkan data hasil pemantauan menggunakan Glances pada setiap skenario pengujian. Data utilisasi CPU dan penggunaan memori kemudian dikorelasikan dengan parameter Response time, Throughput, dan Error rate untuk membantu mengidentifikasi indikasi keterbatasan sumber daya Server maupun dugaan penyebab penurunan performa sistem.
        2. Identifikasi Dugaan Bottleneck
Berdasarkan hasil analisis parameter performa, dilakukan identifikasi terhadap dugaan Bottleneck yang memengaruhi performa Dashboard Admin Sistem CPL. Identifikasi dilakukan dengan menghubungkan pola perubahan Response time, Throughput, Error rate, serta data utilisasi CPU dan penggunaan memori sehingga diperoleh dugaan penyebab utama penurunan performa pada setiap Endpoint.
        3. Penyusunan Rekomendasi Perbaikan
Tahap akhir analisis data dilakukan dengan menyusun rekomendasi perbaikan berdasarkan hasil identifikasi dugaan Bottleneck. Rekomendasi difokuskan pada upaya peningkatan performa Dashboard Admin Sistem CPL melalui perbaikan arsitektur perangkat lunak, optimalisasi proses pengolahan data, maupun pemanfaatan sumber daya sistem secara lebih efisien sesuai dengan temuan hasil pengujian.
Hasil analisis data selanjutnya disajikan dalam bentuk tabel dan uraian pembahasan untuk menggambarkan performa masing-masing Endpoint Dashboard Admin Sistem CPL berbasis OBE pada setiap skenario pengujian. Selanjutnya, hasil analisis tersebut dievaluasi menggunakan kriteria operasional evaluasi performa yang telah ditetapkan untuk menentukan kategori performa setiap Endpoint. Hasil evaluasi kemudian digunakan sebagai dasar dalam mengidentifikasi dugaan Bottleneck yang memengaruhi performa sistem serta menyusun rekomendasi perbaikan yang sesuai.
    E. Jadwal Penelitian
Jadwal penelitian disusun untuk menggambarkan tahapan kegiatan dari penyusunan proposal hingga penyelesaian laporan akhir. Penelitian ini direncanakan berlangsung selama kurang lebih 45 hari kerja dan dibagi menjadi tiga tahap, yaitu tahap persiapan, tahap penelitian, dan tahap akhir.
Tahap persiapan mencakup studi literatur, perumusan masalah, penetapan metode penelitian, penyusunan proposal, dan seminar proposal. Tahap penelitian mencakup analisis sistem eksisting, perancangan skenario pengujian performa, konfigurasi lingkungan pengujian, pelaksanaan skenario pengujian performa, pengumpulan data hasil pengujian, analisis performa, identifikasi dugaan Bottleneck, serta penyusunan rekomendasi perbaikan. Tahap akhir mencakup penulisan laporan skripsi, konsultasi dan finalisasi bersama dosen pembimbing, persiapan sidang, serta publikasi ilmiah. Pembagian tahapan tersebut dilakukan agar pelaksanaan penelitian berlangsung secara sistematis mulai dari tahap persiapan, pelaksanaan penelitian, hingga penyusunan laporan.
Secara keseluruhan, jadwal penelitian ini disusun agar pelaksanaan penelitian berjalan runtut sesuai dengan alur yang telah dirancang. Rincian waktu dan pembagian kegiatan penelitian ditunjukkan pada Gambar 7. 







    BAB IV HASIL DAN PEMBAHASAN

    A. Hasil
Pada bagian ini disajikan hasil pengujian performa Dashboard Admin Sistem Capaian Pembelajaran Lulusan (CPL) berbasis Outcome Based Education (OBE) yang telah dilakukan menggunakan Apache JMeter. Pengujian dilakukan terhadap tiga Endpoint Dashboard Admin, yaitu /API/Dashboard/stats, /API/Dashboard/dosen, dan /API/Dashboard/students dengan beberapa skenario jumlah pengguna virtual. Hasil pengujian yang diperoleh berupa nilai Response time, Throughput, dan Error rate pada setiap Endpoint yang diuji.
Hasil pengujian disajikan berdasarkan masing-masing Endpoint agar perubahan performa pada setiap skenario pengujian dapat terlihat dengan lebih jelas. Data hasil pengujian pada bagian ini disajikan beserta hasil klasifikasi berdasarkan kriteria operasional evaluasi performa yang telah ditetapkan pada Bab III. Penyajian tersebut bertujuan untuk memudahkan pembacaan hasil pada setiap skenario pengujian. Adapun analisis, interpretasi, perbandingan antar Endpoint, identifikasi dugaan Bottleneck, serta penyusunan rekomendasi perbaikan dilakukan pada bagian pembahasan. 
        1. Hasil Pengujian Endpoint /API/Dashboard/stats
Pengujian pada Endpoint /API/Dashboard/stats dilakukan untuk memperoleh data performa Endpoint dalam melayani permintaan data Dashboard Admin pada berbagai tingkat beban pengguna virtual. Endpoint ini digunakan untuk menyediakan data statistik yang ditampilkan pada halaman Dashboard Admin, seperti statistik umum, grafik capaian pembelajaran, tren semester, alert, dan informasi pendukung lainnya. Hasil pengujian beserta klasifikasi performa Endpoint /API/Dashboard/stats berdasarkan kriteria operasional evaluasi performa disajikan pada Tabel 18.
Tabel 18 Hasil Pengujian dan Kategori Performa Endpoint /API/Dashboard/stats
User	Response time (ms)	Kategori 	Throughput (req/s)	Kategori	Error rate (%)	Kategori
1	13,0	Baik	0,14	Baik	0,0	Baik
10	35,4	Baik	1,23	Baik	0,0	Baik
20	69,0	Baik	2,37	Baik	0,0	Baik
50	613,2	Baik	4,18	Cukup	0,0	Baik
100	2.484,1	Baik	4,44	Kurang	0,0	Baik
200	5.987,6	Kurang	4,46	Kurang	0,0	Baik
500	15.548,8	Buruk / Tidak Stabil	4,50	Kurang	0,0	Baik

Berdasarkan Tabel 18 diperoleh data hasil pengujian Endpoint /API/Dashboard/stats pada setiap skenario jumlah pengguna virtual. Pengujian dilakukan mulai dari 1 pengguna hingga 500 pengguna secara simultan dengan mengukur parameter Response time, Throughput, dan Error rate. Data hasil pengujian tersebut selanjutnya digunakan sebagai dasar dalam analisis performa Endpoint pada bagian pembahasan.
        2. Hasil Pengujian Endpoint /API/Dashboard/dosen
Pengujian pada Endpoint /API/Dashboard/dosen dilakukan untuk memperoleh data performa Endpoint dalam melayani permintaan informasi yang berkaitan dengan data dosen pada Dashboard Admin. Endpoint ini digunakan untuk menyajikan informasi mengenai dosen, mata kuliah yang diampu, serta progres pengisian nilai. Hasil pengujian beserta klasifikasi performa Endpoint /API/Dashboard/stats berdasarkan kriteria operasional evaluasi performa disajikan pada Tabel 19.
Tabel 19 Hasil Pengujian dan Kategori Performa Endpoint /API/Dashboard/dosen
User	Response time (ms)	Kategori	Throughput (req/s)	Kategori	Error rate (%)	Kategori
1	4,7	Baik	0,14	Baik	0,0	Baik
10	29,0	Baik	1,23	Baik	0,0	Baik
20	43,4	Baik	2,39	Baik	0,0	Baik
50	521,4	Baik	4,14	Cukup	0,0	Baik
100	2.482,0	Baik	4,27	Kurang	0,0	Baik
200	6.019,6	Kurang	4,22	Kurang	0,0	Baik
500	15.777,8	Buruk / Tidak Stabil	4,19	Kurang	0,0	Baik

Berdasarkan Tabel 19 diperoleh data hasil pengujian Endpoint /API/Dashboard/dosen pada setiap skenario jumlah pengguna virtual. Pengujian dilakukan menggunakan jumlah pengguna yang sama dengan Endpoint sebelumnya sehingga hasil yang diperoleh dapat dibandingkan pada tahap pembahasan. Parameter yang diamati meliputi Response time, Throughput, dan Error rate sebagai indikator performa Endpoint ketika menerima peningkatan beban pengguna.
        3. Hasil Pengujian Endpoint /API/Dashboard/students
Pengujian pada Endpoint /API/Dashboard/students dilakukan untuk memperoleh data performa Endpoint dalam melayani permintaan informasi mahasiswa pada Dashboard Admin. Endpoint ini digunakan untuk menyajikan data mahasiswa beserta informasi pendukung yang berkaitan dengan proses evaluasi capaian pembelajaran. Hasil pengujian beserta klasifikasi performa Endpoint /API/Dashboard/stats berdasarkan kriteria operasional evaluasi performa disajikan pada Tabel 20.
Tabel 20 Hasil Pengujian dan Kategori Performa Endpoint /API/Dashboard/students
User	Response time (ms)	Kategori	Throughput (req/s)	Kategori	Error rate (%)	Kategori
1	11,1	Baik	0,15	Baik	0,0	Baik
10	37,2	Baik	1,20	Baik	0,0	Baik
20	52,0	Baik	2,39	Baik	0,0	Baik
50	539,9	Baik	4,01	Cukup	0,0	Baik
100	2.514,7	Baik	4,17	Kurang	0,0	Baik
200	6.170,7	Kurang	3,91	Kurang	0,0	Baik
500	15.894,4	Buruk / Tidak Stabil	3,77	Kurang	0,0	Baik

Berdasarkan Tabel 20 diperoleh data hasil pengujian Endpoint /API/Dashboard/students pada setiap skenario jumlah pengguna virtual. Pengujian dilakukan menggunakan variasi jumlah pengguna virtual mulai dari 1 hingga 500 pengguna dengan parameter pengujian berupa Response time, Throughput, dan Error rate. Data hasil pengujian tersebut selanjutnya digunakan sebagai dasar dalam pembahasan untuk mengevaluasi performa Endpoint /API/Dashboard/students berdasarkan hasil pengujian yang telah diperoleh.
        4. Hasil Pemantauan Penggunaan CPU dan Memori Server
Selain mengukur metrik performa berupa Response time, Throughput, dan Error rate pada API Endpoint Dashboard Admin Sistem CPL, penelitian ini juga melakukan pemantauan penggunaan sumber daya Server sebagai data pendukung untuk membantu menginterpretasikan hasil pengujian performa. Pemantauan dilakukan pada setiap skenario jumlah pengguna virtual menggunakan utilitas Glances yang diakses melalui protokol SSH. Data direkam pada saat beban (Peak load) setiap skenario mencapai kondisi tertinggi berdasarkan aktivitas Request yang dihasilkan oleh Apache JMeter. Ringkasan hasil pemantauan disajikan pada Tabel 21.
Tabel 21 Ringkasan Hasil Pemantauan CPU dan Memori Server
User	Penggunaan CPU Global (%)	CPU Node.js	Penggunaan Memori (MB/%)
0	8,7%	4,6%	1.80G / 64,8%
1	11,2%	4,6%	1.80G (~1843 MB) / 64,8%
10	32,5%	23%	1.78G (~1822 MB) / 64,1%
20	47,2%	67,7%	1.77G (~1812 MB) / 63,7%
50	59,5%	95%	1.79G (~1832 MB) / 64,4%
100	61,2%	101%	1.82G (~1863 MB) / 65,6%
200	65,3%	98,5%	1.82G (~1863 MB) / 65,5%
500	61,3%	101%	1.84G (~1884 MB) / 66,4%

Berdasarkan Tabel 21, penggunaan CPU global menunjukkan kecenderungan meningkat seiring bertambahnya jumlah pengguna virtual yang mengakses API Endpoint Dashboard Admin Sistem CPL. Peningkatan tersebut terjadi dari 8,7% pada kondisi awal menjadi 65,3% pada skenario 200 pengguna. Pada skenario 500 pengguna, penggunaan CPU global berada pada kisaran 61,3%.
Berbeda dengan CPU, penggunaan memori Server relatif stabil selama seluruh pengujian. Konsumsi memori berubah dari sekitar 1,80 GB (64,8%) pada kondisi awal menjadi sekitar 1,84 GB (66,4%) pada skenario 500 pengguna.
Hasil pemantauan pada tingkat proses (process-level monitoring) menunjukkan bahwa proses Node.js merupakan proses dengan penggunaan CPU tertinggi selama pengujian berlangsung. Penggunaan CPU proses Node.js meningkat dari 4,6% pada kondisi awal hingga mencapai sekitar 101% pada skenario 100 dan 500 pengguna, sebagaimana ditunjukkan pada Gambar 8. Nilai tersebut merepresentasikan penggunaan CPU oleh proses Node.js sehingga berbeda dengan penggunaan CPU global yang menggambarkan utilisasi seluruh sistem.

Data penggunaan CPU dan memori tersebut selanjutnya digunakan sebagai data pendukung pada bagian pembahasan untuk membantu menginterpretasikan hasil pengujian performa berdasarkan parameter Response time, Throughput, Error rate, dan kestabilan sistem.
    B. Pembahasan
Pada bagian ini dilakukan pembahasan terhadap hasil pengujian performa Dashboard Admin Sistem CPL berdasarkan parameter Response time, Throughput, Error rate, serta penggunaan CPU dan memori Server. Pembahasan diawali dengan analisis setiap parameter performa untuk mengetahui pola perubahan yang terjadi akibat peningkatan jumlah pengguna virtual. Selanjutnya, hasil analisis tersebut dievaluasi berdasarkan kriteria operasional evaluasi performa yang telah ditetapkan pada Bab III. Berdasarkan hasil analisis dan evaluasi tersebut dilakukan identifikasi dugaan Bottleneck sebagai dasar dalam penyusunan rekomendasi perbaikan untuk meningkatkan performa Dashboard Admin Sistem CPL.
        1. Analisis Parameter Performa
Pada subbab ini dilakukan analisis terhadap setiap parameter performa yang diukur selama proses pengujian, yaitu Response time, Throughput, Error rate, serta penggunaan CPU dan memori Server. Analisis dilakukan untuk mengetahui pola perubahan performa sistem pada berbagai skenario jumlah pengguna virtual. Selanjutnya, hasil analisis dievaluasi menggunakan kriteria operasional evaluasi performa yang telah ditetapkan pada Bab III sebagai dasar untuk menilai kondisi performa sistem.
    a. Analisis Response time 
Response time merupakan waktu yang dibutuhkan sistem untuk memproses suatu Request hingga memberikan Response kepada pengguna. Semakin kecil nilai Response time yang diperoleh, maka semakin cepat sistem dalam memberikan respons terhadap permintaan pengguna.
Berdasarkan hasil pengujian yang telah dilakukan, ketiga Endpoint menunjukkan pola perubahan Response time yang relatif serupa. Pada jumlah pengguna yang rendah, yaitu 1 hingga 20 pengguna virtual, seluruh Endpoint masih mampu memberikan waktu respons yang relatif cepat. Namun, ketika jumlah pengguna meningkat menjadi 50 pengguna atau lebih, nilai Response time mulai mengalami peningkatan yang cukup signifikan. Untuk memberikan gambaran yang lebih ringkas mengenai perubahan Response time pada setiap Endpoint, hasil pengujian dirangkum pada Tabel 22.
Tabel 22 Ringkasan Hasil Pengujian Response time
Endpoint	Response time Terendah	Response time Tertinggi	Pola Perubahan
/stats	13,0	15.548,8	Meningkat bertahap hingga 20 pengguna, kemudian meningkat tajam mulai 50 pengguna
/dosen	4,7	15.777,8	Meningkat bertahap hingga 20 pengguna, kemudian meningkat tajam mulai 50 pengguna
/students	11,1	15.894,4	Meningkat bertahap hingga 20 pengguna, kemudian meningkat tajam mulai 50 pengguna

Berdasarkan Tabel 22, Response time seluruh Endpoint menunjukkan kecenderungan meningkat seiring bertambahnya jumlah pengguna virtual. Peningkatan tersebut relatif rendah pada skenario 1 hingga 20 pengguna, kemudian meningkat lebih tajam mulai skenario 50 pengguna hingga mencapai nilai tertinggi pada skenario 500 pengguna. Meskipun ketiga Endpoint memiliki pola perubahan yang serupa, Endpoint /API/Dashboard/students secara konsisten menghasilkan Response time yang lebih tinggi dibandingkan Endpoint lainnya pada skenario beban tinggi.
Berdasarkan hasil analisis tersebut dan mengacu pada kriteria operasional evaluasi performa pada Tabel 14, Response time seluruh Endpoint masih berada pada kategori Baik pada skenario 1 hingga 100 pengguna karena waktu respons masih berada di bawah batas yang telah ditetapkan. Namun, pada skenario 200 pengguna, Response time seluruh Endpoint meningkat hingga melebihi 5 detik sehingga termasuk kategori Kurang. Selanjutnya, pada skenario 500 pengguna, Response time seluruh Endpoint melebihi 10 detik sehingga dikategorikan Buruk/Tidak Stabil.
Berdasarkan hasil analisis dan evaluasi tersebut, Endpoint /API/Dashboard/students menunjukkan penurunan performa yang paling besar dengan Response time tertinggi sebesar 15.894,4 ms, diikuti oleh Endpoint /API/Dashboard/dosen sebesar 15.777,8 ms dan Endpoint /API/Dashboard/stats sebesar 15.548,8 ms. Temuan ini menunjukkan bahwa peningkatan jumlah pengguna virtual memberikan dampak yang semakin besar terhadap waktu pemrosesan sistem, terutama pada Endpoint /API/Dashboard/students.
    b. Analisis Throughput
Throughput merepresentasikan jumlah Request yang berhasil diproses oleh sistem dalam satu satuan waktu (Request per detik). Nilai Throughput yang lebih tinggi menunjukkan kemampuan sistem dalam memproses permintaan secara simultan dengan kapasitas yang lebih besar.
Berdasarkan hasil pengujian, ketiga Endpoint menunjukkan tren peningkatan Throughput seiring bertambahnya jumlah pengguna virtual pada skenario awal. Peningkatan tersebut merupakan kondisi yang wajar karena bertambahnya jumlah permintaan yang diterima Server. Namun, ketika jumlah pengguna terus ditingkatkan hingga skenario beban tinggi, laju peningkatan Throughput mulai melambat dan cenderung stagnan. Untuk memberikan gambaran yang lebih ringkas mengenai perubahan nilai Throughput pada setiap Endpoint, hasil pengujian dirangkum pada Tabel 23.
Tabel 23 Ringkasan Hasil Pengujian Throughput
Endpoint	Throughput Terendah	Throughput Tertinggi	Pola Perubahan
/stats	0,14 req/s	4,50 req/s	Meningkat bertahap hingga 100 pengguna, kemudian cenderung stabil
/dosen	0,14 req/s	4,27 req/s	Meningkat bertahap hingga 100 pengguna, kemudian cenderung stabil
/students	0,15 req/s	4,17 req/s	Meningkat bertahap hingga 100 pengguna, kemudian cenderung stabil

Berdasarkan Tabel 23, Throughput seluruh Endpoint menunjukkan kecenderungan meningkat seiring bertambahnya jumlah pengguna virtual pada skenario awal. Peningkatan tersebut berlangsung secara bertahap hingga skenario 100 pengguna, kemudian cenderung stagnan meskipun jumlah pengguna virtual terus meningkat hingga 500 pengguna. Kondisi ini menunjukkan bahwa peningkatan jumlah Request tidak lagi diikuti oleh peningkatan kapasitas pemrosesan sistem secara proporsional. Di antara ketiga Endpoint, /API/Dashboard/students mencatat nilai Throughput tertinggi yang paling rendah, yaitu sebesar 4,17 req/s, sedangkan Endpoint /API/Dashboard/stats mencapai 4,50 req/s.
Berdasarkan hasil analisis tersebut dan mengacu pada kriteria operasional evaluasi performa pada Tabel 14, Throughput seluruh Endpoint masih berada pada kategori Baik pada skenario pengguna rendah hingga sedang karena kapasitas pemrosesan masih meningkat seiring bertambahnya jumlah pengguna virtual. Namun, pada skenario beban tinggi (100 hingga 500 pengguna), peningkatan Throughput mulai melambat dan cenderung stagnan sehingga termasuk kategori Kurang, karena sistem tidak mampu meningkatkan kapasitas pemrosesan secara proporsional terhadap peningkatan jumlah pengguna.
Berdasarkan hasil analisis dan evaluasi tersebut, peningkatan jumlah pengguna virtual tidak lagi diikuti oleh peningkatan kapasitas pemrosesan sistem secara proporsional pada skenario beban tinggi. Kondisi ini menunjukkan bahwa kemampuan sistem dalam memproses Request secara simultan mulai mencapai batas kapasitasnya, terutama pada Endpoint /API/Dashboard/students yang memiliki nilai Throughput terendah.
    c. Analisis Error rate
Error rate merupakan persentase Request yang gagal diproses oleh peladen selama proses pengujian berlangsung. Parameter ini digunakan untuk mengukur tingkat keandalan sistem dalam memproses permintaan pengguna pada berbagai tingkat beban. Semakin kecil nilai Error rate, semakin tinggi tingkat keberhasilan sistem dalam melayani Request yang diterima.
Berdasarkan hasil pengujian yang telah dilakukan, seluruh Endpoint Dashboard Admin menunjukkan nilai Error rate yang konsisten pada seluruh skenario pengujian. Untuk memberikan gambaran mengenai perubahan nilai Error rate pada setiap Endpoint, hasil pengujian dirangkum pada Tabel 24.
Tabel 24 Ringkasan Hasil Pengujian Error rate
Endpoint	Error rate Terendah	Error rate Tertinggi	Pola Perubahan
/stats	0,00%	0,00%	Tetap pada seluruh skenario pengujian
/dosen	0,00%	0,00%	Tetap pada seluruh skenario pengujian
/students	0,00%	0,00%	Tetap pada seluruh skenario pengujian

Berdasarkan Tabel 24, tidak ditemukan kegagalan pemrosesan Request pada ketiga Endpoint selama seluruh skenario pengujian, mulai dari 1 hingga 500 pengguna virtual. Nilai Error rate tetap berada pada angka 0,00%, yang menunjukkan bahwa seluruh Request berhasil diproses oleh sistem tanpa menghasilkan kesalahan.
Berdasarkan hasil analisis tersebut dan mengacu pada kriteria operasional evaluasi performa pada Tabel 14, nilai Error rate sebesar 0,00% pada seluruh Endpoint termasuk dalam kategori Baik. Hasil tersebut menunjukkan bahwa Dashboard Admin Sistem CPL mampu mempertahankan keberhasilan pemrosesan Request meskipun jumlah pengguna virtual terus meningkat selama pengujian.
Berdasarkan hasil analisis dan evaluasi tersebut, seluruh Endpoint mampu mempertahankan nilai Error rate sebesar 0,00% pada seluruh skenario pengujian. Hasil ini menunjukkan bahwa sistem tetap memiliki tingkat keandalan yang baik dalam memproses seluruh Request tanpa mengalami kegagalan layanan meskipun beban pengguna terus meningkat.
    d. Analisis Kestabilan Sistem
Analisis kestabilan sistem dilakukan untuk mengetahui kemampuan Dashboard Admin Sistem CPL dalam mempertahankan performa ketika jumlah pengguna virtual meningkat. Berbeda dengan parameter Response time, Throughput, dan Error rate yang dianalisis secara terpisah pada subbab sebelumnya, analisis kestabilan sistem dilakukan dengan mengintegrasikan ketiga parameter tersebut sehingga dapat memberikan gambaran mengenai kondisi sistem secara keseluruhan pada setiap skenario pengujian. Ringkasan hasil analisis kestabilan sistem disajikan pada Tabel 25.
Tabel 25 Ringkasan Analisis Kestabilan Sistem
Skenario (User)	Kondisi Sistem	Kategori
1	Seluruh Request berhasil diproses, Response time rendah, Throughput meningkat, Error rate 0,0%.	Baik
10	Seluruh Request berhasil diproses, Response time rendah, Throughput meningkat, Error rate 0,0%.	Baik
20	Seluruh Request berhasil diproses, Response time rendah, Throughput meningkat, Error rate 0,0%.	Baik
50	Seluruh Request berhasil diproses, Response time mulai meningkat dan Throughput mulai melambat, namun tidak terjadi error.	Cukup
100	Seluruh Request berhasil diproses, Response time masih dalam kategori baik (<3 detik), tetAPI Throughput mulai stagnan pada beban tinggi dan tidak terjadi error.	Cukup
200	Seluruh Request berhasil diproses, Response time berada pada kategori kurang (>5 detik), Throughput cenderung stagnan, dan tidak terjadi error.	Kurang
500	Seluruh Request berhasil diproses, Response time sangat tinggi (>10 detik), Throughput tetap stagnan, namun Error rate tetap 0,0%.	Buruk/Tidak Stabil

Berdasarkan Tabel 25, sistem menunjukkan tingkat kestabilan yang baik pada skenario 1 hingga 20 pengguna virtual. Pada rentang tersebut seluruh Request berhasil diproses tanpa kegagalan (Error rate 0,00%), Response time masih rendah, serta Throughput terus meningkat seiring bertambahnya jumlah pengguna. Memasuki skenario 50 dan 100 pengguna virtual, kondisi sistem mulai mengalami penurunan yang ditandai dengan peningkatan Response time dan melambatnya laju peningkatan Throughput, meskipun seluruh Request masih berhasil diproses tanpa terjadi error. Pada skenario 200 dan 500 pengguna virtual, Response time meningkat secara signifikan, Throughput cenderung stagnan, sedangkan Error rate tetap berada pada nilai 0,00%.
Berdasarkan hasil analisis tersebut dan mengacu pada kriteria operasional evaluasi performa pada Tabel 14, sistem berada pada kategori Baik pada skenario 1 hingga 20 pengguna virtual. Selanjutnya, kondisi sistem berada pada kategori Cukup pada skenario 50 dan 100 pengguna karena terjadi peningkatan Response time serta perlambatan peningkatan Throughput, meskipun seluruh Request masih berhasil diproses. Pada skenario 200 dan 500 pengguna virtual, kondisi sistem termasuk kategori Kurang hingga Buruk karena Response time telah melebihi batas yang ditetapkan dan Throughput tidak lagi meningkat secara proporsional terhadap penambahan jumlah pengguna.
Berdasarkan hasil analisis dan evaluasi tersebut, Dashboard Admin Sistem CPL masih mampu mempertahankan keberhasilan pemrosesan Request pada seluruh skenario pengujian. Namun, kualitas performa sistem mulai menurun ketika jumlah pengguna virtual meningkat, yang ditunjukkan oleh peningkatan Response time dan kecenderungan stagnasi Throughput. Kondisi ini menunjukkan bahwa penurunan performa sistem lebih dipengaruhi oleh menurunnya kualitas layanan dibandingkan oleh kegagalan pemrosesan Request.
        2. Identifikasi Dugaan Bottleneck
Identifikasi dugaan Bottleneck dilakukan berdasarkan hasil analisis parameter performa yang telah dibahas pada subbab sebelumnya. Identifikasi ini dilakukan dengan mengorelasikan hasil pengujian Response time, Throughput, Error rate, serta penggunaan CPU dan memori Server yang diperoleh selama proses pengujian. Melalui pendekatan tersebut, dapat diidentifikasi bagian sistem yang menunjukkan indikasi sebagai penyebab utama penurunan performa Dashboard Admin Sistem CPL ketika menerima beban pengguna virtual yang semakin tinggi.
Berdasarkan hasil analisis, pada skenario 200 hingga 500 pengguna virtual Endpoint /API/Dashboard/students menunjukkan penurunan performa yang paling signifikan dibandingkan Endpoint lainnya. Kondisi tersebut ditunjukkan oleh Response time yang paling tinggi, Throughput yang paling rendah, sementara Error rate tetap berada pada nilai 0,00%. Pola ini mengindikasikan bahwa sistem masih mampu memproses seluruh Request, namun memerlukan waktu pemrosesan yang jauh lebih lama ketika beban meningkat.
Hasil pemantauan sumber daya Server menggunakan Glances menunjukkan bahwa penggunaan CPU global berada pada kisaran 61,3% hingga 65,3%, sedangkan utilisasi proses Node.js mencapai lebih dari 101%. Dengan mempertimbangkan spesifikasi Server yang menggunakan prosesor Intel Core 2 Duo berarsitektur dual-core, kondisi tersebut mengindikasikan bahwa sebagian besar beban komputasi aplikasi terpusat pada proses Backend sehingga pemanfaatan sumber daya prosesor belum berlangsung secara merata. Di sisi lain, penggunaan memori relatif stabil pada kisaran 1,84 GB atau sekitar 66% selama seluruh skenario pengujian. Kondisi ini menunjukkan bahwa penurunan performa lebih berkaitan dengan meningkatnya aktivitas komputasi dibandingkan dengan keterbatasan kapasitas memori Server.
Berdasarkan korelasi antara hasil pengujian performa dan penggunaan sumber daya Server, disusun identifikasi dugaan Bottleneck sebagaimana disajikan pada Tabel 26
Tabel 26 Dugaan Bottleneck Berdasarkan Hasil Pengujian
Endpoint	Indikasi Hasil Analisis	Dugaan Bottleneck
/API/Dashboard/stats	Response time meningkat pada beban tinggi, sedangkan Throughput tidak lagi meningkat secara proporsional	Diduga berkaitan dengan meningkatnya beban komputasi saat Backend melakukan proses agregasi data statistik secara keseluruhan.
/API/Dashboard/dosen	Response time meningkat seiring bertambahnya jumlah pengguna dan laju peningkatan Throughput mulai melambat.	Diduga berkaitan dengan proses agregasi data relasional antara dosen, kelas, dan progres penilaian.
/API/Dashboard/students	Memiliki Response time tertinggi (15.894,4 ms), Throughput terendah, serta utilisasi proses Node.js mencapai lebih dari 101%.	Diduga berkaitan dengan kompleksitas proses agregasi data evaluasi mahasiswa yang menyebabkan beban komputasi tinggi pada proses Backend sehingga mengindikasikan terjadinya CPU-bound Bottleneck.

Berdasarkan Tabel 26, Endpoint /API/Dashboard/students menunjukkan indikasi Bottleneck yang paling dominan dibandingkan Endpoint lainnya. Dugaan tersebut didasarkan pada kombinasi beberapa indikator, yaitu Response time yang paling tinggi, Throughput yang paling rendah, serta tingginya utilisasi CPU pada proses Node.js ketika sistem menerima beban pengguna yang besar. Sementara itu, penggunaan memori yang relatif stabil menunjukkan bahwa penurunan performa tidak mengarah pada indikasi keterbatasan kapasitas memori, melainkan lebih berkaitan dengan meningkatnya beban komputasi pada proses Backend. Oleh karena itu, dugaan Bottleneck yang telah diidentifikasi pada penelitian ini menjadi dasar dalam penyusunan rekomendasi perbaikan arsitektur perangkat lunak yang dibahas pada subbab berikutnya.
        3. Rekomendasi Perbaikan
Berdasarkan hasil analisis parameter performa yang meliputi Response time, Throughput, Error rate, serta penggunaan CPU dan memori Server, telah diidentifikasi beberapa dugaan Bottleneck yang berpotensi menyebabkan penurunan performa pada API Endpoint Dashboard Admin Sistem CPL ketika jumlah pengguna virtual meningkat. Temuan tersebut menunjukkan bahwa penurunan performa sistem tidak hanya dipengaruhi oleh peningkatan jumlah Request, tetAPI juga berkaitan dengan karakteristik pemrosesan data pada sisi Backend.
Berdasarkan dugaan Bottleneck tersebut, disusun beberapa rekomendasi perbaikan yang difokuskan pada optimalisasi arsitektur perangkat lunak dan peningkatan efisiensi pemanfaatan sumber daya sistem. Rekomendasi yang diberikan tidak diimplementasikan maupun diuji pada penelitian ini, melainkan disusun sebagai arah pengembangan (technical roadmap) berdasarkan hasil pengujian performa yang didukung oleh kajian literatur yang relevan. Ringkasan rekomendasi perbaikan disajikan pada Tabel 27.
Tabel 27 Rekomendasi Perbaikan Berdasarkan Dugaan Bottleneck
Temuan Empiris	Analisis	Rekomendasi Perbaikan
Penggunaan CPU proses Node.js mencapai sekitar 101%, disertai Response time Endpoint /API/Dashboard/students sebesar 15.894,4 ms.	Hasil analisis mengindikasikan bahwa proses agregasi data pada Endpoint /API/Dashboard/students memerlukan aktivitas komputasi yang tinggi sehingga waktu pemrosesan meningkat secara signifikan ketika beban pengguna bertambah.	Melakukan optimasi Query pada Prisma ORM melalui evaluasi struktur Query, penggunaan atribut yang lebih selektif (select projection), pengurangan Over-fetching, serta peninjauan strategi akses basis data pada proses yang memiliki beban komputasi tinggi.
Penggunaan CPU proses Node.js mencapai sekitar 101%, sedangkan penggunaan CPU global berada pada kisaran 61–65%.	Hasil analisis mengindikasikan bahwa aktivitas komputasi Backend lebih banyak terpusat pada proses Node.js sehingga pemanfaatan lingkungan multi-core belum berlangsung secara optimal.	Mengimplementasikan Cluster Mode menggunakan PM2 agar aplikasi Backend dapat dijalankan dalam beberapa worker process sesuai jumlah inti prosesor, sehingga distribusi beban pemrosesan menjadi lebih merata.
Nilai Throughput cenderung stagnan pada kisaran 3,77–4,50 Request/detik pada skenario beban tinggi meskipun sistem telah menggunakan mekanisme in-app Caching.	Hasil analisis menunjukkan bahwa mekanisme in-app Caching masih bergantung pada proses Backend sehingga beban pemrosesan aplikasi tetap meningkat seiring bertambahnya jumlah Request.	Memigrasikan mekanisme in-app Caching ke layanan external in-memory datastore, seperti Redis atau Microsoft Garnet, sehingga pengelolaan Cache terpisah dari proses aplikasi dan efisiensi akses data dapat ditingkatkan[69].

Berdasarkan Tabel 27, rekomendasi perbaikan difokuskan pada tiga aspek utama, yaitu optimalisasi lAPIsan akses data, peningkatan pemanfaatan sumber daya prosesor melalui pendekatan multi-processing, serta pengembangan mekanisme Caching menggunakan layanan external in-memory datastore. Ketiga rekomendasi tersebut dipilih karena secara langsung berkaitan dengan dugaan Bottleneck yang diidentifikasi pada penelitian ini dan didukung oleh hasil penelitian terdahulu. Dengan demikian, rekomendasi yang diusulkan diharapkan dapat menjadi acuan dalam pengembangan Dashboard Admin Sistem CPL untuk meningkatkan responsivitas, kapasitas pemrosesan, dan skalabilitas sistem pada kondisi beban yang lebih tinggi.
Selanjutnya, penjelasan mengenai masing-masing rekomendasi perbaikan diuraikan sebagai berikut.
            a. Optimalisasi LAPIsan Akses Data Melalui Query Refactoring
Hasil pengujian menunjukkan bahwa Endpoint /API/Dashboard/students memiliki Response time tertinggi, yaitu mencapai 15.894,4 ms, serta penggunaan CPU proses Node.js hingga sekitar 101% pada skenario beban tertinggi. Temuan tersebut mengindikasikan bahwa proses pengambilan dan pengolahan data pada Endpoint tersebut memerlukan aktivitas komputasi yang lebih tinggi dibandingkan Endpoint lainnya sehingga waktu pemrosesan meningkat secara signifikan ketika jumlah pengguna virtual bertambah.
Salah satu pendekatan yang dapat dipertimbangkan untuk mengurangi beban komputasi tersebut adalah melakukan optimalisasi pada lAPIsan akses data (data access layer). Optimalisasi dapat dilakukan melalui evaluasi struktur Query, penggunaan atribut yang lebih selektif (select projection), pengurangan Over-fetching, serta peninjauan kembali strategi akses basis data yang diterapkan pada Prisma ORM. Pendekatan tersebut bertujuan mengurangi jumlah data yang diproses maupun ditransfer sehingga efisiensi pemrosesan pada sisi Backend dapat ditingkatkan.
Pendekatan ini sejalan dengan penelitian Yusmita et al.[70] yang menunjukkan bahwa strategi akses basis data berpengaruh terhadap performa aplikasi. Penelitian tersebut membandingkan implementasi Raw SQL dan Prisma ORM, serta menunjukkan bahwa pemilihan strategi akses data yang sesuai dengan karakteristik Query dapat meningkatkan efisiensi eksekusi dan memperbaiki performa aplikasi. Oleh karena itu, evaluasi dan Query refactoring pada Endpoint yang memiliki beban komputasi tinggi dapat dipertimbangkan sebagai salah satu langkah untuk meningkatkan performa Dashboard Admin Sistem CPL.

            b. Optimalisasi Pemanfaatan Multi-core Melalui Cluster Mode Menggunakan PM2
Hasil analisis menunjukkan bahwa penggunaan CPU proses Node.js mencapai sekitar 101%, sedangkan penggunaan CPU global berada pada kisaran 61–65% selama skenario beban tinggi. Kondisi tersebut mengindikasikan bahwa aktivitas komputasi Backend lebih banyak terpusat pada proses aplikasi sehingga pemanfaatan sumber daya prosesor pada lingkungan multi-core belum berlangsung secara optimal.
Sebagai salah satu alternatif pengembangan, aplikasi Backend dapat dijalankan menggunakan Cluster Mode dengan bantuan PM2, sehingga aplikasi dieksekusi dalam beberapa worker process sesuai dengan jumlah inti prosesor yang tersedia. Pendekatan ini memungkinkan permintaan pengguna didistribusikan ke beberapa proses secara paralel sehingga kapasitas pemrosesan aplikasi dapat ditingkatkan tanpa mengubah logika bisnis yang telah diterapkan.
Pendekatan tersebut didukung oleh penelitian Rozak et al [71] yang menunjukkan bahwa implementasi teknik Clustering pada aplikasi Node.js mampu meningkatkan pemanfaatan sumber daya prosesor sekaligus meningkatkan kemampuan aplikasi dalam menangani permintaan secara bersamaan pada lingkungan multi-core. Oleh karena itu, penerapan Cluster Mode menggunakan PM2 dapat dipertimbangkan sebagai salah satu strategi pengembangan untuk meningkatkan performa Dashboard Admin Sistem CPL pada kondisi beban akses yang lebih tinggi.

            c. Migrasi Arsitektur Caching ke Layanan In-Memory Datastore Eksternal
Hasil pengujian menunjukkan bahwa nilai Throughput cenderung stagnan pada kisaran 3,77–4,50 Request/detik ketika sistem menerima beban pengguna yang tinggi. Kondisi tersebut mengindikasikan bahwa kapasitas pemrosesan Backend mulai mencapai batas sehingga peningkatan jumlah Request tidak lagi diikuti oleh peningkatan kemampuan sistem dalam memproses permintaan secara proporsional.
Sebagai salah satu strategi pengembangan, mekanisme in-app Caching dapat dipindahkan ke layanan external in-memory datastore sehingga proses penyimpanan dan pengambilan data yang sering diakses tidak lagi sepenuhnya bergantung pada proses Backend. Pendekatan ini diharapkan dapat mengurangi beban komputasi aplikasi sekaligus meningkatkan efisiensi akses data pada kondisi beban yang lebih tinggi.
Pendekatan tersebut didukung oleh penelitian Prilyansyah [72], yang menunjukkan bahwa penerapan Redis sebagai external Caching layer mampu meningkatkan performa API melalui penurunan Response time dan peningkatan Throughput dibandingkan mekanisme tanpa Caching. Selain Redis, Microsoft Garnet juga dapat dipertimbangkan sebagai alternatif karena kompatibel dengan protokol RESP (Redis Serialization Protocol). Berdasarkan hasil RESP Bench yang dipublikasikan oleh Microsoft Research [73], Garnet menunjukkan performa Throughput yang lebih tinggi dan latency yang lebih rendah pada beberapa skenario pengujian dibandingkan implementasi in-memory datastore lain yang diuji. Oleh karena itu, penggunaan external in-memory datastore dapat dipertimbangkan sebagai salah satu arah pengembangan untuk meningkatkan skalabilitas dan performa Dashboard Admin Sistem CPL pada beban akses yang lebih besar.











    BAB V KESIMPULAN

    A. Kesimpulan 
Berdasarkan hasil pengujian, analisis, dan pembahasan terhadap performa Endpoint Dashboard Admin Sistem Capaian Pembelajaran Lulusan (CPL) berbasis OBE menggunakan Apache JMeter, dapat ditarik beberapa kesimpulan sebagai berikut:
    1. Hasil analisis terhadap parameter Response time, Throughput, Error rate, serta data pendukung berupa penggunaan CPU dan memori Server menunjukkan bahwa performa Endpoint Dashboard Admin mengalami perubahan seiring meningkatnya jumlah pengguna virtual. Seluruh Endpoint mampu mempertahankan nilai Error rate sebesar 0,00% hingga skenario 500 pengguna virtual, yang menunjukkan bahwa seluruh Request berhasil diproses tanpa kegagalan layanan. Namun demikian, peningkatan jumlah pengguna menyebabkan Response time meningkat secara bertahap dan Throughput mulai menunjukkan kecenderungan stagnan pada skenario beban tinggi. Hasil pemantauan sumber daya Server juga menunjukkan bahwa penggunaan CPU meningkat seiring bertambahnya beban pengguna, sedangkan penggunaan memori relatif stabil selama proses pengujian.
    2. Hasil penelitian menunjukkan bahwa penurunan performa mulai terlihat secara nyata pada skenario 50 pengguna virtual, yang ditandai dengan lonjakan Response time dari sekitar 69 ms pada skenario 20 pengguna menjadi sekitar 613 ms pada skenario 50 pengguna, disertai perlambatan laju peningkatan Throughput. Meskipun pada skenario tersebut Response time masih berada dalam kategori Baik, pola tersebut menunjukkan bahwa kapasitas sistem mulai terpengaruh oleh peningkatan beban pengguna. Penurunan performa kemudian semakin meningkat pada skenario 200 hingga 500 pengguna virtual, ketika Response time telah memasuki kategori Kurang hingga Buruk, sementara Error rate tetap sebesar 0,00%.
    3. Hasil identifikasi dugaan Bottleneck menunjukkan bahwa Endpoint /API/Dashboard/students merupakan Endpoint yang mengalami penurunan performa paling besar dibandingkan Endpoint lainnya. Kondisi tersebut ditunjukkan oleh nilai Response time tertinggi sebesar 15.894,4 ms, Throughput terendah sebesar 3,77 Request/detik, serta utilisasi proses Node.js yang mencapai sekitar 101% pada skenario beban tertinggi. Berdasarkan hasil tersebut, penelitian ini mengidentifikasi dugaan CPU-bound Bottleneck yang berkaitan dengan tingginya aktivitas komputasi pada proses Backend. Berdasarkan dugaan Bottleneck tersebut, penelitian ini menghasilkan tiga rekomendasi pengembangan, yaitu optimalisasi lAPIsan akses data melalui Query refactoring, optimalisasi pemanfaatan multi-core menggunakan Cluster Mode dengan PM2, serta migrasi mekanisme in-app Caching ke layanan external in-memory datastore untuk meningkatkan responsivitas, kapasitas pemrosesan, dan skalabilitas sistem.
    B. Saran/Rekomendasi 
Berdasarkan hasil penelitian yang telah dilakukan, masih terdapat beberapa aspek yang dapat dikembangkan pada penelitian selanjutnya. Saran yang diberikan disusun berdasarkan hasil analisis performa serta identifikasi dugaan Bottleneck pada Dashboard Admin Sistem Capaian Pembelajaran Lulusan (CPL), sehingga diharapkan dapat menjadi acuan dalam pengembangan maupun penelitian lanjutan. Adapun saran yang dapat diberikan adalah sebagai berikut:
    1. Penelitian selanjutnya dapat mengimplementasikan rekomendasi perbaikan yang dihasilkan pada penelitian ini, kemudian melakukan pengujian ulang untuk mengevaluasi peningkatan performa sistem setelah proses optimasi diterapkan.
    2. Penelitian selanjutnya dapat melakukan analisis performa yang lebih mendalam melalui code profiling, Query tracing, serta pemantauan penggunaan sumber daya Server, seperti CPU, memori, dan aktivitas basis data, sehingga penyebab penurunan performa dapat diidentifikasi secara lebih spesifik.
    3. Pengujian performa dapat dikembangkan dengan menggunakan jumlah pengguna virtual yang lebih besar maupun pada lingkungan implementasi yang berbeda, sehingga kemampuan sistem dalam menangani beban pengguna dapat dievaluasi secara lebih komprehensif.
    4. Penelitian selanjutnya dapat memperluas cakupan pengujian dengan melibatkan Endpoint atau fitur lain pada Sistem Capaian Pembelajaran Lulusan (CPL), sehingga evaluasi performa sistem dapat dilakukan secara lebih menyeluruh.

DAFTAR PUSTAKA

[1]	W. Kayanja, M. Kyambade, Dan T. Kiggundu, “Exploring Digital Transformation In Higher Education Setting: The Shift To Fully Automated And Paperless Systems,” Cogent Education, Vol. 12, No. 1, Des 2025, Doi: 10.1080/2331186x.2025.2489800.
[2]	B. Kushari Dan L. Septiadi, “A Learning Outcome Assessment Information System To Facilitate Outcome-Based Education (Obe) Implementation,” Jurnal Pendidikan Teknologi Dan Kejuruan, Vol. 28, No. 2, Okt 2022, Doi: 10.21831/Jptk.V28i2.42339.
[3]	M. M. Syeed, A. Shihavuddin, M. F. Uddin, M. Hasan, Dan R. H. Khan, “Outcome Based Education (Obe): Defining The Process And Practice For Engineering Education,” Ieee Access, Vol. 10, Hlm. 119170–119192, 2022, Doi: 10.1109/Access.2022.3219477.
[4]	A. Naim, M. M. Alnfiai, Dan N. S. Almalki, “Information Systems Based Model For The Assessment Of Program Learning Outcomes In Measuring The Quality In Higher Education,” Humanit. Soc. Sci. Commun., Vol. 12, No. 1, Hlm. 1975, Nov 2025, Doi: 10.1057/S41599-025-06259-9.
[5]	A. Safiudin, . S., M. E. Sulistyo, S. Pramono, Dan A. Ramelan, “The Development Of Web-Based Outcome Based Education Information System,” Journal Of Electrical, Electronic, Information, And Communication Technology, Vol. 2, No. 2, Hlm. 61, Okt 2020, Doi: 10.20961/Jeeict.2.2.45291.
[6]	O. M. Yigitbasioglu Dan O. Velcu, “A Review Of Dashboards In Performance Management: Implications For Design And Research,” International Journal Of Accounting Information Systems, Vol. 13, No. 1, Hlm. 41–59, Mar 2012, Doi: 10.1016/J.Accinf.2011.08.002.
[7]	Z. Huang Dan E. Wu, “Lightweight Materialization For Fast Dashboards Over Joins,” Proceedings Of The Acm On Management Of Data, Vol. 1, No. 4, Hlm. 1–27, Des 2023, Doi: 10.1145/3626735.
[8]	H. Alnuhait, W. Alzyadat, A. Althunibat, H. Kahtan, B. Zaqaibeh, Dan H. A. Al-Khawaja, “Web Application Performance Assessment: A Study Of Responsiveness, Throughput, And Scalability,” International Journal Of Advanced And Applied Sciences, Vol. 11, No. 9, Hlm. 214–226, Sep 2024, Doi: 10.21833/Ijaas.2024.09.023.
[9]	J. Van Riet, I. Malavolta, Dan T. A. Ghaleb, “Optimize Along The Way: An Industrial Case Study On Web Performance,” Journal Of Systems And Software, Vol. 198, Hlm. 111593, Apr 2023, Doi: 10.1016/J.Jss.2022.111593.
[10]	M. Bolanowski, M. Ćmil, Dan A. Starzec, “New Model For Defining And Implementing Performance Tests,” Future Internet, Vol. 16, No. 10, Hlm. 366, Okt 2024, Doi: 10.3390/Fi16100366.
[11]	M. Hendayun, A. Ginanjar, Dan Y. Ihsan, “Analysis Of Application Performance testing Using Load testing And Stress testing Methods In API Service,” Jurnal Sisfotek Global, Vol. 13, No. 1, Hlm. 28, Mar 2023, Doi: 10.38101/Sisfotek.V13i1.2656.
[12]	S. S. Raweyai Dan I. R. Widiasari, “Performance testing Of Academic Website Using Load testing Method Supported By Apache JMetertm At Xyz University,” Jurnal Teknik Informatika (Jutif), 2024, [Daring]. Tersedia Pada: Http://Jutif.If.Unsoed.Ac.Id/Index.Php/Jurnal/Article/View/1796
[13]	S. Di Meglio, L. L. L. Starace, V. Pontillo, R. Opdebeeck, C. De Roover, Dan S. Di Martino, “Performance testing In Open-Source Web Projects: Adoption, Maintenance, And A Change Taxonomy,” Dalam 2025 Ieee International Conference On Software Maintenance And Evolution (Icsme), Ieee, Sep 2025, Hlm. 199–210. Doi: 10.1109/Icsme64153.2025.00027.
[14]	E. H. K. A. N. Othman, N. A. Mat Saat, N. H. Muhamad, Dan M. Abdul Majid, “The Development An Outcome-Based Education (Obe) System For Measuring Student Programme Attainment,” Journal Of Computing Research And Innovation, Vol. 9, No. 2, Hlm. 177–187, Sep 2024, Doi: 10.24191/Jcrinn.V9i2.472.
[15]	N. Hakim, L. Hakim, N. D. Made Santi Diwyarthi, A. R. Purnamasari, Dan N. K. Ningsih, “Bibliometric Analysis Of Outcome-Based Education (Obe) In Higher Education: Trends, Themes, And Future Directions,” The Eastasouth Journal Of Learning And Educations, Vol. 3, No. 03, Hlm. 171–185, Nov 2025, Doi: 10.58812/Esle.V3i03.800.
[16]	A. M. M. Lamis Dan J. S. Pisuena, “Sistem Penilaian Dan Evaluasi Capaian Program Berbasis Web Dengan Analitik Data,” World Journal Of Advanced Research And Reviews, Vol. 29, No. 3, Hlm. 481–492, Mar 2026, Doi: 10.30574/Wjarr.2026.29.3.0572.
[17]	S. E. R. Siang, A. R. L. Reyes, Dan C. E. Dumdumaya, “Reinforcing Learning Management System With Obe-Based Learning analytics And Riasec Integration,” Tem Journal, Vol. 13, No. 4, Hlm. 3346–3358, Nov 2024, Doi: 10.18421/Tem134-69.
[18]	N. A. Asmaranto, T. F. Kusumasari, Dan E. N. Alam, “A Dashboard System For Enhancing Learning Outcome Monitoring And Curriculum Management Under The Outcome-Based Education Framework,” Dalam 2025 International Seminar On Intelligent Technology And Its Applications (Isitia), Ieee, Jul 2025, Hlm. 661–666. Doi: 10.1109/Isitia66279.2025.11137419.
[19]	N. Utami Handayani Dan N. Abyor Handayani, “Sistem Monitoring Dan Evaluasi Proses Belajar Mengajar Berbasis Outcome Based Education Di Fakultas Teknik Universitas Diponegoro,” Jpii, Vol. 2, No. 3, Hlm. 194–200, 2024, Doi: 10.14710/Jpii.2024.24263.
[20]	A. Annisa, M. Ardiana, P. N. Rahayu, T. Brian, Dan M. A. Jami’in, “Performance Evaluation Of Web Applications Using Jmeter Load testing For Server Capacity And Response Efficiency,” Journal Of Applied Informatics And Computing, Vol. 10, No. 1, Hlm. 585–590, Feb 2026, Doi: 10.30871/Jaic.V10i1.11840.
[21]	M. Garjitno, H. Angriani, Dan Y. Saharaeni, “Analisis Dan Optimasi Kinerja Aplikasi Potio Menggunakan Load testing Jmeter,” Jtriste, Vol. 12, No. 2, Hlm. 56–68, Okt 2025, Doi: 10.55645/Jtriste.V12i2.625.
[22]	L. Paulsen Dan E. Lindsay, “Learning analytics Dashboards Are Increasingly Becoming About Learning And Not Just Analytics - A Systematic Review,” Educ. Inf. Technol. (Dordr)., Vol. 29, No. 11, Hlm. 14279–14308, Agu 2024, Doi: 10.1007/S10639-023-12401-4.
[23]	M. Hernández-Campos, A. Gonzalez-Torres, Dan F. J. García-Peñalvo, “Learning Outcomes Evaluation Through Learning analytics Systems In Higher Education: A Systematic Literature Review,” Sage Open, Vol. 15, No. 3, Jan 2025, Doi: 10.1177/21582440251347374.
[24]	N. J. Rao, “Outcome-Based Education: An Outline,” Higher Education For The Future, Vol. 7, No. 1, Hlm. 5–21, Jan 2020, Doi: 10.1177/2347631119886418.
[25]	R. Mufanti, D. Carter, Dan N. England, “Outcomes-Based Education In Indonesian Higher Education: Reporting On The Understanding, Challenges, And Support Available To Teachers,” Social Sciences & Humanities Open, Vol. 9, Hlm. 100873, 2024, Doi: 10.1016/J.Ssaho.2024.100873.
[26]	S. Suharsono, O. S. Simanjuntak, R. I. Perwira, S. Pambudi, M. Fachrurradjie, Dan Y. P. Aqillasari, “Development Of A Semester Learning Plans System Based On Obe (Outcome-Based Education),” 2024, Hlm. 485–501. Doi: 10.2991/978-2-38476-247-7_51.
[27]	S. Aminah, A. Alfa Krisnadhi, Dan A. Nizar Hidayanto, “Ontological Framework For The Analysis Of Outcome-Based Curriculum In Higher Education,” Ieee Access, Vol. 13, Hlm. 31497–31516, 2025, Doi: 10.1109/Access.2025.3542881.
[28]	D. Tanu Wijaya, I. Sumadikarta, Dan B. Panjaitan, “Analisa Dan Perancangan Aplikasi Evaluasi Capaian Pembelajaran Lulusan,” Prosiding, Vol. 4, Hlm. 137–147, Nov 2023, Doi: 10.59134/Prosidng.V4i.558.
[29]	O. Pritasari, B. Y. Wilujeng, Dan N. R. Windayani, “Penerapan Kurikulum Outcome Based Education (Obe) Dalam Kurikulum Merdeka Belajar Kurikulum Merdeka Di Prodi S1 Pendidikan Tata Rias,” Journal Of Vocational And Technical Education (Jvte), Vol. 5, No. 1, Hlm. 41–48, Mar 2023, Doi: 10.26740/Jvte.V5n1.P41-48.
[30]	I. Simangunsong, “Rancang Bangun Frontend Sistem Informasi Capaian Pembelajaran Lulusan (Cpl) Berbasis Web Menggunakan Metode Agile Kanban,” Jurnal Informatika Dan Teknik Elektro Terapan, Vol. 14, No. 2, Apr 2026, Doi: 10.23960/Jitet.V14i2.9221.
[31]	M. Pertiwi, N. Efranda, B. Erwin Slam, N. Ritha, Dan M. Bettiza, “Ui/Ux Design Of Web-Based For Outcome-Based Education (Obe) Assessment Information System In Universitas Maritim Raja Ali Haji (Umrah) Using Prototype Method,” Bio Web Conf., Vol. 134, Hlm. 01006, Okt 2024, Doi: 10.1051/Bioconf/202413401006.
[32]	M. Naufal Gibran, “Sistem Informasi Penilaian Berbasis Outcome Based Learning Guna Monitoring Pemenuhan Capaian Pembelajaran,” Jurnal Nasional Komputasi Dan Teknologi Informasi (Jnkti), Vol. 8, No. 6, 2025.
[33]	T. Rak, J. Drabek, Dan M. Charytanowicz, “Performance-Based Classification Of Users In A Containerized Stock Trading Application Environment Under Load,” Electronics (Basel)., Vol. 14, No. 14, Hlm. 2848, Jul 2025, Doi: 10.3390/Electronics14142848.
[34]	A. Sarikaya, M. Correll, L. Bartram, M. Tory, Dan D. Fisher, “What Do We Talk About When We Talk About Dashboards?,” Ieee Trans. Vis. Comput. Graph., Vol. 25, No. 1, Hlm. 682–692, Jan 2019, Doi: 10.1109/Tvcg.2018.2864903.
[35]	R. M. Harden, J. R. Crosby, Dan M. H. Davis, “Amee Guide No. 14: Outcome-Based Education: Part 1 - An Introduction To Outcome-Based Education,” Med. Teach., Vol. 21, No. 1, Hlm. 7–14, Jan 1999, Doi: 10.1080/01421599979969.
[36]	A. S. Azzahidi, B. Wijayanto, Dan A. Darmawan, “Performance Evaluation Of Backend Frameworks For Rest API: A Comparative Study Of Spring Boot, Flask, Express.js, Laravel Frankenphp, And Gin,” Jurnal Teknik Informatika (Jutif), Vol. 6, No. 4, Hlm. 2405–2419, Agu 2025, Doi: 10.52436/1.Jutif.2025.6.4.4811.
[37]	A. Lamer, C. Saint-Dizier, N. Paris, Dan E. Chazard, “Data Lake, Data Warehouse, Datamart, And Feature Store: Their Contributions To The Complete Data Reuse Pipeline,” Jmir Med. Inform., Vol. 12, Hlm. E54590–E54590, Jul 2024, Doi: 10.2196/54590.
[38]	A. Barbaro Dkk., “Data Acquisition, Processing, And Aggregation In A Low-Cost Iot System For Indoor Environmental Quality Monitoring,” Applied Sciences, Vol. 14, No. 10, Hlm. 4021, Mei 2024, Doi: 10.3390/App14104021.
[39]	F. Zammetti, Modern Full-Stack Development. Berkeley, Ca: Apress, 2020. Doi: 10.1007/978-1-4842-5738-8.
[40]	E. Nurhayati Dan A. Agussalim, “Rancang Bangun Back-End API Pada Aplikasi Mobile Ayamhub Menggunakan Framework Node Js Express,” Jurnal Sistem Dan Teknologi Informasi (Justin), Vol. 11, No. 3, Hlm. 524, Jul 2023, Doi: 10.26418/Justin.V11i3.66823.
[41]	A. D. Ramadhan Dan Y. Prayudi, “Implementasi Object-Relational Mapping (Orm) Prisma Dalam Perancangan Restful API Untuk Web Sda Division Di Pt Telkom Indonesia Tbk,” Technologia : Jurnal Ilmiah, Vol. 16, No. 2, Hlm. 256, Apr 2025, Doi: 10.31602/Tji.V16i2.17880.
[42]	K. Krocz, O. Kizun, Dan M. Skublewska-Paszkowska, “Perfomance Analysis Of Relational Databases Mysql, Postgresql, MariaDB And H2,” Journal Of Computer Sciences Institute, Vol. 14, Hlm. 1–7, Mar 2020, Doi: 10.35784/Jcsi.1565.
[43]	S. Di Meglio, L. L. L. Starace, Dan S. Di Martino, “Web App Performance testing In Industrial Contexts: Supporting Workload Generation With E2e-Loader++,” Journal Of Systems And Software, Vol. 232, Hlm. 112684, Feb 2026, Doi: 10.1016/J.Jss.2025.112684.
[44]	A. Ali, H. A. Maghawry, Dan N. Badr, “Performance testing As A Service Using Cloud Computing Environment: A Survey,” Journal Of Software: Evolution And Process, Vol. 34, No. 12, Des 2022, Doi: 10.1002/Smr.2492.
[45]	Ekky Novriza Alam Dan Fitriyana Dewi, “Performance testing Analysis Of Bandungtanginas Application With Jmeter,” International Journal Of Innovation In Enterprise System, Vol. 6, No. 2, Hlm. 157–166, Okt 2024, Doi: 10.25124/Ijies.V6i02.172.
[46]	S. Matam Dan J. Jain, Pro Apache JMeter. Berkeley, Ca: Apress, 2017. Doi: 10.1007/978-1-4842-2961-3.
[47]	Joko Yuwono, “Analisis Kinerja Sistem E-Learning Universitas Pamulang Menggunakan Load testing Berbasis Apache JMeter,” Jurnal Informatika Dan Tekonologi Komputer (Jitek), Vol. 6, No. 1, Hlm. 53–66, Mar 2026, Doi: 10.55606/Jitek.V6i1.8599.
[48]	A. R. Azizi, N. Andriana, Dan Kristanto, “Performance testing Aplikasi Sistem Informasi Penatausahaan Dan Perbendaharaan Online (Sippol),” Jurnal Informatika Polinema, Vol. 12, No. 1, Hlm. 121–126, Nov 2025, Doi: 10.33795/Jip.V12i1.7432.
[49]	I. Hamidah, I. Haromain, Dan I. M. Drehem, “Evaluasi Pengujian Kinerja Menggunakan Jmeter Untuk Menunjang Stabilitas Aplikasi Layanan Perbankan Pada Pt Bank Rakyat Indonesia Tbk,” Dbesti: Journal Of Digital Business And Technology Innovation, Vol. 2, No. 1, Hlm. 114–126, Jun 2025, Doi: 10.54914/Dbesti.V2i1.1621.
[50]	N. L. A. Sonia Ginasari, K. Suar Wibawa, Dan N. K. Ayu Wirdiani, “Pengujian Stress testing API Sistem Pelayanan Dengan Apache JMeter,” Jitter : Jurnal Ilmiah Teknologi Dan Komputer, Vol. 2, No. 3, Hlm. 552, Nov 2021, Doi: 10.24843/Jtrti.2021.V02.I03.P14.
[51]	M. A. Puspita, M. Mardiana, R. Ariesta, Dan M. A. Muhammad, “User Acceptance Testing Dan Performance testing Pada Pengembangan Website Kanal Pengetahuan Dikti,” Journal Of Information Engineering And Educational Technology, Vol. 8, No. 2, Hlm. 96–101, Mei 2025, Doi: 10.26740/Jieet.V8n2.P96-101.
[52]	I. Indrianto, “Performance testing On Web Information System Using Apache JMeter And Blazemeter,” Jurnal Ilmiah Ilmu Terapan Universitas Jambi, Vol. 7, No. 2, Hlm. 138–149, Des 2023, Doi: 10.22437/Jiituj.V7i2.28440.
[53]	F. P. E. Putra, A. Zulfikri, A. Rohman, Dan R. Alim, “Analysis Comparative Of Performance Optimization Techniques For Php Framework Testing: Laravel, Codeigniter, Symfony,” Brilliance: Research Of Artificial Intelligence, Vol. 5, No. 1, Hlm. 242–248, Jun 2025, Doi: 10.47709/Brilliance.V5i1.5989.
[54]	R. C. Fitonah, Y. Ardilla, M. Ridwan, Dan A. T. Wibowo, “Evaluasi Kinerja Website E-Procurement Pada Pt Xyz Di Surabaya Berbasis Iso 25010,” Journal Of Informatics Management And Information Technology, Vol. 5, No. 4, Hlm. 437–446, 2025, Doi: 10.47065/Jimat.V5i4.802.
[55]	Apache Software Foundation, “Apache JMeter User’s Manual: Glossary,” Apache JMeter Documentation. Diakses: 1 Mei 2026. [Daring]. Tersedia Pada: Https://Jmeter.Apache.Org/Usermanual/Glossary.Html
[56]	D. I. Permatasari, “Pengujian Aplikasi Menggunakan Metode Load testing Dengan Apache JMeter Pada Sistem Informasi Pertanian,” Jurnal Sistem Dan Teknologi Informasi (Justin), Vol. 8, No. 1, Hlm. 135, Jan 2020, Doi: 10.26418/Justin.V8i1.34452.
[57]	S. A. Sentosa, E. Subyantoro, Dan I. Asrowardi, “Pengukuran Kinerja Pada Aplikasi Video Pembelajaran Umkm Berbasis Web Dengan Metode Pengujian Beban,” Routers: Jurnal Sistem Dan Teknologi Informasi, Hlm. 95–102, Apr 2024, Doi: 10.25181/Rt.V2i2.3407.
[58]	R. Juniantika, N. S. Wibowo, V. Dewangga, Dan D. Rizky, “Optimalisasi Performa Website Lsp Smkn 2 Kraksaan Melalui Pengujian Beban Dengan Apache JMeter,” El Sains: Jurnal Elektro, Vol. 7, No. 1, Hlm. 9–14, Mei 2025, Doi: 10.30996/Elsains.V7i1.13183.
[59]	J. Tang Dkk., “A Comprehensive Review Of Theories, Methods, And Techniques For Bottleneck Identification And Management In Manufacturing Systems,” Applied Sciences, Vol. 14, No. 17, Hlm. 7712, Agu 2024, Doi: 10.3390/App14177712.
[60]	Albert Yakobus Chandra Dan Putry Wahyu Setyaningsih, “Benchmarking Local Development Environments: Analyzing The Performance Of Xampp, Mamp, And Laragon,” Bulletin Of Computer Science Research, Vol. 5, No. 3, Hlm. 193–206, Apr 2025, Doi: 10.47065/Bulletincsr.V5i3.493.
[61]	N. V. R. S. C. Gupta Lakkimsetty, “Database Optimization Strategies: Enhancing Performance And Scalability,” International Journal Of Computer Science And Mobile Computing, Vol. 12, No. 11, Hlm. 69–89, Nov 2023, Doi: 10.47760/Ijcsmc.2023.V12i11.006.
[62]	A. Anchlia, “Enhancing Query Performance Through Relational Database Indexing,” International Journal Of Computer Trends And Technology, Vol. 72, No. 8, Hlm. 130–133, Agu 2024, Doi: 10.14445/22312803/Ijctt-V72i8p119.
[63]	R. N. Muzaki Dan A. Salam, “Reducing Under-Fetching And Over-fetching In Rest API With Graphql For Web-Based Software Development,” Jurnal Teknik Informatika (Jutif), Vol. 5, No. 2, Hlm. 447–453, Apr 2024, Doi: 10.52436/1.Jutif.2024.5.2.1725.
[64]	M. V. Privalov Dan M. V. Stupina, “Improving Web-Oriented Information Systems Efficiency Using Redis Caching Mechanisms,” Indonesian Journal Of Electrical Engineering And Computer Science, Vol. 33, No. 3, Hlm. 1667, Mar 2024, Doi: 10.11591/Ijeecs.V33.I3.Pp1667-1675.
[65]	D. S. Pereira, L. F. V. Bezerra, J. S. Nunes, I. M. Barroca Filho, Dan F. A. S. Lopes, “Performance Efficiency Evaluation Based On Iso/Iec 25010:2011 Applied To A Case Study On Load Balance And Resilient,” Dalam Anais Do Xxiv Workshop De Testes E Tolerância A Falhas (Wtf 2023), Sociedade Brasileira De Computação - Sbc, Mei 2023, Hlm. 108–120. Doi: 10.5753/Wtf.2023.787.
[66]	D. Yuniasri, P. Damayanti, Dan S. Rochimah, “Performance Efficiency Evaluation Frameworks Based On Iso 25010,” Dalam 2020 10th Electrical Power, Electronics, Communications, Controls And Informatics Seminar (Eeccis), Ieee, Agu 2020, Hlm. 254–258. Doi: 10.1109/Eeccis49483.2020.9263432.
[67]	A. N. Rachman, R. N. Shofa, I. N. Sjamsuddin, G. N. Tarempa, I. T. Julianto, Dan B. A. Athoillah, “Load testing-Based Performance Evaluation Of The Siukt API System,” Journal Of Intelligent Systems Technology And Informatics, Vol. 2, No. 1, Hlm. 22–29, Mar 2026, Doi: 10.64878/Jistics.V2i1.89.
[68]	A. Annisa, M. Ardiana, P. N. Rahayu, T. Brian, Dan M. A. Jami’in, “Performance Evaluation Of Web Applications Using Jmeter Load testing For Server Capacity And Response Efficiency,” Journal Of Applied Informatics And Computing, Vol. 10, No. 1, Hlm. 585–590, Feb 2026, Doi: 10.30871/Jaic.V10i1.11840.
[69]	Microsoft Research, “Garnet: A High-Performance, Multi-Threaded Cache Store,” Microsoft Research. Diakses: 5 Juli 2026. [Daring]. Tersedia Pada: Https://Microsoft.Github.Io/Garnet/
[70]	J. C. Yusmita, R. Arya, J. M. Wijaya, K. M. Suryaningrum, Dan R. R. Siswanto, “Optimizing Database Access Strategy: A Performance Analysis Comparison Of Raw Sql And Prisma ORM,” Procedia Comput. Sci., Vol. 269, Hlm. 1201–1210, 2025, Doi: 10.1016/J.Procs.2025.09.061.
[71]	B. Rozak, E. Erizal, Dan F. Noor Hasan, “Implementasi Teknik Clustering Untuk Meningkatkan Performa Aplikasi Node Js,” Smart Comp: Jurnalnya Orang Pintar Komputer, Vol. 12, No. 4, Okt 2023, Doi: 10.30591/Smartcomp.V12i4.4532.
[72]	Y. Prilyansyah, “Optimasi Performa API Aplikasi E-Commerce Menggunakan Redis Caching,” 2025. Diakses: 14 Juli 2026. [Daring]. Tersedia Pada: Https://Newjournal.Lppmunindra.Ac.Id/Index.Php/String/Article/View/957/134
[73]	Microsoft Research, “Garnet Benchmarking Results: Resp Bench,” Microsoft Garnet Official Documentation. Diakses: 14 Juli 2026. [Daring]. Tersedia Pada: Https://Microsoft.Github.Io/Garnet/Docs/Benchmarking/Results-Resp-Bench
 


LAMPIRAN

Lampiran 1 Tangkapan Layar Utilitas Perangkat Keras Server (Glances) pada Kondisi Idle Sebelum Pengujian
Lampiran 2 Tangkapan Layar Utilitas Server (Glances) pada Skenario Baseline 1 User

Lampiran 3 Tangkapan Layar Utilitas Server (Glances) pada Skenario 10 Users
Lampiran 4 Tangkapan Layar Utilitas Server (Glances) pada Skenario 20 Users

Lampiran 5 Tangkapan Layar Utilitas Server (Glances) pada Skenario 50 Users

Lampiran 6 Tangkapan Layar Utilitas Server (Glances) pada Skenario 100 Users





Lampiran 7 Tangkapan Layar Utilitas Server (Glances) pada Skenario 200 Users
Lampiran 8 Tangkapan Layar Utilitas Server (Glances) pada Skenario 500 Users







Lampiran 9 Tangkapan Layar Laporan Hasil Pengujian Apache JMeter pada Skenario Baseline 1 User

Lampiran 10 Tangkapan Layar Laporan Hasil Pengujian Apache JMeter pada Skenario Baseline 10 User
Lampiran 11 Tangkapan Layar Laporan Hasil Pengujian Apache JMeter pada Skenario Baseline 20 User

Lampiran 12 Tangkapan Layar Laporan Hasil Pengujian Apache JMeter pada Skenario Baseline 50 User
Lampiran 13 Tangkapan Layar Laporan Hasil Pengujian Apache JMeter pada Skenario Baseline 100 User

Lampiran 14 Tangkapan Layar Laporan Hasil Pengujian Apache JMeter pada Skenario Baseline 200 User 

Lampiran 15 Tangkapan Layar Laporan Hasil Pengujian Apache JMeter pada Skenario Baseline 500 User


