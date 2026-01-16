# Sistem CPL - Quick Start (Windows & Linux Compatible)

## 🚀 Solusi Cepat - Tanpa Docker

### 1. Install MySQL Portable (Termudah untuk Windows)

Download **XAMPP** (sudah include MySQL):
- https://www.apachefriends.org/download.html
- Jalankan MySQL dari XAMPP Control Panel

### 2. Setup Project

```bash
# Install dependencies root
npm install

# Install semua dependencies
npm run install:all

# Setup database
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

### 3. Jalankan

Satu command untuk semua:
```bash
npm run dev
```

Akses: 
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

### Default Login
- Email: `admin@university.ac.id`
- Password: `123456`

---

Lihat [SETUP.md](./SETUP.md) untuk panduan lengkap.
