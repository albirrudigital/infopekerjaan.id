# Instruksi Penggunaan Checklist Responsivitas Leaderboard

## Panduan Umum
1. Checklist ini disusun berdasarkan prioritas area pengujian untuk memastikan leaderboard responsif di semua perangkat.
2. Mulai dari Mobile View (320px-767px) sebagai prioritas tertinggi, karena perangkat dengan layar kecil memiliki tantangan UX terbesar.
3. Lanjutkan dengan Tablet View (768px-1024px) setelah Mobile View selesai.
4. Akhiri dengan Cross-Device Testing untuk verifikasi final.

## Cara Mengisi
1. Gunakan kolom "Status" untuk mencatat hasil pengujian:
   - "Pass" - Item berfungsi dengan baik
   - "Fail" - Ada masalah yang perlu diperbaiki
   - "Partial" - Berfungsi tapi ada ruang untuk perbaikan
   - "Not Tested" - Belum diuji

2. Gunakan kolom "Notes" untuk mencatat detail:
   - Jika "Pass": Catat konfirmasi singkat
   - Jika "Fail": Jelaskan masalah spesifik dan device/browser
   - Jika "Partial": Catat apa yang perlu ditingkatkan

3. Gunakan kolom "Device" untuk mencatat perangkat pengujian:
   - Format: "Device Name - Browser (Ukuran Layar)"
   - Contoh: "iPhone SE - Safari (375px)", "iPad - Chrome (768px)"

## Prioritas Item
- **High**: Harus diperbaiki segera jika gagal - masalah kritis yang mempengaruhi penggunaan
- **Medium**: Sebaiknya diperbaiki - mempengaruhi pengalaman tapi tidak kritis
- **Low**: Bagus untuk diperbaiki - penyempurnaan untuk UX yang lebih baik

## Tips Pengujian
1. **Gunakan Device Nyata**: Jika memungkinkan, gunakan perangkat fisik untuk pengujian yang paling akurat.
2. **DevTools**: Gunakan mode responsif di browser DevTools untuk simulasi cepat berbagai ukuran layar.
3. **Perhatikan Interaksi**: Jangan hanya cek tampilan, tetapi juga pengalaman interaksi (sentuh, klik, dll).
4. **Test Extreme Cases**: Uji pada viewport sangat kecil (320px) dan pada batas transisi (767px-768px).

## Tindak Lanjut
1. Prioritaskan perbaikan masalah "High" terlebih dahulu.
2. Dokumentasikan semua perubahan yang diperlukan.
3. Setelah perbaikan, uji kembali untuk memastikan tidak ada regresi.
4. Update status pada checklist setelah perbaikan untuk pelacakan progres.