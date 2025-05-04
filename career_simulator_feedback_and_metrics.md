# Feedback Loop & Metrics Dashboard - Career Simulator

## Feedback Loop Design

### In-App Feedback Collection

#### 1. Micro Feedback Touchpoints
- **Rating Prompt**: Setelah membuat/mengedit skenario, tampilkan prompt singkat:
  ```
  "Seberapa bermanfaat skenario ini untuk perencanaan karir Anda?"
  [1] [2] [3] [4] [5]
  ```

- **Insight Value Feedback**: Saat menampilkan skill gap insight:
  ```
  "Apakah insight ini membantu Anda?"
  [👍 Ya] [👎 Tidak] [💡 Bisa Lebih Baik]
  ```

- **Kontekstual Exit Survey**: Jika pengguna meninggalkan halaman simulator tanpa menyelesaikan:
  ```
  "Kami perhatikan Anda belum menyelesaikan skenario. Apa yang bisa kami tingkatkan?"
  [🔄 Terlalu kompleks] [❓ Tidak jelas] [⏱️ Tidak punya waktu] [🙂 Hanya menjelajah]
  ```

#### 2. Detailed Feedback Form
Dapat diakses melalui tombol "Berikan Saran" di footer simulator:

```
- Bagian apa dari Simulator Karir yang paling berguna bagi Anda?
  [Dropdown: Timeline Visual, Skill Gap Analysis, Rekomendasi, Perbandingan Skenario]

- Apakah hasil dari simulator cukup realistis dengan kondisi pasar kerja?
  [Skala 1-5]

- Apa yang Anda lakukan setelah menggunakan simulator?
  [Checkboxes: Mencari lowongan terkait, Mengembangkan skill baru, Mencari pendidikan/sertifikasi, Diskusi dengan mentor, dll]

- Saran untuk meningkatkan simulator:
  [Text area]
```

### Feedback Analysis & Action

#### 1. Aggregation Dashboard

Semua feedback dikompilasi dalam dashboard internal dengan format:

```
- Overall Satisfaction Score: 4.2/5
- Top Positive Points: [Timeline visual (65%), Skill insight (58%), Rekomendasi pekerjaan (42%)]
- Top Pain Points: [Kompleksitas (35%), Kurang data industri spesifik (28%), Outcome calculation (15%)]
- Feature Request Trends: [More industries (45%), Custom timeline (22%), Mentor connection (18%)]
```

#### 2. Action Framework

Matriks prioritas untuk feedback:

| Effort | Impact | Action | Timeline |
|--------|--------|--------|----------|
| Low | High | Implement Immediately | < 1 week |
| High | High | Plan for next sprint | 2-3 weeks |
| Low | Low | Nice-to-have backlog | Variable |
| High | Low | Consider alternatives | Evaluate quarterly |

#### 3. Feedback Loop Closure

- **User Follow-up**: Notifikasi pengguna ketika saran mereka diimplementasikan:
  ```
  "Berdasarkan saran Anda, kami telah menambahkan industri Kesehatan ke dalam simulator. Cek sekarang!"
  ```

- **Changelog Public**: Ringkasan perubahan yang didorong user feedback:
  ```
  Diperbarui 28 April 2025:
  - Penambahan 5 industri baru (berdasarkan 45+ user requests)
  - Penyederhanaan proses pembuatan skenario (berdasarkan feedback kompleksitas)
  - Peningkatan akurasi skill gap analysis (hasil survey kepuasan)
  ```

## Metric Dashboard Design

### Key Performance Indicators (KPIs)

#### 1. User Engagement Metrics

| Metrik | Definisi | Target | Visualisasi |
|--------|----------|--------|-------------|
| Monthly Active Users | Jumlah pengguna unik yang menggunakan simulator per bulan | 25% dari total jobseekers | Line Chart (trend) |
| Time on Feature | Rata-rata waktu yang dihabiskan dalam simulator | > 5 menit | Bar Chart (segmented by user type) |
| Completion Rate | % pengguna yang menyelesaikan pembuatan skenario | 40% | Funnel Chart (started → completed) |
| Return Rate | % pengguna yang kembali ke simulator dalam 7 hari | 30% | Cohort Analysis Table |

#### 2. Feature Usage Metrics

| Metrik | Definisi | Target | Visualisasi |
|--------|----------|--------|-------------|
| Scenarios per User | Rata-rata jumlah skenario per pengguna | 2.5 | Histogram |
| Most Used Components | Komponen yang paling sering digunakan | - | Treemap |
| Decision Points Added | Rata-rata jumlah decision points per skenario | 4+ | Bar Chart |
| Comparison Rate | % skenario yang dibandingkan dengan skenario lain | 25% | Line + Area Chart |

#### 3. Business Impact Metrics

| Metrik | Definisi | Target | Visualisasi |
|--------|----------|--------|-------------|
| Job View CTR | % klik ke lowongan dari simulator | 15% | Line Chart (trend) |
| Application Rate | % aplikasi kerja dari simulator vs. jalur lain | +30% | Comparison Bar Chart |
| Skill Development Activation | % pengguna yang mencari kursus dari skill gap | 20% | Funnel Chart |
| User Retention Impact | Retensi pengguna simulator vs. non-pengguna | +25% | Survival Analysis Curve |

### Dashboard Layout

```
+------------------------------------------+----------------------------------+
|                                          |                                  |
|  [Usage Overview]                        |  [User Satisfaction]             |
|  - MAU, Time on Feature,                 |  - Feedback scores               |
|  - Completion Rate                       |  - Insight value ratings         |
|                                          |  - NPS for simulator             |
+------------------------------------------+----------------------------------+
|                                          |                                  |
|  [Simulation Activity]                   |  [Business Impact]               |
|  - Scenarios created (daily/weekly)      |  - Job view conversions          |
|  - Simulations completed                 |  - Application from simulator    |
|  - Feature usage heatmap                 |  - Retention impact              |
|                                          |                                  |
+------------------------------------------+----------------------------------+
|                                                                             |
|  [User Journey Funnel]                                                      |
|  Visitor → Scenario Creation → Decision Points → Completion → Share/Save    |
|                                                                             |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [Segment Analysis]                                                         |
|  - Usage by job level                    - Usage by industry                |
|  - Performance by user cohort            - Engagement by device             |
|                                                                             |
+-----------------------------------------------------------------------------+
```

### Real-time Monitoring

**Alert Rules:**
- Drop > 20% dalam engagement harian
- Completion rate turun di bawah 25%
- Waktu loading simulator > 3 detik
- Error rate > 2% dalam komponen timeline atau perbandingan

**Monitoring Dashboard:**
- Endpoint health & performance
- Client-side errors (JavaScript)
- API response times
- User session recordings untuk debugging

## Implementation Plan

### Phase 1: Basic Metrics & Feedback (Week 1)
- Implementasi event tracking dasar
- Setup dashboard template
- Tambahkan micro feedback touchpoints

### Phase 2: Enhanced Analytics (Week 2)
- Funnel analysis
- Segment breakdown
- A/B test measurement capability

### Phase 3: Advanced Insights (Week 3)
- Predictive metrics (user likelihood to complete)
- Correlation analysis (simulator use vs job application success)
- Automated insight generation