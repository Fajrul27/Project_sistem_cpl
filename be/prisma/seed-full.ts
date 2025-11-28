// ============================================
// Prisma Seed Script - FULL DUMMY DATA
// ============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with FULL DUMMY DATA...\n');

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // ==================== USERS ====================

  // Admin
  console.log('Creating admin user...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sistem-cpl.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: {
        create: {
          role: 'admin'
        }
      },
      profile: {
        create: {
          namaLengkap: 'Administrator System',
          nip: '198800000001',
          noTelepon: '081234567890',
          alamat: 'Jl. Administrasi No. 1, Jakarta Pusat'
        }
      }
    }
  });
  console.log('✅ Admin created');

  // Dosen
  console.log('\nCreating dosen users...');
  const dosen1 = await prisma.user.create({
    data: {
      email: 'dosen1@sistem-cpl.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: { create: { role: 'dosen' } },
      profile: {
        create: {
          namaLengkap: 'Dr. Budi Santoso, M.Kom',
          nip: '198801010001',
          programStudi: 'Teknik Informatika',
          noTelepon: '081234567891',
          alamat: 'Jl. Pendidikan No. 10, Bandung'
        }
      }
    }
  });

  const dosen2 = await prisma.user.create({
    data: {
      email: 'dosen2@sistem-cpl.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: { create: { role: 'dosen' } },
      profile: {
        create: {
          namaLengkap: 'Dr. Siti Aisyah, M.T',
          nip: '198802020002',
          programStudi: 'Sistem Informasi',
          noTelepon: '081234567892',
          alamat: 'Jl. Informatika No. 20, Surabaya'
        }
      }
    }
  });

  const dosen3 = await prisma.user.create({
    data: {
      email: 'dosen3@sistem-cpl.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: { create: { role: 'dosen' } },
      profile: {
        create: {
          namaLengkap: 'Prof. Ahmad Hidayat, Ph.D',
          nip: '197912120003',
          programStudi: 'Teknik Informatika',
          noTelepon: '081234567893',
          alamat: 'Jl. Profesor No. 5, Yogyakarta'
        }
      }
    }
  });
  console.log('✅ 3 Dosen users created');

  // Mahasiswa
  console.log('\nCreating mahasiswa users...');
  const mahasiswa1 = await prisma.user.create({
    data: {
      email: 'mahasiswa1@student.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: { create: { role: 'mahasiswa' } },
      profile: {
        create: {
          namaLengkap: 'Ahmad Rizki Wijaya',
          nim: '2101010001',
          programStudi: 'Teknik Informatika',
          semester: 5,
          tahunMasuk: 2021,
          noTelepon: '085612345671',
          alamat: 'Jl. Mahasiswa No. 1, Jakarta'
        }
      }
    }
  });

  const mahasiswa2 = await prisma.user.create({
    data: {
      email: 'mahasiswa2@student.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: { create: { role: 'mahasiswa' } },
      profile: {
        create: {
          namaLengkap: 'Siti Nurhaliza',
          nim: '2101010002',
          programStudi: 'Teknik Informatika',
          semester: 5,
          tahunMasuk: 2021,
          noTelepon: '085612345672',
          alamat: 'Jl. Mahasiswa No. 2, Bandung'
        }
      }
    }
  });

  const mahasiswa3 = await prisma.user.create({
    data: {
      email: 'mahasiswa3@student.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: { create: { role: 'mahasiswa' } },
      profile: {
        create: {
          namaLengkap: 'Budi Hartono',
          nim: '2101010003',
          programStudi: 'Teknik Informatika',
          semester: 5,
          tahunMasuk: 2021,
          noTelepon: '085612345673',
          alamat: 'Jl. Mahasiswa No. 3, Surabaya'
        }
      }
    }
  });

  const mahasiswa4 = await prisma.user.create({
    data: {
      email: 'mahasiswa4@student.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: { create: { role: 'mahasiswa' } },
      profile: {
        create: {
          namaLengkap: 'Dewi Lestari',
          nim: '2101010004',
          programStudi: 'Sistem Informasi',
          semester: 5,
          tahunMasuk: 2021,
          noTelepon: '085612345674',
          alamat: 'Jl. Mahasiswa No. 4, Yogyakarta'
        }
      }
    }
  });

  const mahasiswa5 = await prisma.user.create({
    data: {
      email: 'mahasiswa5@student.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: { create: { role: 'mahasiswa' } },
      profile: {
        create: {
          namaLengkap: 'Eko Prasetyo',
          nim: '2101010005',
          programStudi: 'Teknik Informatika',
          semester: 5,
          tahunMasuk: 2021,
          noTelepon: '085612345675',
          alamat: 'Jl. Mahasiswa No. 5, Semarang'
        }
      }
    }
  });

  const mahasiswa6 = await prisma.user.create({
    data: {
      email: 'mahasiswa6@student.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: { create: { role: 'mahasiswa' } },
      profile: {
        create: {
          namaLengkap: 'Fitri Rahayu',
          nim: '2201010001',
          programStudi: 'Teknik Informatika',
          semester: 3,
          tahunMasuk: 2022,
          noTelepon: '085612345676',
          alamat: 'Jl. Mahasiswa No. 6, Medan'
        }
      }
    }
  });

  const mahasiswa7 = await prisma.user.create({
    data: {
      email: 'mahasiswa7@student.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: { create: { role: 'mahasiswa' } },
      profile: {
        create: {
          namaLengkap: 'Galih Pratama',
          nim: '2201010002',
          programStudi: 'Sistem Informasi',
          semester: 3,
          tahunMasuk: 2022,
          noTelepon: '085612345677',
          alamat: 'Jl. Mahasiswa No. 7, Makassar'
        }
      }
    }
  });

  const mahasiswa8 = await prisma.user.create({
    data: {
      email: 'mahasiswa8@student.ac.id',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: { create: { role: 'mahasiswa' } },
      profile: {
        create: {
          namaLengkap: 'Hana Permata',
          nim: '2201010003',
          programStudi: 'Teknik Informatika',
          semester: 3,
          tahunMasuk: 2022,
          noTelepon: '085612345678',
          alamat: 'Jl. Mahasiswa No. 8, Denpasar'
        }
      }
    }
  });
  console.log('✅ 8 Mahasiswa users created');

  // ==================== CPL ====================
  console.log('\nCreating CPL...');
  const cpl1 = await prisma.cpl.create({
    data: {
      kodeCpl: 'CPL-01',
      deskripsi: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi yang memperhatikan dan menerapkan nilai humaniora yang sesuai dengan bidang keahliannya.',
      kategori: 'Sikap',
      isActive: true,
      createdBy: admin.id
    }
  });

  const cpl2 = await prisma.cpl.create({
    data: {
      kodeCpl: 'CPL-02',
      deskripsi: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur.',
      kategori: 'Sikap',
      isActive: true,
      createdBy: admin.id
    }
  });

  const cpl3 = await prisma.cpl.create({
    data: {
      kodeCpl: 'CPL-03',
      deskripsi: 'Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan teknologi yang memperhatikan dan menerapkan nilai humaniora sesuai dengan keahliannya berdasarkan kaidah, tata cara dan etika ilmiah dalam rangka menghasilkan solusi, gagasan, desain atau kritik seni.',
      kategori: 'Pengetahuan',
      isActive: true,
      createdBy: admin.id
    }
  });

  const cpl4 = await prisma.cpl.create({
    data: {
      kodeCpl: 'CPL-04',
      deskripsi: 'Mampu menyusun deskripsi saintifik hasil kajian tersebut di atas dalam bentuk skripsi atau laporan tugas akhir, dan mengunggahnya dalam laman perguruan tinggi.',
      kategori: 'Keterampilan Umum',
      isActive: true,
      createdBy: admin.id
    }
  });

  const cpl5 = await prisma.cpl.create({
    data: {
      kodeCpl: 'CPL-05',
      deskripsi: 'Mampu mengambil keputusan secara tepat dalam konteks penyelesaian masalah di bidang keahliannya, berdasarkan hasil analisis informasi dan data.',
      kategori: 'Keterampilan Umum',
      isActive: true,
      createdBy: admin.id
    }
  });

  const cpl6 = await prisma.cpl.create({
    data: {
      kodeCpl: 'CPL-06',
      deskripsi: 'Menguasai konsep dan teknik dalam basis data, termasuk perancangan, implementasi, dan optimasi',
      kategori: 'Pengetahuan',
      isActive: true,
      createdBy: admin.id
    }
  });

  const cpl7 = await prisma.cpl.create({
    data: {
      kodeCpl: 'CPL-07',
      deskripsi: 'Mampu mengaplikasikan teknologi terkini dalam pengembangan aplikasi berbasis web dan mobile',
      kategori: 'Keterampilan Khusus',
      isActive: true,
      createdBy: admin.id
    }
  });

  const cpl8 = await prisma.cpl.create({
    data: {
      kodeCpl: 'CPL-08',
      deskripsi: 'Memahami dan menerapkan prinsip-prinsip kecerdasan buatan dan pembelajaran mesin',
      kategori: 'Pengetahuan',
      isActive: true,
      createdBy: admin.id
    }
  });
  console.log('✅ 8 CPL created');

  // ==================== MATA KULIAH ====================
  console.log('\nCreating Mata Kuliah...');
  const mk1 = await prisma.mataKuliah.create({
    data: {
      kodeMk: 'IF-101',
      namaMk: 'Pemrograman Dasar',
      sks: 3,
      semester: 1,
      deskripsi: 'Mata kuliah dasar pemrograman menggunakan bahasa pemrograman modern',
      isActive: true,
      createdBy: dosen1.id
    }
  });

  const mk2 = await prisma.mataKuliah.create({
    data: {
      kodeMk: 'IF-102',
      namaMk: 'Algoritma dan Struktur Data',
      sks: 3,
      semester: 2,
      deskripsi: 'Mempelajari algoritma dan struktur data fundamental',
      isActive: true,
      createdBy: dosen1.id
    }
  });

  const mk3 = await prisma.mataKuliah.create({
    data: {
      kodeMk: 'IF-201',
      namaMk: 'Basis Data',
      sks: 3,
      semester: 3,
      deskripsi: 'Perancangan dan implementasi sistem basis data',
      isActive: true,
      createdBy: dosen2.id
    }
  });

  const mk4 = await prisma.mataKuliah.create({
    data: {
      kodeMk: 'IF-202',
      namaMk: 'Pemrograman Web',
      sks: 3,
      semester: 4,
      deskripsi: 'Pengembangan aplikasi berbasis web modern',
      isActive: true,
      createdBy: dosen1.id
    }
  });

  const mk5 = await prisma.mataKuliah.create({
    data: {
      kodeMk: 'IF-301',
      namaMk: 'Rekayasa Perangkat Lunak',
      sks: 3,
      semester: 5,
      deskripsi: 'Prinsip dan praktik rekayasa perangkat lunak',
      isActive: true,
      createdBy: dosen3.id
    }
  });

  const mk6 = await prisma.mataKuliah.create({
    data: {
      kodeMk: 'IF-302',
      namaMk: 'Sistem Informasi',
      sks: 3,
      semester: 5,
      deskripsi: 'Analisis dan perancangan sistem informasi',
      isActive: true,
      createdBy: dosen2.id
    }
  });

  const mk7 = await prisma.mataKuliah.create({
    data: {
      kodeMk: 'IF-303',
      namaMk: 'Jaringan Komputer',
      sks: 3,
      semester: 5,
      deskripsi: 'Konsep dan implementasi jaringan komputer',
      isActive: true,
      createdBy: dosen3.id
    }
  });

  const mk8 = await prisma.mataKuliah.create({
    data: {
      kodeMk: 'IF-401',
      namaMk: 'Machine Learning',
      sks: 3,
      semester: 7,
      deskripsi: 'Algoritma dan aplikasi pembelajaran mesin',
      isActive: true,
      createdBy: dosen3.id
    }
  });

  const mk9 = await prisma.mataKuliah.create({
    data: {
      kodeMk: 'IF-402',
      namaMk: 'Mobile Programming',
      sks: 3,
      semester: 7,
      deskripsi: 'Pengembangan aplikasi mobile Android dan iOS',
      isActive: true,
      createdBy: dosen1.id
    }
  });

  const mk10 = await prisma.mataKuliah.create({
    data: {
      kodeMk: 'IF-403',
      namaMk: 'Keamanan Sistem Informasi',
      sks: 3,
      semester: 7,
      deskripsi: 'Prinsip dan teknik keamanan sistem informasi',
      isActive: true,
      createdBy: dosen2.id
    }
  });
  console.log('✅ 10 Mata Kuliah created');

  // ==================== CPL-MK MAPPINGS ====================
  console.log('\nCreating CPL-MK mappings...');
  const mappings = [
    // IF-101: Pemrograman Dasar
    { cplId: cpl1.id, mataKuliahId: mk1.id, bobot: 0.8 },
    { cplId: cpl2.id, mataKuliahId: mk1.id, bobot: 0.6 },

    // IF-102: Algoritma dan Struktur Data
    { cplId: cpl1.id, mataKuliahId: mk2.id, bobot: 0.9 },
    { cplId: cpl5.id, mataKuliahId: mk2.id, bobot: 1.0 },

    // IF-201: Basis Data
    { cplId: cpl6.id, mataKuliahId: mk3.id, bobot: 1.0 },
    { cplId: cpl3.id, mataKuliahId: mk3.id, bobot: 0.8 },

    // IF-202: Pemrograman Web
    { cplId: cpl7.id, mataKuliahId: mk4.id, bobot: 1.0 },
    { cplId: cpl2.id, mataKuliahId: mk4.id, bobot: 0.7 },
    { cplId: cpl3.id, mataKuliahId: mk4.id, bobot: 0.8 },

    // IF-301: Rekayasa Perangkat Lunak
    { cplId: cpl2.id, mataKuliahId: mk5.id, bobot: 1.0 },
    { cplId: cpl4.id, mataKuliahId: mk5.id, bobot: 0.9 },
    { cplId: cpl5.id, mataKuliahId: mk5.id, bobot: 0.8 },

    // IF-302: Sistem Informasi
    { cplId: cpl3.id, mataKuliahId: mk6.id, bobot: 1.0 },
    { cplId: cpl6.id, mataKuliahId: mk6.id, bobot: 0.8 },

    // IF-303: Jaringan Komputer
    { cplId: cpl3.id, mataKuliahId: mk7.id, bobot: 0.9 },
    { cplId: cpl5.id, mataKuliahId: mk7.id, bobot: 0.7 },

    // IF-401: Machine Learning
    { cplId: cpl8.id, mataKuliahId: mk8.id, bobot: 1.0 },
    { cplId: cpl5.id, mataKuliahId: mk8.id, bobot: 0.9 },

    // IF-402: Mobile Programming
    { cplId: cpl7.id, mataKuliahId: mk9.id, bobot: 1.0 },
    { cplId: cpl2.id, mataKuliahId: mk9.id, bobot: 0.8 },

    // IF-403: Keamanan Sistem Informasi
    { cplId: cpl3.id, mataKuliahId: mk10.id, bobot: 1.0 },
    { cplId: cpl5.id, mataKuliahId: mk10.id, bobot: 0.8 }
  ];

  for (const mapping of mappings) {
    await prisma.cplMataKuliah.create({
      data: mapping
    });
  }
  console.log(`✅ ${mappings.length} CPL-MK mappings created`);

  // ==================== NILAI CPL ====================
  console.log('\nCreating Nilai CPL...');

  // Helper function to generate random nilai
  const randomNilai = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const mahasiswaList = [mahasiswa1, mahasiswa2, mahasiswa3, mahasiswa4, mahasiswa5, mahasiswa6, mahasiswa7, mahasiswa8];
  const mkSemester1to5 = [mk1, mk2, mk3, mk4, mk5, mk6, mk7];

  let nilaiCount = 0;

  for (const mhs of mahasiswaList) {
    // Hardcode semester for seeding simplicity based on the data we just created
    // Mahasiswa 1-5 are sem 5, 6-8 are sem 3
    const semester = mhs.email.includes('mahasiswa6') || mhs.email.includes('mahasiswa7') || mhs.email.includes('mahasiswa8') ? 3 : 5;

    // Create nilai for each semester up to current semester
    for (let sem = 1; sem <= semester; sem++) {
      // Get mata kuliah for this semester
      const mkForSemester = mkSemester1to5.filter(mk => mk.semester <= sem);

      for (const mk of mkForSemester) {
        // Get CPL mappings for this MK
        const cplForMk = mappings.filter(m => m.mataKuliahId === mk.id);

        for (const mapping of cplForMk) {
          const nilai = randomNilai(65, 95);

          await prisma.nilaiCpl.create({
            data: {
              mahasiswaId: mhs.id,
              cplId: mapping.cplId,
              mataKuliahId: mk.id,
              nilai: nilai,
              semester: sem,
              tahunAjaran: '2023/2024', // Default for seeding
              createdBy: dosen1.id
            }
          });
          nilaiCount++;
        }
      }
    }
  }

  console.log(`✅ ${nilaiCount} Nilai CPL records created`);

  // Transkrip CPL - Calculated dynamically now
  // console.log('Seeding Transkrip CPL...');
  // for (const m of mahasiswa) {
  //   for (const c of cpl) {
  //     // ... logic removed ...
  //   }
  // }

  // ==================== SUMMARY ====================
  console.log('\n✅ Seeding completed successfully!\n');
  console.log('Summary:');
  console.log(`- 1 Admin user`);
  console.log(`- 3 Dosen users`);
  console.log(`- 8 Mahasiswa users (5 semester 5, 3 semester 3)`);
  console.log(`- 8 CPL`);
  console.log(`- 10 Mata Kuliah`);
  console.log(`- ${mappings.length} CPL-MK mappings`);
  console.log(`- ${nilaiCount} Nilai CPL records`);
  console.log('\nDefault credentials for all users:');
  console.log('Password: admin123\n');
  console.log('Sample logins:');
  console.log('- admin@sistem-cpl.ac.id');
  console.log('- dosen1@sistem-cpl.ac.id');
  console.log('- mahasiswa1@student.ac.id');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
