# 🎓 Sistem CPL - Capaian Pembelajaran Lulusan

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748.svg)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

Sistem manajemen Capaian Pembelajaran Lulusan (CPL) berbasis web untuk mendukung implementasi Outcome-Based Education (OBE) di perguruan tinggi.

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [User Roles](#user-roles)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Tentang Proyek

Sistem CPL adalah aplikasi fullstack yang dirancang untuk membantu institusi pendidikan dalam:
- Mengelola Capaian Pembelajaran Lulusan (CPL)
- Memetakan CPL dengan mata kuliah
- Mengelola CPMK (Capaian Pembelajaran Mata Kuliah)
- Mencatat dan menganalisis nilai mahasiswa
- Menghasilkan transkrip CPL
- Monitoring pencapaian learning outcomes

## ✨ Fitur Utama

### 🔐 Authentication & Authorization
- Multi-role access (Admin, Kaprodi, Dosen, Mahasiswa)
- JWT-based authentication
- Role-based route protection

### 📊 CPL Management
- CRUD operations untuk CPL
- Mapping CPL ke mata kuliah dengan bobot kontribusi
- Tracking status pencapaian CPL

### 📚 CPMK Management
- CRUD operations untuk CPMK
- Workflow validasi CPMK (draft → validated → active)
- Mapping CPMK ke CPL dengan persentase bobot

### 📝 Penilaian
- Input nilai teknik penilaian
- Kalkulasi otomatis nilai CPMK
- Kalkulasi nilai CPL berdasarkan mapping
- Tracking nilai per semester dan tahun ajaran

### 📈 Reporting & Analytics
- Dashboard statistik
- Transkrip CPL mahasiswa
- Export ke PDF
- Analisis pencapaian CPL

### 👥 User Management
- Manajemen users dan roles (Admin)
- Profile management
- Audit logging

## 🛠 Teknologi

### Frontend
```
React 18.3         - UI Library
TypeScript 5.8     - Type Safety
Vite 5.4           - Build Tool
TailwindCSS 3.4    - Styling
Shadcn/ui          - Component Library
React Router 6.30  - Routing
TanStack Query 5.8 - Data Fetching
React Hook Form    - Form Management
Zod                - Validation
Recharts           - Charts
jsPDF              - PDF Export
```

### Backend
```
Express.js 4.18    - Web Framework
TypeScript 5.8     - Type Safety
Prisma 5.22        - ORM
MySQL 8.0          - Database
JWT                - Authentication
bcryptjs           - Password Hashing
Multer             - File Upload
XLSX               - Excel Processing
```

## 📦 Prasyarat

Pastikan sistem Anda sudah terinstal:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MySQL** >= 8.0
- **Git**

## 🚀 Instalasi

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

# Copy environment variables
cp .env.example .env

# Edit .env dan sesuaikan dengan konfigurasi Anda
# DATABASE_URL, JWT_SECRET, dll

# Generate Prisma Client
npm run prisma:generate

# Push database schema
npm run prisma:push

# (Optional) Seed database
npm run prisma:seed
```

### 3. Setup Frontend

```bash
cd ../fe

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env dan sesuaikan API URL
```

## ⚙️ Konfigurasi

### Backend Environment Variables

Buat file `.env` di folder `be/`:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/sistem_cpl"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"

# Server
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"
```

### Frontend Environment Variables

Buat file `.env` di folder `fe/`:

```env
VITE_API_URL="http://localhost:3000/api"
```

## 🎮 Menjalankan Aplikasi

### Development Mode

**Terminal 1 - Backend:**
```bash
cd be
npm run server
```

Server akan berjalan di `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd fe
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd be
npm run build
npm start
```

**Frontend:**
```bash
cd fe
npm run build
npm run preview
```

## 📁 Struktur Proyek

```
Project_sistem_cpl/
├── be/                         # Backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Database seeder
│   ├── server/
│   │   ├── index.ts           # Main server file
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Middleware (auth, etc)
│   │   └── lib/               # Utilities
│   ├── package.json
│   └── tsconfig.json
│
├── fe/                         # Frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── AppSidebar.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── dashboard/    # Dashboard pages
│   │   │   ├── Auth.tsx
│   │   │   └── Index.tsx
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilities & API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
└── sistem_cpl.sql             # Database dump
```

## 📡 API Documentation

### Authentication

```http
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login
POST   /api/auth/logout        # Logout
GET    /api/auth/me            # Get current user
```

### CPL

```http
GET    /api/cpl                # Get all CPL
GET    /api/cpl/:id            # Get CPL by ID
POST   /api/cpl                # Create CPL
PUT    /api/cpl/:id            # Update CPL
DELETE /api/cpl/:id            # Delete CPL
```

### CPMK

```http
GET    /api/cpmk               # Get all CPMK
GET    /api/cpmk/:id           # Get CPMK by ID
POST   /api/cpmk               # Create CPMK
PUT    /api/cpmk/:id           # Update CPMK
DELETE /api/cpmk/:id           # Delete CPMK
PUT    /api/cpmk/:id/validate  # Validate CPMK
```

### Mata Kuliah

```http
GET    /api/mata-kuliah        # Get all courses
GET    /api/mata-kuliah/:id    # Get course by ID
POST   /api/mata-kuliah        # Create course
PUT    /api/mata-kuliah/:id    # Update course
DELETE /api/mata-kuliah/:id    # Delete course
```

### Users

```http
GET    /api/users              # Get all users (Admin)
GET    /api/users/:id          # Get user by ID
PUT    /api/users/:id          # Update user
PUT    /api/users/:id/role     # Update user role (Admin)
DELETE /api/users/:id          # Delete user (Admin)
```

### Nilai

```http
POST   /api/nilai-cpl          # Submit CPL score
POST   /api/nilai-teknik       # Submit technique score
GET    /api/transkrip-cpl      # Get CPL transcript
```

## 🗄️ Database Schema

### Core Models

**User & Authentication**
- `users` - User accounts
- `user_roles` - User roles (admin, dosen, mahasiswa, kaprodi)
- `profiles` - User profiles
- `sessions` - Auth sessions

**Learning Outcomes**
- `cpl` - Capaian Pembelajaran Lulusan
- `mata_kuliah` - Courses
- `cpmk` - Capaian Pembelajaran Mata Kuliah
- `cpl_mata_kuliah` - CPL to Course mapping
- `cpmk_cpl_mapping` - CPMK to CPL mapping

**Assessment**
- `teknik_penilaian` - Assessment techniques
- `nilai_cpl` - CPL grades
- `nilai_cpmk` - CPMK grades
- `nilai_teknik_penilaian` - Technique grades

**System**
- `audit_logs` - Activity logging
- `settings` - System settings

### ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    USER ||--o{ USER_ROLE : has
    USER ||--|| PROFILE : has
    USER ||--o{ SESSION : has
    USER ||--o{ AUDIT_LOG : creates
    
    CPL ||--o{ CPL_MATA_KULIAH : "mapped to"
    MATA_KULIAH ||--o{ CPL_MATA_KULIAH : "has"
    
    MATA_KULIAH ||--o{ CPMK : contains
    CPMK ||--o{ CPMK_CPL_MAPPING : "mapped to"
    CPL ||--o{ CPMK_CPL_MAPPING : "has"
    
    CPMK ||--o{ TEKNIK_PENILAIAN : has
    TEKNIK_PENILAIAN ||--o{ NILAI_TEKNIK_PENILAIAN : has
    
    PROFILE ||--o{ NILAI_CPL : receives
    PROFILE ||--o{ NILAI_CPMK : receives
    PROFILE ||--o{ NILAI_TEKNIK_PENILAIAN : receives
```

## 👥 User Roles

### Admin
- Manajemen users & roles
- Manajemen CPL
- Manajemen mata kuliah
- Manajemen settings
- View semua data

### Kaprodi (Kepala Program Studi)
- Manajemen CPL
- Manajemen mata kuliah
- Validasi CPMK
- View reports

### Dosen
- Manajemen CPMK
- Input nilai teknik penilaian
- View mahasiswa

### Mahasiswa
- View transkrip CPL
- View profile
- View nilai

## 🧪 Testing

```bash
# Backend tests
cd be
npm test

# Frontend tests
cd fe
npm test
```

## 📝 Development Workflow

1. **Create Branch**: `git checkout -b feature/nama-fitur`
2. **Development**: Lakukan perubahan
3. **Test**: Pastikan tidak ada error
4. **Commit**: `git commit -m "feat: deskripsi"`
5. **Push**: `git push origin feature/nama-fitur`
6. **Pull Request**: Buat PR untuk review

### Commit Convention

```
feat:     Fitur baru
fix:      Bug fix
docs:     Dokumentasi
style:    Formatting, missing semicolons, etc
refactor: Code refactoring
test:     Adding tests
chore:    Maintenance
```

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Team

- **Developer**: Fajrul27
- **Project**: PKL Akademik 2025

## 📞 Support

Jika ada pertanyaan atau masalah:
- Create an issue
- Email: [your-email]

## 🙏 Acknowledgments

- Shadcn/ui untuk component library
- Prisma untuk ORM
- React & Vite teams

---

**Built with ❤️ for better education management**
