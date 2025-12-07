# Sistem CPL - Capaian Pembelajaran Lulusan

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748.svg)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)

Sistem manajemen Capaian Pembelajaran Lulusan (CPL) berbasis web yang komprehensif untuk mendukung implementasi **Outcome-Based Education (OBE)** di perguruan tinggi. Aplikasi ini dirancang untuk memfasilitasi siklus penuh OBE, mulai dari perumusan profil lulusan hingga evaluasi perbaikan berkelanjutan (CQI).

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Docker Deployment](#docker-deployment)
- [Struktur Proyek](#struktur-proyek)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## Tentang Proyek

Sistem CPL bukan sekadar aplikasi pencatatan nilai, melainkan platform yang mengintegrasikan seluruh elemen kurikulum OBE:

1.  **Perencanaan (Planning)**: Mendefinisikan Visi Misi, Profil Lulusan, dan menurunkan CPL (Capaian Pembelajaran Lulusan).
2.  **Pemetaan (Mapping)**: Menghubungkan CPL ke Mata Kuliah dan CPMK (Capaian Pembelajaran Mata Kuliah) dengan bobot yang terukur.
3.  **Pelaksanaan (Execution)**: Dosen melakukan asesmen menggunakan berbagai teknik (Tes, Non-Tes, Rubrik) yang terhubung langsung ke CPMK.
4.  **Evaluasi (Evaluation)**: Menghitung ketercapaian CPL mahasiswa secara otomatis berdasarkan nilai asesmen.
5.  **Perbaikan (CQI)**: Evaluasi mata kuliah oleh dosen dan feedback dari Kaprodi untuk peningkatan kualitas pembelajaran semester berikutnya.

## Fitur Utama

### OBE Hierarchy Management
- **Visi & Misi**: Manajemen visi misi program studi sebagai landasan kurikulum.
- **Profil Lulusan**: Definisi profil profesional yang diharapkan (e.g., Software Engineer, Data Scientist).
- **CPL (Learning Outcomes)**: Manajemen CPL dengan kategori (Sikap, Pengetahuan, Keterampilan Umum/Khusus).
- **Mapping Matrix**: Visualisasi dan manajemen mapping antara Profil Lulusan ↔ CPL ↔ Mata Kuliah.

### CPMK & Assessment Design
- **Taxonomy Integration**: Integrasi Bloom's Taxonomy (Kognitif C1-C6, Afektif A1-A5, Psikomotor P1-P5) dalam perumusan CPMK.
- **Validasi Bobot Ketat**: Sistem validasi real-time memastikan total bobot Sub-CPMK untuk satu CPMK adalah **tepat 100%**.
- **Rubrik Penilaian**: Sistem rubrik dinamis dengan kriteria dan level penilaian (e.g., Sangat Baik, Baik, Cukup) untuk asesmen yang objektif.
- **Fleksibilitas Edit**: Memungkinkan perbaikan metadata CPMK (kode, deskripsi) tanpa merusak integritas data nilai yang sudah masuk.

### Penilaian & Grading
- **Input Nilai Fleksibel**: Dukungan untuk input nilai angka langsung atau menggunakan rubrik.
- **Evaluasi CPL Otomatis**: Kalkulasi nilai CPL mahasiswa secara otomatis berdasarkan bobot dari level Sub-CPMK ke atas.
- **Export Laporan**: Fitur export nilai dan transkrip CPL ke format Excel yang rapi per kelas.
- **Indirect Assessment**: Kuesioner penilaian diri (self-assessment) bagi mahasiswa.

### User Experience (UX)
- **Standardized UI**: Antarmuka konsisten menggunakan Shadcn UI (Dialogs, Loading States, Toasts).
- **Responsive Design**: Tabel dan layout yang responsif untuk berbagai ukuran layar.
- **Role-Based Views**: Dashboard yang disesuaikan untuk Admin, Dosen, dan Mahasiswa.

### Continuous Quality Improvement (CQI)
- **Evaluasi Mata Kuliah**: Form evaluasi diri dosen di akhir semester (kendala, rencana perbaikan).
- **Feedback Loop**: Kaprodi dapat memberikan feedback atas evaluasi dosen.

## Teknologi

### Frontend
- **Core**: React 18.3, TypeScript 5.8, Vite 5.4
- **UI/UX**: TailwindCSS 3.4, Shadcn/ui, Lucide React
- **State & Data**: TanStack Query 5.x, React Hook Form, Zod
- **Visualization**: Recharts (Grafik & Chart)
- **Reporting**: jsPDF, docx, XLSX (Export laporan)

### Backend
- **Runtime**: Node.js, Express.js 4.18
- **Language**: TypeScript 5.8
- **Database**: MySQL 8.0
- **ORM**: Prisma 5.22
- **Security**: BCrypt, JWT, CORS
- **Utils**: Multer (Upload), XLSX (Excel processing)

## Prasyarat

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MySQL** >= 8.0
- **Git**

## Instalasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd Project_sistem_cpl
```

### 2. Setup Backend

```bash
cd be

# Install dependencies
npm install

# Setup Environment Variables
cp .env.example .env
# Edit .env sesuaikan dengan konfigurasi database Anda

# Database Setup
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema ke database

# Seeding Data Master (PENTING)
# Perintah ini akan mengisi data: Fakultas, Prodi, User (Admin/Dosen/Mhs), Level Taksonomi, dll.
npm run prisma:seed
```

### 3. Setup Frontend

```bash
cd ../fe

# Install dependencies
npm install

# Setup Environment Variables
cp .env.example .env
# Pastikan VITE_API_URL mengarah ke backend (default: http://localhost:3000/api)
```

## Konfigurasi

### Backend (.env)
```env
DATABASE_URL="mysql://user:password@localhost:3306/sistem_cpl"
JWT_SECRET="your-secret-key"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL="http://localhost:3000/api"
```

## Menjalankan Aplikasi

### Development Mode

**Terminal 1 (Backend):**
```bash
cd be
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd fe
npm run dev
```

Akses aplikasi di `http://localhost:5173`.

## Docker Deployment

Project ini sudah mendukung Docker untuk kemudahan deployment.

**Cara Cepat:**
```bash
docker-compose up -d --build
```

Untuk panduan lengkap mengenai perintah Docker, silakan baca [DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md).

## Struktur Proyek

```
Project_sistem_cpl/
├── be/                         # Backend (Express + Prisma)
│   ├── prisma/                # Schema & Seeds
│   ├── server/
│   │   ├── routes/            # API Endpoints
│   │   ├── controller/        # Logic Handler
│   │   ├── services/          # Business Logic Layer
│   │   └── ...
├── fe/                         # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/        # Reusable Components
│   │   ├── pages/             # Page Views
│   │   ├── hooks/             # Custom React Hooks
│   │   └── lib/               # API Client & Utils
└── ...
```

## API Documentation

API tersedia di endpoint `/api`. Beberapa endpoint utama:

- **Auth**: `/api/auth/login`, `/api/auth/me`
- **CPL**: `/api/cpl` (CRUD CPL)
- **CPMK**: `/api/cpmk` (CRUD & Validasi)
- **Nilai**: `/api/nilai-cpl`, `/api/nilai-teknik`
- **Laporan**: `/api/transkrip-cpl`

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---
**Developers**: Fajrul27 & nrmaanrfnd7
**Project**: PKL Akademik 2025
