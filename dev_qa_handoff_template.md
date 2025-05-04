# Dev → QA Handoff Document: Sistem Rekomendasi Pekerjaan

## Informasi Handoff

**Fitur**: [Nama fitur/task]  
**ID Task**: [Task ID]  
**Assignee**: [Developer Name]  
**Tanggal Handoff**: [Tanggal]  
**QA Assignee**: [QA Engineer Name]  
**Environment**: [Development/Staging]  
**Branch/PR**: [Link ke PR]

## Deskripsi Fitur

[Deskripsi singkat tentang fitur yang diimplementasikan. Jelaskan tujuan fitur dan bagaimana fitur ini seharusnya bekerja dari perspektif user.]

## Perubahan Teknis

[Ringkasan perubahan teknis yang dilakukan, termasuk:]

### Backend Changes
- [Daftar perubahan di backend]
- [API baru atau yang dimodifikasi]
- [Perubahan database]

### Frontend Changes
- [Daftar perubahan di frontend]
- [Komponen baru atau yang dimodifikasi]
- [Perubahan UI/UX]

### Dependensi & Konfigurasi
- [Dependensi baru atau yang diupdate]
- [Perubahan konfigurasi]
- [Environment variables yang diperlukan]

## Test Cases

### Positive Test Cases

| ID | Test Case | Steps | Expected Result | Prerequisite |
|----|-----------|-------|----------------|--------------|
| TC1 | [Nama test case] | 1. [Step 1]<br>2. [Step 2]<br>3. [Step 3] | [Expected result] | [Prerequisite] |
| TC2 | [Nama test case] | 1. [Step 1]<br>2. [Step 2]<br>3. [Step 3] | [Expected result] | [Prerequisite] |

### Negative Test Cases

| ID | Test Case | Steps | Expected Result | Prerequisite |
|----|-----------|-------|----------------|--------------|
| TC3 | [Nama test case] | 1. [Step 1]<br>2. [Step 2]<br>3. [Step 3] | [Expected result] | [Prerequisite] |
| TC4 | [Nama test case] | 1. [Step 1]<br>2. [Step 2]<br>3. [Step 3] | [Expected result] | [Prerequisite] |

### Edge Cases

| ID | Test Case | Steps | Expected Result | Prerequisite |
|----|-----------|-------|----------------|--------------|
| TC5 | [Nama test case] | 1. [Step 1]<br>2. [Step 2]<br>3. [Step 3] | [Expected result] | [Prerequisite] |
| TC6 | [Nama test case] | 1. [Step 1]<br>2. [Step 2]<br>3. [Step 3] | [Expected result] | [Prerequisite] |

## Test Data

[Deskripsi test data yang diperlukan untuk testing. Ini bisa termasuk:]
- User accounts yang diperlukan
- Job data yang diperlukan
- Interaction data yang diperlukan
- Skenario khusus yang perlu disetup

```json
// Contoh format data yang diperlukan
{
  "users": [
    {
      "id": 1001,
      "username": "testuser1",
      "profile": {
        // detail profile
      }
    }
  ],
  "jobs": [
    {
      "id": 2001,
      "title": "Test Job 1",
      // detail job
    }
  ],
  "interactions": [
    {
      "userId": 1001,
      "jobId": 2001,
      "type": "view",
      // detail interaksi
    }
  ]
}
```

## Setup & Environment

### Setup Instructions
1. [Step 1 untuk setup]
2. [Step 2 untuk setup]
3. [Step 3 untuk setup]

### Configuration
- [Konfigurasi yang diperlukan]
- [Environment variables yang perlu diset]

### Database Changes
- [Schema changes yang dilakukan]
- [Migration scripts]
- [Rollback mechanism]

## Known Issues & Limitations

| Issue | Severity | Description | Workaround | Planned Fix |
|-------|----------|-------------|------------|-------------|
| [Issue ID] | [High/Medium/Low] | [Deskripsi issue] | [Workaround jika ada] | [Planned fix timeline] |
| [Issue ID] | [High/Medium/Low] | [Deskripsi issue] | [Workaround jika ada] | [Planned fix timeline] |

## Rollback Plan

[Deskripsi bagaimana melakukan rollback jika diperlukan]

1. [Step 1 rollback]
2. [Step 2 rollback]
3. [Step 3 rollback]

## Monitoring & Logging

### Logs to Watch
- [Path ke log files]
- [Specific log patterns]

### Metrics to Monitor
- [Metrics yang harus dipantau]
- [Dashboard links]

## Additional Resources

- [Link ke dokumentasi teknis]
- [Link ke design specs]
- [Link ke API docs]
- [Link ke Figma/mockups]

## Sign-off

| Role | Name | Status | Date |
|------|------|--------|------|
| Developer | | | |
| QA Engineer | | | |
| Tech Lead | | | |

## QA Feedback

[Bagian ini akan diisi oleh QA setelah testing]

| Feedback | Severity | Status | Resolution |
|----------|----------|--------|------------|
| [Feedback] | [High/Medium/Low] | [Open/Resolved] | [Resolution details] |
| [Feedback] | [High/Medium/Low] | [Open/Resolved] | [Resolution details] |

---

**Notes**:
- Complete all fields relevant to your handoff
- Attach screenshots where relevant
- Include test accounts with credentials
- Ensure QA has all necessary access