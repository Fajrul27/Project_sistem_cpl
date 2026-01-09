# Sistem CPL - Setup Guide

## Cara Running Project (Windows & Linux)

### Pilihan 1: Menggunakan Docker (Recommended - Cross Platform)

#### Prerequisites
- Docker Desktop (Windows) atau Docker Engine (Linux)
- Docker Compose

#### Langkah-langkah:

```bash
# 1. Clone repository
git clone <repository-url>
cd Project_sistem_cpl

# 2. Build dan jalankan semua service
docker-compose down --remove-orphans
docker-compose build
docker-compose up -d

# 3. Cek logs
docker logs -f sistem_cpl_be
docker logs -f sistem_cpl_fe

# 4. Akses aplikasi
# Frontend: http://localhost:8081
# Backend API: http://localhost:3000
# Database: localhost:3307
```

---

### Pilihan 2: Running Lokal (Development)

#### A. Setup Database

**Menggunakan Docker untuk Database saja:**

```bash
# Jalankan hanya MySQL container
docker run -d \
  --name sistem_cpl_db \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=sistem_cpl \
  -p 3307:3306 \
  mariadb:latest
```

**Atau Install MySQL/MariaDB Lokal:**

- **Windows**: Download dari https://dev.mysql.com/downloads/installer/
- **Linux**: 
  ```bash
  # Ubuntu/Debian
  sudo apt update
  sudo apt install mariadb-server
  
  # CentOS/RHEL
  sudo yum install mariadb-server
  ```

#### B. Setup Backend

```bash
cd be

# 1. Copy environment file
cp .env.example .env

# 2. Edit .env sesuaikan dengan database Anda
# DATABASE_URL="mysql://root:root@localhost:3307/sistem_cpl"

# 3. Install dependencies
npm install

# 4. Generate Prisma Client
npx prisma generate

# 5. Push schema ke database
npx prisma db push

# 6. (Optional) Seed data
npm run prisma:seed

# 7. Jalankan development server
npm run server
```

#### C. Setup Frontend

```bash
cd fe

# 1. Install dependencies
npm install
# atau jika ada error peer dependency:
npm install --legacy-peer-deps

# 2. Jalankan development server
npm run dev
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://root:root@localhost:3307/sistem_cpl"
JWT_SECRET="your-super-secret-key-change-in-production-minimum-32-characters"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:8081"
```

### Frontend
Frontend akan otomatis connect ke `http://localhost:3000` untuk development.

---

## Troubleshooting

### Windows

**Error: Cannot connect to MySQL**
- Pastikan MySQL/MariaDB service running, atau
- Gunakan Docker untuk database: `docker run -d -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=sistem_cpl -p 3307:3306 mariadb:latest`

**Error: npm install failed (React peer dependency)**
- Gunakan: `npm install --legacy-peer-deps`
- Atau buat file `.npmrc` dengan isi: `legacy-peer-deps=true`

**Error: 'tsx' is not recognized**
- Jalankan: `npm install` di folder `be`

### Linux

**Error: Permission denied (MySQL)**
```bash
sudo mysql_secure_installation
sudo mysql -u root -p
CREATE DATABASE sistem_cpl;
```

**Error: Port already in use**
```bash
# Cek proses yang menggunakan port
sudo lsof -i :3000
sudo lsof -i :8081

# Kill proses
kill -9 <PID>
```

---

## Port yang Digunakan

| Service | Port | URL |
|---------|------|-----|
| Frontend Dev | 8081/8082 | http://localhost:8081 |
| Backend API | 3000 | http://localhost:3000 |
| MySQL/MariaDB | 3307 | localhost:3307 |
| Nginx (Docker) | 8880 | http://localhost:8880 |

---

## Development Tips

### Hot Reload
- Backend: `npm run server` (tsx watch)
- Frontend: `npm run dev` (Vite HMR)

### Database GUI
```bash
# Prisma Studio
cd be
npx prisma studio
```

### Build Production
```bash
# Backend
cd be
npm run build

# Frontend
cd fe
npm run build
```
