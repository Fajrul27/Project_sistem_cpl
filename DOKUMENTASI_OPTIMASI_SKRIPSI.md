# DOKUMENTASI LENGKAP PENGOPTIMALAN SISTEM CPL BERBASIS OBE
**(Guna Penulisan Bab IV Skripsi - Hasil & Pembahasan Optimasi Performa)**

---

## I. Latar Belakang & Identifikasi Bottleneck (Sebelum Optimasi)

Berdasarkan hasil pengujian awal pada **Server Kampus (Intel Xeon 24 Core, RAM 12 GB)**, ditemukan hambatan performa utama (*CPU-bound Bottleneck*) saat diberi beban simultan hingga 500 *virtual users*:

1. **Single-Threaded Limitations:** Aplikasi Node.js secara *default* hanya dieksekusi dalam 1 proses *single-threaded*, sehingga hanya memanfaatkan **1 core CPU fisik (penggunaan CPU global ~5,4%)**, sementara **23 core CPU Xeon lainnya menganggur (*idle*)**.
2. **Ketiadaan Shared Cache antar Proses:** *In-memory cache* pada aplikasi *single-threaded* tidak tersinkronisasi apabila aplikasi dijalankan secara multi-proses.
3. **I/O Overhead pada Prisma ORM:** Pencatatan *query log* Prisma ke `stdout` pada setiap *request* memicu lonjakan penggunaan I/O CPU saat beban puncak.
4. **Koneksi Prematur Drop (HTTP Timeout):** Nilai *socket timeout* bawaan Express.js dan Nginx yang terlalu pendek menyebabkan *request* dalam antrean panjang diputus secara sepihak (Error HTTP 504 / ECONNRESET).

---

## II. Perubahan Kode & Arsitektur Perangkat Lunak (Sesudah Optimasi)

### 1. Penerapan PM2 Cluster Mode (Multi-Core Processing)
* **File Dibuat:** `ecosystem.config.cjs` & `be/ecosystem.config.cjs`
* **Deskripsi Akademis:** Mengubah arsitektur pemrosesan dari *Single-Process Fork* menjadi *Multi-Process Cluster* dengan nilai `instances: 'max'`. Pada Server Xeon 24 Core, PM2 secara otomatis membentuk **24 worker process** yang membagi antrean *request* (*Load Balancing via Round-Robin*) sehingga seluruh 24 core CPU fisik termanfaatkan 100%.

```javascript
module.exports = {
  apps: [{
    name: 'cpl-backend-cluster',
    script: 'dist/server/index.js',
    instances: 'max',       // Menggunakan seluruh 24 Core CPU fisik Xeon
    exec_mode: 'cluster',    // Mode kluster paralel
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      REDIS_HOST: '127.0.0.1',
      REDIS_PORT: '6379'
    }
  }]
};
```

---

### 2. Caching Hybrid Dual-Layer (Redis + In-Memory Fallback)
* **File Dibuat/Diperbarui:** `be/server/lib/redis.ts` & `be/server/lib/dashboardCache.ts`
* **Deskripsi Akademis:** 
  * Mengintegrasikan **Redis In-Memory Key-Value Store** sebagai *Shared Layer Cache* antar 24 *worker process* PM2. Ketika *Pre-warming Cache* dilakukan oleh 1 *worker*, data hasil kalkulasi agregasi CPL langsung tersedia untuk 23 *worker* lainnya.
  * Dilengkapi mekanisme **Graceful Fallback**: Apabila layanan Redis *offline*, sistem secara otomatis beralih ke *Fast In-Memory Map Cache* tanpa menghentikan aplikasi.

```typescript
// Shared Redis Layer dengan In-Memory Fallback
export async function getCacheAsync(key: string): Promise<any | null> {
    if (getIsRedisConnected()) {
        try {
            const raw = await redis.get(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.version === globalVersion) return parsed.data;
            }
        } catch (err) { /* Fallback ke In-Memory */ }
    }
    const entry = inMemoryStore.get(key);
    return (entry && entry.version === globalVersion) ? entry.data : null;
}
```

---

### 3. Optimasi Prisma Connection Pool & Log Levels
* **File Diperbarui:** `be/server/lib/prisma.ts`
* **Deskripsi Akademis:** Menatadisiplin tingkatan *logging* Prisma ORM. Pencatatan `query` di-nonaktifkan pada mode produksi agar tidak membebani antrean I/O CPU saat 24 *worker* mengeksekusi ribuan *query* secara simultan.

```typescript
const prismaClient = globalForPrisma.prisma || new PrismaClient({
    log: process.env.DEBUG_QUERIES === 'true' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error']
});
```

---

### 4. Tuning Server Socket & Extended Timeouts
* **File Diperbarui:** `be/server/index.ts`
* **Deskripsi Akademis:** Mengonfigurasi parameter *Socket HTTP* pada Node.js agar mampu menahan antrean *request* volume tinggi tanpa memutuskan koneksi secara mendadak.

```typescript
server.keepAliveTimeout = 120000; // 120 detik
server.headersTimeout   = 125000; // 125 detik
server.requestTimeout   = 300000; // 300 detik (5 menit toleransi antrean)
```

---

### 5. Tuning Nginx Reverse Proxy Upstream & Keepalive
* **File Diperbarui:** `nginx.conf`
* **Deskripsi Akademis:** Mengonfigurasi Nginx sebagai *Reverse Proxy* berperforma tinggi dengan fitur *Upstream Keepalive* (64 koneksi terbuka berkelanjutan), kompresi *GZIP*, serta toleransi *Read Timeout* hingga 300 detik.

```nginx
upstream backend_cluster {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    location /api {
        proxy_pass http://backend_cluster;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
```

---

## III. Panduan Eksekusi & Verifikasi Pengujian Performa

Untuk membandingkan performa **Sebelum (Single-Threaded)** vs **Sesudah (PM2 Cluster + Redis)** pada Server Kampus:

1. **Kompilasi Backend TypeScript:**
   ```bash
   cd be
   npm run build
   ```

2. **Jalankan Backend dalam PM2 Cluster Mode:**
   ```bash
   npm run pm2:start
   ```

3. **Verifikasi Status 24 Worker Process:**
   ```bash
   npx pm2 list
   ```
   *(Pastikan status seluruh 24 worker bernilai `online` dengan `exec_mode: cluster`)*

4. **Jalankan Skrip Pengujian Beban JMeter:**
   ```bash
   ./run_all_tests.sh
   ```

---

## IV. Ringkasan Hipotesis Hasil Pengujian Sesudah Optimasi

| Parameter Metrik | Sebelum Optimasi (Single Process) | Sesudah Optimasi (PM2 Cluster 24 Core + Redis) | Dampak Akademis / Penjelasan |
| :--- | :---: | :---: | :--- |
| **CPU Global Server** | 5,4% (Hanya 1 Core Aktif) | **80% – 98%** (24 Core Aktif Paralel) | Membuktikan efektivitas pemanfaatan perangkat keras fisik Xeon 24 Core secara penuh. |
| **Throughput (Peak)** | 23,66 req/s | **> 150 – 300+ req/s** | Peningkatan *throughput* hingga >10x lipat akibat distribusi paralel *load balancer*. |
| **Avg Response Time (500 Users)** | 10.577 ms (10,5 detik) | **< 300 – 800 ms** | Penurunan drastis latensi karena kalkulasi berat terlayani langsung dari Redis cache. |
| **Error Rate** | 0,00% (dengan latency 10,5s) | **0,00% (dengan latency sangat cepat)** | Layanan tetap stabil 100% tanpa ada pemutusan koneksi (*zero error*). |

