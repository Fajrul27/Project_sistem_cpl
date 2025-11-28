# Docker Management Commands

## 1. Setup & Start (Pertama Kali / Update)
Jalankan perintah ini untuk build image dan menjalankan container. Gunakan flag `--build` untuk memastikan perubahan kode terbaru ter-apply.

```bash
docker-compose up -d --build
```
*   `-d`: Detached mode (jalan di background).
*   `--build`: Build ulang image dari Dockerfile.

## 2. Cek Status
Lihat apakah semua container berjalan normal (Up).

```bash
docker-compose ps
```

## 3. Lihat Logs
Jika ada error, cek logs backend atau database.

```bash
docker-compose logs -f
```
*   `-f`: Follow (real-time logs). Tekan `Ctrl+C` untuk keluar.

## 4. Stop (Tanpa Hapus Data)
Hanya mematikan container. Data database **AMAN** (tersimpan di volume).

```bash
docker-compose stop
```

## 5. Uninstall Bersih (Hapus SEMUA)
Gunakan ini jika ingin reset total, termasuk **MENGHAPUS DATA DATABASE**.

```bash
docker-compose down -v --rmi all
```
*   `down`: Stop dan remove container & network.
*   `-v`: **PENTING!** Hapus volume (data database hilang).
*   `--rmi all`: Hapus semua image yang dibuat (bersih-bersih disk).

---
**Catatan Penting:**
Saat menjalankan `docker-compose up` pertama kali, MariaDB akan otomatis import file `sistem_cpl.sql`. Pastikan file tersebut ada di folder root.
