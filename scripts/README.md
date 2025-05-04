# InfoPekerjaan.id - Scripts Utilitas

Berikut adalah kumpulan script utilitas untuk membantu inisialisasi dan pemeliharaan aplikasi InfoPekerjaan.id.

## Profile Completion Scripts

### init-all-users-profile-completion.ts

Script ini digunakan untuk menginisialisasi status profile completion untuk semua pengguna yang ada di database. Script ini dapat dijalankan dengan aman berulang kali karena akan melewati pengguna yang sudah memiliki item profile completion.

```bash
# Jalankan script inisialisasi profile completion
tsx scripts/init-all-users-profile-completion.ts
```

### init-profile-completion-for-user.ts

Script ini digunakan untuk menginisialisasi status profile completion untuk pengguna tertentu berdasarkan ID.

```bash
# Jalankan script inisialisasi profile completion untuk user dengan ID 5
tsx scripts/init-profile-completion-for-user.ts 5 jobseeker
```

### fix-duplicate-profile-completions.ts

Script ini digunakan untuk mendeteksi dan memperbaiki duplikasi data pada tabel user_profile_completions. Duplikasi dapat terjadi jika proses inisialisasi terinterupsi atau dijalankan beberapa kali.

```bash
# Jalankan script perbaikan duplikasi data
tsx scripts/fix-duplicate-profile-completions.ts
```

### seed-profile-completion.ts

Script ini digunakan untuk mengisi tabel profile_completion_items dengan data awal. Gunakan script ini jika item profile completion belum tersedia di database.

```bash
# Jalankan script pengisian data item profile completion
tsx scripts/seed-profile-completion.ts
```

## Achievement Scripts

### seed-achievements.ts

Script ini digunakan untuk mengisi tabel achievements dengan data awal.

```bash
# Jalankan script pengisian data achievements
tsx scripts/seed-achievements.ts
```

## Admin Scripts

### create-admin.ts

Script ini digunakan untuk membuat akun admin baru jika diperlukan.

```bash
# Jalankan script pembuatan admin
tsx scripts/create-admin.ts
```

## Catatan Penting

- Pastikan database sudah terhubung sebelum menjalankan script-script ini.
- Script-script ini bersifat idempoten (aman dijalankan berulang kali) kecuali disebutkan sebaliknya.
- Untuk script yang melakukan perubahan data, sebaiknya lakukan backup database terlebih dahulu.