# Rencana Rollback Fitur Leaderboard

## Tujuan Dokumen

Dokumen ini berisi prosedur rollback untuk fitur Leaderboard InfoPekerjaan.id. Rencana ini harus diimplementasikan dalam situasi darurat ketika fitur mengalami masalah kritis yang tidak dapat diperbaiki dengan cepat melalui hotfix. Tujuan utama adalah memastikan stabilitas platform secara keseluruhan sambil meminimalkan dampak negatif terhadap pengalaman pengguna.

## Kriteria Rollback

Rollback harus dilakukan jika satu atau lebih kriteria berikut terpenuhi:

1. **Kegagalan Fungsional Kritis**
   - Leaderboard tidak dapat diakses sama sekali
   - Data pengguna salah atau tidak muncul
   - Filtering tidak berfungsi sama sekali

2. **Masalah Performa Serius**
   - Waktu respon API leaderboard > 3 detik secara konsisten
   - Penggunaan CPU/Memory server > 90% yang disebabkan oleh leaderboard
   - Database query timeout karena tabel/index leaderboard

3. **Dampak ke Sistem Lain**
   - Fitur leaderboard menyebabkan kegagalan pada fitur penting lainnya
   - Terjadi bottleneck database yang mempengaruhi seluruh platform
   - Masalah keamanan atau privasi terdeteksi

4. **Volume Error Tinggi**
   - Error rate > 5% dari total request ke fitur leaderboard
   - Lebih dari 10 laporan bug unik dalam 1 jam pertama
   - Social media complaints mencapai ambang batas yang ditentukan

## Peran dan Tanggung Jawab

| Peran | Tanggung Jawab | Eskalasi |
|-------|----------------|----------|
| Engineer on Duty | Mendeteksi masalah, menerapkan rollback teknis | Lead Engineer |
| Lead Engineer | Evaluasi dampak, keputusan rollback teknis | CTO |
| Product Manager | Komunikasi dengan stakeholder, keputusan bisnis | CEO |
| DevOps | Eksekusi prosedur rollback, monitoring | Lead Engineer |
| Customer Support | Komunikasi dengan pengguna | Product Manager |

## Prosedur Rollback Cepat (< 1 Jam Post-Launch)

### 1. Identifikasi dan Verifikasi Masalah
- [ ] Konfirmasi bahwa masalah memenuhi kriteria rollback
- [ ] Dokumentasikan masalah (screenshot, logs, error message)
- [ ] Tentukan scope masalah (frontend, backend, atau keduanya)
- [ ] Estimasi dampak (% pengguna yang terpengaruh)

### 2. Komunikasi Awal
- [ ] Notifikasi tim peluncuran via channel emergency
- [ ] Brief status ke stakeholder utama
- [ ] Siapkan pesan komunikasi untuk pengguna

### 3. Keputusan Rollback
- [ ] Lead Engineer dan Product Manager melakukan evaluasi cepat
- [ ] Keputusan Go/No-Go untuk rollback
- [ ] Dokumentasikan alasan rollback

### 4. Eksekusi Rollback Teknis

#### Opsi 1: Rollback via Feature Flag (Metode Tercepat)
- [ ] Nonaktifkan feature flag leaderboard di frontend dan backend
- [ ] Verifikasi bahwa semua entrypoint ke fitur leaderboard tidak aktif
- [ ] Pastikan navigasi dan menu kembali ke versi sebelumnya
- [ ] Verifikasi bahwa pengguna tidak dapat mengakses leaderboard

#### Opsi 2: Rollback via Code Deployment
- [ ] Deploy versi sebelumnya dari codebase (pre-leaderboard)
- [ ] Restart services yang relevan
- [ ] Verifikasi bahwa rollback berhasil
- [ ] Periksa integritas aplikasi secara umum

#### Opsi 3: Rollback Database (Jika Diperlukan)
- [ ] Nonaktifkan endpoint API leaderboard
- [ ] Buat backup tabel leaderboard terbaru
- [ ] Restore tabel ke versi sebelumnya atau drop tabel baru
- [ ] Verifikasi integritas data

### 5. Komunikasi Publik
- [ ] Kirim notifikasi in-app tentang "maintenance" fitur
- [ ] Update status di social media (jika diperlukan)
- [ ] Brief customer support dengan talking points

### 6. Verifikasi Post-Rollback
- [ ] Konfirmasi bahwa sistem kembali stabil
- [ ] Verifikasi bahwa tidak ada error baru muncul
- [ ] Periksa performa sistem secara keseluruhan
- [ ] Konfirmasi bahwa pengguna tidak dapat mengakses leaderboard

## Prosedur Rollback Standar (1-48 Jam Post-Launch)

### 1. Analisis dan Keputusan
- [ ] Kumpulkan data performa dan error
- [ ] Lakukan analisis root cause
- [ ] Evaluasi opsi: rollback vs. hotfix
- [ ] Ambil keputusan dengan stakeholder

### 2. Perencanaan
- [ ] Tentukan window waktu untuk rollback (preferably low-traffic)
- [ ] Siapkan komunikasi untuk pengguna
- [ ] Brief semua tim terkait
- [ ] Siapkan resources untuk eksekusi

### 3. Eksekusi
- [ ] Lakukan backup data terbaru
- [ ] Implementasikan rollback teknis (pilih dari opsi di atas)
- [ ] Deploy redirect atau placeholder untuk URL leaderboard
- [ ] Aktifkan komunikasi yang sudah dipersiapkan

### 4. Verifikasi dan Stabilisasi
- [ ] Verifikasi rollback berhasil di semua environments
- [ ] Monitor performa sistem min. 1 jam setelah rollback
- [ ] Konfirmasi semua fitur lain berfungsi normal
- [ ] Selesaikan semua komunikasi yang diperlukan

## Recovery Plan Post-Rollback

### 1. Immediate Recovery
- [ ] Lakukan debrief dengan tim
- [ ] Dokumentasikan apa yang terjadi
- [ ] Identifikasi masalah utama yang perlu diperbaiki
- [ ] Alokasikan resources untuk perbaikan

### 2. Remediation
- [ ] Perbaiki bug atau masalah yang teridentifikasi
- [ ] Lakukan review code dan solusi
- [ ] Tambahkan test case untuk mencegah masalah serupa
- [ ] Uji perbaikan secara menyeluruh di environment staging

### 3. Re-Launch Planning
- [ ] Tentukan timeline untuk re-launch
- [ ] Update rencana peluncuran dengan pelajaran dari rollback
- [ ] Siapkan strategi komunikasi untuk re-launch
- [ ] Pastikan semua stakeholder setuju dengan rencana baru

## Template Komunikasi Rollback

### 1. In-App Notification
```
[Pemberitahuan] Pemeliharaan Fitur Leaderboard

Fitur Leaderboard InfoPekerjaan.id sedang dalam pemeliharaan sementara. 
Kami sedang melakukan penyempurnaan untuk memberikan pengalaman yang 
lebih baik kepada Anda. Fitur ini akan kembali dalam waktu dekat. 
Terima kasih atas pengertian Anda.
```

### 2. Email ke Pengguna (Jika Diperlukan)
```
Subjek: Pemeliharaan Sementara Fitur Leaderboard InfoPekerjaan.id

Halo [Nama Pengguna],

Kami ingin menginformasikan bahwa fitur Leaderboard InfoPekerjaan.id sedang dalam pemeliharaan sementara. Tim teknis kami sedang bekerja untuk menyempurnakan fitur ini agar dapat memberikan pengalaman terbaik bagi Anda.

Selama masa pemeliharaan ini, Anda mungkin tidak dapat mengakses fitur Leaderboard. Namun, semua fitur lain di platform InfoPekerjaan.id tetap berfungsi normal.

Kami akan menginformasikan kembali ketika fitur ini sudah dapat diakses. Terima kasih atas pengertian dan kesabaran Anda.

Salam,
Tim InfoPekerjaan.id
```

### 3. Internal Email
```
Subjek: [URGENT] Rollback Fitur Leaderboard

Kepada Seluruh Tim,

Kami telah melakukan rollback untuk fitur Leaderboard karena [alasan singkat]. 

Masalah utama:
- [Deskripsi masalah 1]
- [Deskripsi masalah 2]

Status saat ini:
- Rollback telah berhasil dilakukan
- Sistem kembali stabil
- Pengguna telah diberitahu melalui in-app notification

Next steps:
- Post-mortem analysis dijadwalkan untuk [tanggal/waktu]
- Tim pengembangan akan fokus pada perbaikan masalah
- Re-launch akan direncanakan setelah masalah teratasi

Untuk tim Customer Support, mohon gunakan talking points berikut saat menerima pertanyaan terkait fitur ini:
[Talking points]

Jika ada pertanyaan, silakan hubungi [nama contact person].

Terima kasih,
Tim Release Management
```

## Checklist Post-Rollback

- [ ] Semua stakeholder telah diberitahu tentang rollback
- [ ] Root cause analysis dijadwalkan
- [ ] Pengguna telah diberitahu melalui saluran yang sesuai
- [ ] Backup data diverifikasi dan aman
- [ ] Monitoring diperkuat untuk fitur-fitur lain
- [ ] Lessons learned didokumentasikan
- [ ] Timeline untuk re-launch atau alternatif ditetapkan

---

Dokumen rollback plan ini harus direview dan diupdate secara berkala, terutama sebelum peluncuran fitur. Semua anggota tim peluncuran harus familiar dengan prosedur ini.

**Tanggal Dokumen**: April 2025  
**Tim**: Release Management & DevOps InfoPekerjaan.id