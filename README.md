# Portfolio Projects Backend — Next.js 16 + Supabase

Backend terpisah untuk mengelola data proyek portofolio secara dinamis melalui Admin Dashboard dan REST API.

---

## Fitur Utama

- **REST API Endpoints**:
  - `GET /api/projects` — Mengambil semua proyek yang berstatus *published* (publik, CORS terproteksi)
  - `GET /api/projects/:id` — Detail proyek berdasarkan UUID atau `slug` (publik)
  - `POST /api/projects` — Tambah proyek baru (autentikasi admin)
  - `PUT /api/projects/:id` — Edit proyek (autentikasi admin)
  - `DELETE /api/projects/:id` — Hapus proyek (autentikasi admin)
  - `POST /api/projects/:id/image` — Upload gambar ke Supabase Storage (autentikasi admin)
- **Admin Dashboard UI** (`/admin`):
  - Mengadopsi palet warna & tema gelap portofolio (clean, modern, fungsional)
  - Autentikasi aman via Supabase Auth & Next.js Middleware
  - Ikhtisar statistik (Total, Published, Draft, Featured)
  - Manajemen proyek lengkap (Rich case study: objectives, solutions, architecture layers, challenges, lessons learned, gallery)
- **Zero Downtime Fallback**:
  - React frontend tetap menampilkan data portofolio secara offline / fallback statis jika backend belum terhubung atau sedang maintenance.

---

## Panduan Setup

### 1. Buat Project di Supabase
1. Buka [database.new](https://database.new) dan buat project baru.
2. Buka **SQL Editor** di Supabase Dashboard, copy isi dari file [`supabase/schema.sql`](./supabase/schema.sql), lalu klik **Run**.
3. Buka **Storage** di Supabase Dashboard, buat bucket baru:
   - Nama bucket: `project-images`
   - Jadikan **Public bucket**.

### 2. Buat Akun Admin di Supabase
1. Buka **Authentication** ? **Users** di Supabase Dashboard.
2. Klik **Add User** ? **Create User**.
3. Masukkan email dan password admin Anda.

### 3. Konfigurasi Environment Variables
Copy `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Lengkapi nilainya dari Supabase Dashboard (**Settings** ? **API**):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://yd.vercel.app
ADMIN_EMAIL=your-email@example.com
```

### 4. Seed Data Proyek yang Sudah Ada
Untuk memasukkan 6 proyek portofolio yang ada ke database Supabase secara otomatis:
```bash
npm run seed
```

### 5. Jalankan Backend Secara Lokal
```bash
npm run dev
```
Buka browser ke `http://localhost:3000/admin` untuk login ke Admin Dashboard.

---

## Menghubungkan Frontend React

Di folder `portfolio/`, buat file `.env` (atau set di Vercel):
```env
VITE_API_URL=http://localhost:3000   # untuk lokal
# VITE_API_URL=https://portfolio-backend.vercel.app # untuk production
```

---

## Deployment ke Vercel

1. Buat repository baru di GitHub untuk `portfolio-backend` dan push kodenya.
2. Di Vercel Dashboard, klik **Add New Project** ? Import repository `portfolio-backend`.
3. Tambahkan seluruh Environment Variables dari `.env.local` ke Vercel Settings.
4. Klik **Deploy**.
5. Salin URL hasil deploy (misal: `https://portfolio-backend.vercel.app`), lalu masukkan ke environment variable `VITE_API_URL` di Vercel project frontend portofolio Anda.
