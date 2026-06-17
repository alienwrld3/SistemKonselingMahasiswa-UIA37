# Sistem Konseling Mahasiswa
API backend untuk aplikasi `Sistem Konseling Mahasiswa` yang mendukung fitur chat realtime, booking, dan manajemen jadwal.

Project ini dibuat untuk Praktikum Teknologi Cloud Computing dengan tema Kelompok Upin Ipin Apin.

## Anggota Kelompok
1. Celsi Fransisca Sitompul (123230015)
2. Alma Wulan Saptaningrum (123230101)
3. Haidarudzaky Ikhsan (123230122)

## Deskripsi Singkat
Backend ini melayani aplikasi mobile dan web konseling mahasiswa:
- Data user dan autentikasi
- Pembuatan dan manajemen jadwal psikolog
- Pendaftaran booking sesi konseling
- Pembuatan laporan hasil konseling
- Chat realtime untuk sesi konseling

Arsitektur utama:
- MySQL untuk data pengguna, jadwal, booking, dan laporan
- MongoDB Atlas untuk menyimpan pesan chat realtime
- Node.js + Express sebagai API server
- Socket.IO untuk dukungan chat realtime

## Deployment GCP
Backend dapat dideploy menggunakan Google Cloud Build dan Cloud Run.
Konfigurasi deployment ada di `cloudbuild.yaml`:
- Membangun Docker image dari `Dockerfile`
- Push image ke Google Container Registry (`gcr.io/$PROJECT_ID/backend-mobile:$COMMIT_SHA`)
- Deploy ke Cloud Run di region `asia-southeast2`

Dockerfile menjalankan aplikasi pada port `3000` dengan base image `node:20-alpine`.

## Infrastruktur Database
Backend menggunakan dua jenis database:
1. MySQL untuk data utama
   - Terhubung lewat `config/db.js`
   - Dioptimalkan untuk GCP Cloud SQL / MySQL eksternal dengan pengaturan SSL
2. MongoDB Atlas untuk chat realtime
   - Terhubung lewat `config/mongo.js`
   - Menyimpan dokumen chat pada koleksi `Chat`

## Teknologi Utama
- Node.js
- Express
- MySQL (`mysql2`)
- MongoDB Atlas (`mongoose`)
- Socket.IO
- JWT untuk autentikasi
- bcryptjs untuk hashing password
- dotenv untuk environment variable
- CORS untuk request lintas domain

## Struktur Folder Penting
- `server.js` - entrypoint Express dan Socket.IO
- `routes/` - route API
  - `authRoutes.js`
  - `jadwalRoutes.js`
  - `bookingRoutes.js`
  - `laporanRoutes.js`
  - `psikologRoutes.js`
- `config/` - konfigurasi database
  - `db.js` - koneksi MySQL
  - `mongo.js` - koneksi MongoDB Atlas
- `models/` - model MongoDB chat
  - `Chat.js`

## Environment Variables
Buat file `.env` di folder `mobile_backend` dengan variabel berikut:

```env
PORT=3000
DB_HOST=<host_mysql>
DB_USER=<user_mysql>
DB_PASSWORD=<password_mysql>
DB_NAME=<nama_database_mysql>
MONGODB_URI=<uri_mongodb_atlas>
JWT_SECRET=<secret_jwt>
```

> Jangan upload `.env` ke repositori. Gunakan nilai rahasia yang benar untuk deployment Cloud Run dan pengaturan koneksi database.

## Install dan Jalankan Lokal
1. Masuk direktori backend:
   ```bash
   cd Konsultasi_Mobile-main/mobile_backend
   ```
2. Install dependensi:
   ```bash
   npm install
   ```
3. Jalankan server:
   ```bash
   node server.js
   ```
4. Akses API di `http://localhost:3000` atau port yang diatur dalam `.env`.

## Endpoints Utama
- `POST /api/auth/register` - registrasi pengguna
- `POST /api/auth/login` - login pengguna
- `GET /api/auth/me` - data profil pengguna
- `POST /api/jadwal` - tambah jadwal psikolog
- `GET /api/jadwal/tersedia` - daftar jadwal tersedia
- `GET /api/jadwal/psikolog/:id` - jadwal psikolog tertentu
- `POST /api/booking` - buat booking sesi konseling
- `GET /api/booking/mahasiswa/:id` - riwayat booking mahasiswa
- `GET /api/booking/psikolog/:id` - riwayat booking psikolog
- `POST /api/booking/:id/rate` - beri rating booking
- `POST /api/laporan` - buat laporan konseling
- `GET /api/laporan/psikolog/:id` - daftar laporan psikolog
- `GET /api/laporan/booking/:bookingId` - detail laporan booking
- `GET /api/chat/:booking_id` - ambil pesan chat per booking

## Chat Realtime
Socket.IO event:
- `join_room` - bergabung ke sesi chat berdasarkan `bookingId`
- `send_message` - kirim pesan dan simpan ke MongoDB Atlas
- `receive_message` - terima pesan dari pengguna lain

## Catatan Penting
- Backend menggunakan MySQL sebagai database relasional utama dan MongoDB Atlas untuk pesan chat.
- Untuk deployment menggunakan GCP, pastikan service account dan secret environment sudah terkonfigurasi.
- Periksa `cloudbuild.yaml` jika ingin otomatisasi build dan deploy ke Cloud Run.
