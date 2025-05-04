# Template Async Daily Standup - Sistem Rekomendasi Pekerjaan

## Format untuk Slack/Teams/Discord

```
📅 *Daily Update: [Tanggal Hari Ini]*
*Sprint 1 - Hari [X/10]*

👤 *[Nama Anda]*

✅ *Kemarin saya:*
- [Task yang diselesaikan atau progress yang dibuat]
- [Task yang diselesaikan atau progress yang dibuat]
- [Aktivitas lain yang relevan]

🚧 *Hari ini saya akan:*
- [Task yang akan dikerjakan]
- [Task yang akan dikerjakan]
- [Meeting atau aktivitas lain]

🚨 *Blockers / Bantuan yang dibutuhkan:*
- [Deskripsi blocker jika ada] / Tidak ada blocker
- [Bantuan yang dibutuhkan jika ada]

⏱️ *Confidence level untuk task hari ini:* [High/Medium/Low]
```

## Format untuk Email

```
Subject: Daily Standup - [Nama Anda] - [Tanggal]

Hai Tim,

Berikut update harian saya untuk Sprint 1 - Sistem Rekomendasi Pekerjaan:

KEMARIN:
• [Task yang diselesaikan atau progress yang dibuat]
• [Task yang diselesaikan atau progress yang dibuat]
• [Aktivitas lain yang relevan]

HARI INI:
• [Task yang akan dikerjakan]
• [Task yang akan dikerjakan]
• [Meeting atau aktivitas lain]

BLOCKERS / BANTUAN:
• [Deskripsi blocker jika ada] / Tidak ada blocker
• [Bantuan yang dibutuhkan jika ada]

Confidence level: [High/Medium/Low]

Salam,
[Nama Anda]
```

## Contoh Pengisian (Slack/Teams)

```
📅 *Daily Update: 30 April 2025*
*Sprint 1 - Hari 1/10*

👤 *Jane Doe - Backend Developer*

✅ *Kemarin saya:*
- Setup environment development
- Review blueprint sistem rekomendasi
- Persiapan database schema untuk user_job_interactions

🚧 *Hari ini saya akan:*
- Implementasi database schema [REC-1]
- Draft query index optimization
- Meeting sync dengan Data Analyst untuk analytics requirements

🚨 *Blockers / Bantuan yang dibutuhkan:*
- Membutuhkan akses production database untuk performance benchmarking
- Butuh input dari tim product terkait retention period untuk interaction data

⏱️ *Confidence level untuk task hari ini:* High
```

## Format untuk Async Standup Bot

Jika menggunakan bot standup seperti Geekbot, Standuply, atau sejenisnya, siapkan pertanyaan berikut:

1. Apa yang sudah kamu selesaikan sejak update terakhir?
2. Apa yang akan kamu kerjakan hari ini?
3. Apakah ada blocker atau bantuan yang kamu butuhkan?
4. Seberapa yakin kamu bisa menyelesaikan task hari ini? (High/Medium/Low)

## Panduan Penggunaan

### Waktu Posting
- Post update Anda sebelum [jam tertentu, misal 10:00 WIB] setiap hari kerja
- Untuk anggota tim yang bekerja berbeda zona waktu, post di awal hari kerja Anda

### Praktik Terbaik
1. **Spesifik dan Ringkas**
   - Berikan detail spesifik task dan progress yang dibuat
   - Gunakan bullet point untuk kemudahan membaca
   - Sertakan ID task [REC-XX] jika relevan

2. **Fokus pada Deliverables**
   - Jelaskan apa yang sudah/akan diselesaikan, bukan aktivitas
   - Misalnya "Implementasi API endpoint untuk interaction tracking" bukan "Bekerja pada API"

3. **Transparansi Blocker**
   - Ungkapkan blocker dengan jelas dan spesifik
   - Jika membutuhkan bantuan, tag orang spesifik yang bisa membantu
   - Update blocker yang sudah diselesaikan dari hari sebelumnya

4. **Review Updates Tim**
   - Luangkan 5-10 menit untuk membaca update anggota tim lain
   - Berikan bantuan jika Anda bisa menyelesaikan blocker tim lain

### Response Protocol
- Tim diharapkan merespon blocker atau permintaan bantuan dalam waktu 4 jam kerja
- Gunakan thread untuk diskusi detail agar tidak membanjiri channel utama
- Tech Lead/PM akan mengidentifikasi dan mengeskalasiissue yang memerlukan diskusi sync

---

### Standup Analytics (untuk Project Manager/Tech Lead)

Untuk melacak efektivitas standup, PM/Tech Lead dapat menggunakan template berikut di akhir minggu:

```
# Standup Analytics Mingguan

## Compliance
- Daily updates submitted: [X/Y team members]
- Average submission time: [time]

## Blockers
- Total blockers reported: [number]
- Blockers resolved: [number] ([percentage]%)
- Average resolution time: [duration]

## Common Themes
- [Theme 1]: [brief description]
- [Theme 2]: [brief description]

## Action Items for Next Week
- [Action 1]
- [Action 2]
```

---

*Catatan: Template ini dapat digunakan untuk daily standup dalam format asynchronous. Sesuaikan dengan kebutuhan tim dan tool yang digunakan.*