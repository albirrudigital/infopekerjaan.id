# REALTIME SPRINT TRACKING DASHBOARD

*Template siap implementasi untuk Google Sheets atau Notion*

## 🚨 PANDUAN IMPLEMENTASI

1. **Google Sheets:** Salin struktur ini ke spreadsheet baru, tambahkan formula untuk kalkulasi otomatis
2. **Notion:** Gunakan sebagai template untuk database dengan relasi antar tabel
3. **Customization:** Sesuaikan status, kategori, dan kalkulasi sesuai kebutuhan tim

## 📊 STRUKTUR DASHBOARD

### TAB 1: SPRINT OVERVIEW

```
+----------------------------------------------------------------------------------+
| CAREER INTELLIGENCE DASHBOARD - SPRINT 1                                         |
| Status: ACTIVE | Timeline: DD/MM - DD/MM | Days Remaining: XX                    |
+----------------------------------------------------------------------------------+
|                                                                                  |
| PROGRESS SUMMARY                       | BLOCKER SUMMARY                         |
| ✅ Completed: XX tasks (XX%)           | 🔴 Critical: X                          |
| 🔄 In Progress: XX tasks (XX%)         | 🟠 High: X                              |
| ⏸️ Blocked: XX tasks (XX%)             | 🟡 Medium: X                            |
| ⏳ Not Started: XX tasks (XX%)         | Total: X                                |
|                                        |                                         |
+----------------------------------------------------------------------------------+
|                                                                                  |
| EPIC STATUS                            | DAILY BURNDOWN                          |
| Dashboard Foundation: XX% complete     | [Visualisasi chart sederhana]           |
| Timeline Basic: XX% complete           | Ideal: XX points                        |
| Data Integration: XX% complete         | Actual: XX points                       |
|                                        | Variance: +/- XX points                 |
|                                        |                                         |
+----------------------------------------------------------------------------------+
|                                                                                  |
| TODAY'S FOCUS                          | RISK RADAR                              |
| 1. [Task 1 dengan prioritas tertinggi] | 🔴 [Risk 1 - kritikalitas tinggi]       |
| 2. [Task 2 dengan prioritas tinggi]    | 🟠 [Risk 2 - kritikalitas medium]       |
| 3. [Task 3 dengan prioritas tinggi]    | 🟡 [Risk 3 - kritikalitas rendah]       |
|                                        |                                         |
+----------------------------------------------------------------------------------+
```

### TAB 2: KANBAN TASK TRACKER

```
+-------+---------------------+---------------------+---------------------+---------------------+
| EPIC  |     TO DO 📋       |   IN PROGRESS 🔄    |     BLOCKED ⚠️      |     DONE ✅         |
+-------+---------------------+---------------------+---------------------+---------------------+
|       | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  |
|       | [Owner]             | [Owner]             | [Owner]             | [Owner]             |
|       | [Estimasi] pts      | [Estimasi] pts      | [Estimasi] pts      | [Estimasi] pts      |
| EPIC  | [Priority]          | [Progress %]         | [Blocker desc]      | [Actual time]       |
|   1   | [Due date]          | [Due date]          | [Due date]          | [Completion date]   |
|       |                     |                     |                     |                     |
|       | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  |
|       | ...                 | ...                 | ...                 | ...                 |
+-------+---------------------+---------------------+---------------------+---------------------+
|       | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  |
|       | [Owner]             | [Owner]             | [Owner]             | [Owner]             |
|       | [Estimasi] pts      | [Estimasi] pts      | [Estimasi] pts      | [Estimasi] pts      |
| EPIC  | [Priority]          | [Progress %]         | [Blocker desc]      | [Actual time]       |
|   2   | [Due date]          | [Due date]          | [Due date]          | [Completion date]   |
|       |                     |                     |                     |                     |
|       | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  |
|       | ...                 | ...                 | ...                 | ...                 |
+-------+---------------------+---------------------+---------------------+---------------------+
|       | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  |
|       | [Owner]             | [Owner]             | [Owner]             | [Owner]             |
|       | [Estimasi] pts      | [Estimasi] pts      | [Estimasi] pts      | [Estimasi] pts      |
| EPIC  | [Priority]          | [Progress %]         | [Blocker desc]      | [Actual time]       |
|   3   | [Due date]          | [Due date]          | [Due date]          | [Completion date]   |
|       |                     |                     |                     |                     |
|       | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  | [Task ID] - [Nama]  |
|       | ...                 | ...                 | ...                 | ...                 |
+-------+---------------------+---------------------+---------------------+---------------------+
```

### TAB 3: DAILY TASK TRACKER

```
+---------------------------------------------------------------------------------------------+
| DAY 1: [DD/MM/YYYY]                                                                         |
+---------------------------------------------------------------------------------------------+
| PLANNED                                  | ACTUAL                                           |
+---------------------------------------------------------------------------------------------+
| [Task 1] - [Estimasi]                    | ✓ Completed - [Actual time]                      |
| [Owner]                                  | Notes: [Implementation notes]                    |
+---------------------------------------------------------------------------------------------+
| [Task 2] - [Estimasi]                    | ⚠️ Blocked - [Blocker reason]                    |
| [Owner]                                  | Action: [Next steps]                             |
+---------------------------------------------------------------------------------------------+
| [Task 3] - [Estimasi]                    | 🔄 XX% Complete                                  |
| [Owner]                                  | Carry over to Day 2                              |
+---------------------------------------------------------------------------------------------+
| DAILY SUMMARY                                                                               |
| Tasks Completed: X/Y                     | Story Points Completed: X/Y                      |
| New Issues/Risks: [Brief description]                                                       |
| Wins: [Brief description]                                                                   |
+---------------------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------------------+
| DAY 2: [DD/MM/YYYY]                                                                         |
+---------------------------------------------------------------------------------------------+
| ... same structure, repeating for all sprint days ...                                       |
+---------------------------------------------------------------------------------------------+
```

### TAB 4: TEAM CAPACITY & LOAD BALANCING

```
+----------------------------------------------------------------------------------+
| TEAM MEMBER ALLOCATION & CAPACITY                                                |
+----------------------------------------------------------------------------------+
| Team Member | Role           | Total Points | Allocated | Completed | Remaining  |
+----------------------------------------------------------------------------------+
| [Name 1]    | [Role]         | [X] pts      | [Y] pts   | [Z] pts   | [X-Z] pts  |
| [Name 2]    | [Role]         | [X] pts      | [Y] pts   | [Z] pts   | [X-Z] pts  |
| [Name 3]    | [Role]         | [X] pts      | [Y] pts   | [Z] pts   | [X-Z] pts  |
| ...                                                                              |
+----------------------------------------------------------------------------------+
| CAPACITY ALERTS                                                                  |
+----------------------------------------------------------------------------------+
| 🔴 OVERALLOCATED: [Name 4] - [X] points over capacity                            |
| 🟠 AT RISK: [Name 5] - [Y] points behind schedule                                |
| 🟢 AVAILABLE: [Name 6] - [Z] additional points capacity                          |
+----------------------------------------------------------------------------------+
```

### TAB 5: RISK & BLOCKER TRACKING

```
+---------------------------------------------------------------------------------------------------------------+
| ACTIVE BLOCKERS                                                                                               |
+---------------------------------------------------------------------------------------------------------------+
| ID    | Description         | Affects          | Owner     | Opened      | Target      | Status      | Impact  |
+---------------------------------------------------------------------------------------------------------------+
| BL001 | [Description]       | [Tasks affected] | [Name]    | [Date]      | [Date]      | [Status]    | [H/M/L] |
| BL002 | [Description]       | [Tasks affected] | [Name]    | [Date]      | [Date]      | [Status]    | [H/M/L] |
| ...                                                                                                           |
+---------------------------------------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------------------------------------+
| RISK REGISTER                                                                                                 |
+---------------------------------------------------------------------------------------------------------------+
| ID    | Description         | Impact           | Likelihood | Mitigation          | Owner     | Status      |
+---------------------------------------------------------------------------------------------------------------+
| RK001 | [Description]       | [H/M/L]         | [H/M/L]    | [Action plan]       | [Name]    | [Status]    |
| RK002 | [Description]       | [H/M/L]         | [H/M/L]    | [Action plan]       | [Name]    | [Status]    |
| ...                                                                                                           |
+---------------------------------------------------------------------------------------------------------------+
```

### TAB 6: ESTIMASI VS AKTUAL TRACKING

```
+----------------------------------------------------------------------------------------+
| ESTIMATION ACCURACY                                                                    |
+----------------------------------------------------------------------------------------+
| Epic     | Task Category        | Estimated | Actual  | Variance  | Accuracy | Trend   |
+----------------------------------------------------------------------------------------+
| Epic 1   | Backend DB           | [X] pts   | [Y] pts | [Z]%      | [Status] | [↑↓→]   |
| Epic 1   | Backend Services     | [X] pts   | [Y] pts | [Z]%      | [Status] | [↑↓→]   |
| Epic 1   | Frontend Components  | [X] pts   | [Y] pts | [Z]%      | [Status] | [↑↓→]   |
| Epic 2   | Backend              | [X] pts   | [Y] pts | [Z]%      | [Status] | [↑↓→]   |
| Epic 2   | Frontend             | [X] pts   | [Y] pts | [Z]%      | [Status] | [↑↓→]   |
| ...                                                                                    |
+----------------------------------------------------------------------------------------+
| INSIGHTS & ADJUSTMENTS                                                                 |
| • [Insight 1 tentang estimasi]                                                         |
| • [Insight 2 tentang estimasi]                                                         |
| • [Rekomendasi adjustment untuk sprint berikutnya]                                     |
+----------------------------------------------------------------------------------------+
```

## 📱 IMPLEMENTASI MOBILE VIEW

### Google Sheets Mobile View
- Tambahkan tab "Daily Quick View" yang dioptimalkan untuk tampilan mobile
- Gunakan cell formatting sederhana dan hindari merged cells yang bisa rusak di mobile
- Tambahkan filter dan dropdown untuk navigasi cepat

### Notion Mobile View
- Gunakan komponen yang responsive di mobile
- Buat tampilan terpisah yang dioptimasi untuk mobile dengan properti terbatas
- Fokuskan pada elemen yang paling sering diakses: task status, blockers, dan daily todos

## 🔄 AUTOMATION IDEAS

### Google Sheets
- Gunakan Apps Script untuk:
  - Notifikasi otomatis untuk task overdue
  - Color coding otomatis berdasarkan status
  - Grafik burndown yang update otomatis
  - Daily summary yang dikirim via email

### Notion
- Gunakan Automation untuk:
  - Update status otomatis berdasarkan tanggal
  - Notifikasi saat task status berubah
  - Weekly report generation
  - Integration dengan Slack/Teams untuk notifikasi

## 🔔 DAILY NOTIFICATIONS TEMPLATE

```
📊 SPRINT 1 - DAY X SUMMARY
[DD/MM/YYYY]

✅ COMPLETED TODAY:
- [Task 1] by [Owner]
- [Task 2] by [Owner]

🔄 IN PROGRESS:
- [Task 3] - [XX]% complete by [Owner]
- [Task 4] - [XX]% complete by [Owner]

⚠️ BLOCKERS:
- [Blocker description] - Affects [Task ID] - Owned by [Name]

🎯 FOCUS FOR TOMORROW:
1. [Priority task 1]
2. [Priority task 2]
3. [Priority task 3]

📈 SPRINT HEALTH: [GOOD/NEEDS ATTENTION/AT RISK]
[Brief explanation if needed]
```

## 💡 TIPS UNTUK PENGGUNAAN EFEKTIF

1. **Update secara real-time:** Idealnya dashboard diupdate setidaknya 2x sehari (pagi dan sore)
2. **Visual indicators:** Gunakan conditional formatting untuk highlight secara visual
3. **Keep it simple:** Fokus pada metrik yang benar-benar dibutuhkan tim
4. **Accessibility:** Pastikan semua anggota tim memiliki akses dan tahu cara menggunakannya
5. **Regular reviews:** Jadwalkan 5-10 menit setiap hari untuk review dashboard bersama tim
6. **Evolve as needed:** Sesuaikan dashboard berdasarkan feedback tim selama sprint berlangsung

---

*Template ini siap untuk dicustomize sesuai kebutuhan spesifik tim InfoPekerjaan.id dan dapat diimplementasikan baik di Google Sheets maupun Notion.*