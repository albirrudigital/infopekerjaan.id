# InfoPekerjaan.id

Platform rekrutmen kerja modern untuk pasar kerja Indonesia.

![InfoPekerjaan.id](attached_assets/04197B%20infopekerjaan%203.png)

## Deskripsi

InfoPekerjaan.id adalah platform rekrutmen kerja komprehensif yang menghubungkan pencari kerja dan perusahaan/HRD melalui aplikasi web yang inovatif dan berbasis data, dioptimalkan untuk pasar kerja Indonesia.

### Fitur Utama

- **Untuk Pencari Kerja:**
  - Pembuatan dan pengelolaan CV dan profil profesional
  - Pencarian lowongan kerja dengan filter canggih
  - Tracking aplikasi lamaran
  - Achievement system dan profile completion gamification
  - Mood & motivation tracker

- **Untuk Perusahaan/HRD:**
  - Publikasi dan manajemen lowongan pekerjaan
  - Review dan filter pelamar
  - Analytics dan insight tentang pelamar
  - Verifikasi perusahaan
  - Dashboard perusahaan komprehensif

- **Fitur Umum:**
  - Sistem notifikasi email (9 jenis notifikasi)
  - Informasi regulasi ketenagakerjaan per daerah
  - Pencarian perusahaan menurut kabupaten/kota
  - Mode tema gelap/terang
  - Desain responsif untuk desktop dan mobile
  - Dukungan internasionalisasi

## Teknologi

- **Frontend:** React.js, Tailwind CSS, shadcn/ui
- **Backend:** Express.js
- **Database:** PostgreSQL dengan Drizzle ORM
- **Email:** SendGrid API
- **Deployment:** Replit

## Pengaturan Proyek

### Prasyarat

- Node.js versi 18 atau lebih baru
- PostgreSQL
- SendGrid API key (untuk fitur email)

### Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/username/infopekerjaan-id.git
   cd infopekerjaan-id
   ```

2. Instal dependensi:
   ```bash
   npm install
   ```

3. Siapkan variabel lingkungan:
   - Buat file `.env` di root proyek
   - Tambahkan variabel berikut:
     ```
     DATABASE_URL=postgresql://username:password@localhost:5432/infopekerjaan
     SENDGRID_API_KEY=your_sendgrid_api_key
     ```

4. Inisialisasi database:
   ```bash
   npm run db:push
   ```

5. Seed data awal (opsional):
   ```bash
   tsx scripts/seed-profile-completion.ts
   ```

### Menjalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5000`.

## Scripts Utilitas

Project ini dilengkapi dengan beberapa script utilitas untuk pengelolaan data. Lihat [dokumentasi scripts](./scripts/README.md) untuk informasi lebih lanjut.

## Lisensi

Copyright © 2024 InfoPekerjaan.id. All rights reserved.