import { db } from "../server/db";
import { sql } from "drizzle-orm";

/**
 * Script untuk menambahkan data awal pertanyaan wawancara dan tips wawancara
 */
async function seedInterviewData() {
  console.log("Menambahkan data awal untuk modul Persiapan Wawancara Cerdas...");
  
  // Pertanyaan Wawancara
  const technicalQuestions = [
    {
      question: "Bagaimana Anda menangani konflik dalam tim?",
      answer_guidelines: "Jelaskan pendekatan Anda dalam mendengarkan semua pihak, mencari akar masalah, dan mencari solusi bersama. Berikan contoh konkret dari pengalaman sebelumnya.",
      category: "behavioral",
      difficulty: "intermediate",
      industries: ["teknologi", "keuangan", "pendidikan", "kesehatan"],
      job_roles: ["manager", "team_lead", "hr_specialist"],
      skills_required: ["komunikasi", "manajemen_konflik", "empati"],
      is_verified: true,
      created_by: 1
    },
    {
      question: "Ceritakan pengalaman Anda saat harus bekerja di bawah tekanan dengan tenggat waktu yang ketat.",
      answer_guidelines: "Fokus pada cara Anda mengelola prioritas, tetap tenang, dan menyelesaikan tugas tepat waktu. Berikan contoh situasi spesifik dan hasilnya.",
      category: "behavioral",
      difficulty: "intermediate",
      industries: ["teknologi", "media", "manufaktur"],
      job_roles: ["developer", "project_manager", "designer"],
      skills_required: ["manajemen_waktu", "ketahanan", "fokus"],
      is_verified: true,
      created_by: 1
    },
    {
      question: "Jelaskan perbedaan antara array dan linked list.",
      answer_guidelines: "Jelaskan struktur data keduanya, kompleksitas waktu operasi dasar, dan kasus penggunaan yang sesuai untuk masing-masing.",
      category: "technical",
      difficulty: "intermediate",
      industries: ["teknologi"],
      job_roles: ["developer", "data_scientist", "system_analyst"],
      skills_required: ["algoritma", "struktur_data", "pemrograman"],
      is_verified: true,
      created_by: 1
    },
    {
      question: "Apa yang Anda ketahui tentang perusahaan kami?",
      answer_guidelines: "Tunjukkan riset Anda tentang produk/layanan perusahaan, nilai-nilai, pencapaian baru-baru ini, dan bagaimana Anda bisa berkontribusi.",
      category: "company_specific",
      difficulty: "beginner",
      industries: ["semua"],
      job_roles: ["semua"],
      skills_required: ["riset", "persiapan", "komunikasi"],
      is_verified: true,
      created_by: 1
    },
    {
      question: "Bagaimana Anda menangani feedback negatif?",
      answer_guidelines: "Jelaskan bagaimana Anda menerima kritik secara terbuka, merefleksikannya, dan menggunakannya untuk pengembangan diri.",
      category: "behavioral",
      difficulty: "beginner",
      industries: ["semua"],
      job_roles: ["semua"],
      skills_required: ["self_awareness", "adaptasi", "pembelajaran_berkelanjutan"],
      is_verified: true,
      created_by: 1
    },
    {
      question: "Jelaskan konsep REST API dan berikan contoh penggunaannya.",
      answer_guidelines: "Jelaskan prinsip REST, metode HTTP, format data, dan berikan contoh API yang pernah Anda gunakan atau kembangkan.",
      category: "technical",
      difficulty: "intermediate",
      industries: ["teknologi", "fintech"],
      job_roles: ["developer", "system_analyst", "tech_lead"],
      skills_required: ["web_development", "api_design", "backend"],
      is_verified: true,
      created_by: 1
    },
    {
      question: "Bagaimana pendekatan Anda dalam menyelesaikan masalah kompleks?",
      answer_guidelines: "Uraikan proses langkah-demi-langkah: identifikasi masalah, mengumpulkan informasi, menganalisis opsi, implementasi, dan evaluasi. Berikan contoh kasus nyata.",
      category: "situational",
      difficulty: "intermediate",
      industries: ["semua"],
      job_roles: ["semua"],
      skills_required: ["analytical_thinking", "problem_solving", "pengambilan_keputusan"],
      is_verified: true,
      created_by: 1
    },
    {
      question: "Apa prestasi profesional yang paling Anda banggakan?",
      answer_guidelines: "Pilih pencapaian yang relevan dengan posisi yang dilamar. Jelaskan situasi, tindakan yang Anda ambil, dan hasil spesifik dengan angka jika memungkinkan.",
      category: "general",
      difficulty: "intermediate",
      industries: ["semua"],
      job_roles: ["semua"],
      skills_required: ["komunikasi", "self_awareness", "focus_on_achievement"],
      is_verified: true,
      created_by: 1
    },
    {
      question: "Jelaskan bagaimana Anda mengimplementasikan sistem keamanan dalam aplikasi web.",
      answer_guidelines: "Bahas aspek keamanan seperti autentikasi, otorisasi, enkripsi data, perlindungan terhadap serangan umum (XSS, CSRF, SQL Injection), dan praktik terbaik pengembangan aman.",
      category: "technical",
      difficulty: "advanced",
      industries: ["teknologi", "fintech", "e-commerce"],
      job_roles: ["security_engineer", "backend_developer", "system_architect"],
      skills_required: ["cybersecurity", "web_development", "risk_management"],
      is_verified: true,
      created_by: 1
    },
    {
      question: "Dimana Anda melihat diri Anda 5 tahun ke depan?",
      answer_guidelines: "Tunjukkan aspirasi karir yang realistis dan selaras dengan posisi dan perusahaan. Fokus pada pengembangan keterampilan dan kontribusi yang ingin Anda berikan.",
      category: "general",
      difficulty: "beginner",
      industries: ["semua"],
      job_roles: ["semua"],
      skills_required: ["career_planning", "self_awareness", "goal_setting"],
      is_verified: true,
      created_by: 1
    },
  ];

  // Hapus data lama jika diperlukan (opsional, hati-hati di produksi)
  await db.execute(sql`DELETE FROM interview_questions`);
  await db.execute(sql`DELETE FROM interview_tips`);
  
  // Tambahkan data pertanyaan wawancara
  for (const question of technicalQuestions) {
    // Format array ke tipe PostgreSQL array
    const industries = question.industries ? sql`ARRAY[${sql.join(question.industries, sql`, `)}]` : sql`ARRAY[]::text[]`;
    const jobRoles = question.job_roles ? sql`ARRAY[${sql.join(question.job_roles, sql`, `)}]` : sql`ARRAY[]::text[]`;
    const skillsRequired = question.skills_required ? sql`ARRAY[${sql.join(question.skills_required, sql`, `)}]` : sql`ARRAY[]::text[]`;
    
    await db.execute(sql`
      INSERT INTO interview_questions 
      (question, answer_guidelines, category, difficulty, industries, job_roles, skills_required, is_verified, created_by) 
      VALUES 
      (${question.question}, 
       ${question.answer_guidelines || null}, 
       ${question.category}, 
       ${question.difficulty}, 
       ${industries}, 
       ${jobRoles}, 
       ${skillsRequired}, 
       ${question.is_verified}, 
       ${question.created_by})
    `);
  }
  console.log(`${technicalQuestions.length} pertanyaan wawancara berhasil ditambahkan.`);

  // Data Tips Wawancara
  const interviewTipsData = [
    {
      title: "Riset Perusahaan Sebelum Wawancara",
      content: "Luangkan waktu untuk mempelajari misi, nilai, produk, dan pencapaian baru perusahaan. Tunjukkan pemahaman ini selama wawancara untuk menunjukkan minat Anda yang tulus.",
      category: "preparation",
      difficultyLevel: "beginner",
      targetIndustries: ["semua"],
      targetRoles: ["semua"],
      authorId: 1,
      isActive: true
    },
    {
      title: "Gunakan Metode STAR untuk Menjawab Pertanyaan Perilaku",
      content: "Saat menjawab pertanyaan berbasis pengalaman, gunakan format STAR: Situation (Situasi), Task (Tugas), Action (Tindakan), dan Result (Hasil). Ini membantu memberikan jawaban terstruktur dan komprehensif.",
      category: "behavioral",
      difficultyLevel: "intermediate",
      targetIndustries: ["semua"],
      targetRoles: ["semua"],
      authorId: 1,
      isActive: true
    },
    {
      title: "Persiapkan Pertanyaan untuk Pewawancara",
      content: "Siapkan 3-5 pertanyaan cerdas untuk ditanyakan di akhir wawancara. Ini menunjukkan ketertarikan dan inisiatif Anda. Hindari pertanyaan tentang gaji atau tunjangan di wawancara awal.",
      category: "preparation",
      difficultyLevel: "beginner",
      targetIndustries: ["semua"],
      targetRoles: ["semua"],
      authorId: 1,
      isActive: true
    },
    {
      title: "Berlatih Wawancara Teknis Coding",
      content: "Untuk posisi pengembang, berlatih menyelesaikan masalah coding di papan tulis atau dokumen bersama. Jelaskan pemikiran Anda dengan lantang dan tunjukkan pendekatan analitis Anda.",
      category: "technical",
      difficultyLevel: "advanced",
      targetIndustries: ["teknologi", "fintech", "e-commerce"],
      targetRoles: ["developer", "engineer", "data_scientist"],
      authorId: 1,
      isActive: true
    },
    {
      title: "Kendalikan Bahasa Tubuh Anda",
      content: "Pertahankan kontak mata, duduk tegak, dan gunakan gerakan tangan yang alami. Bahasa tubuh positif menunjukkan kepercayaan diri dan ketulusan.",
      category: "during_interview",
      difficultyLevel: "beginner",
      targetIndustries: ["semua"],
      targetRoles: ["semua"],
      authorId: 1,
      isActive: true
    },
    {
      title: "Strategi Menjawab untuk Kekurangan Pengalaman",
      content: "Jika Anda kurang berpengalaman, fokus pada keterampilan transferable, kemampuan belajar cepat, dan kemauan untuk berkembang. Berikan contoh spesifik dari situasi di mana Anda menguasai keterampilan baru dengan cepat.",
      category: "preparation",
      difficultyLevel: "intermediate",
      targetIndustries: ["semua"],
      targetRoles: ["entry_level", "career_shifter"],
      authorId: 1,
      isActive: true
    },
    {
      title: "Kirim Email Terima Kasih Setelah Wawancara",
      content: "Kirim email terima kasih dalam 24 jam setelah wawancara. Personalisasi dengan merujuk pada poin diskusi spesifik dan tegaskan kembali minat Anda pada posisi tersebut.",
      category: "follow_up",
      difficultyLevel: "beginner",
      targetIndustries: ["semua"],
      targetRoles: ["semua"],
      authorId: 1,
      isActive: true
    },
    {
      title: "Optimalkan Wawancara Video",
      content: "Uji teknologi Anda sebelumnya, pilih latar yang profesional, berpakaian lengkap, dan bicara langsung ke kamera. Tempelkan catatan kecil di sekitar layar Anda jika perlu.",
      category: "remote_interview",
      difficultyLevel: "intermediate",
      targetIndustries: ["semua"],
      targetRoles: ["semua"],
      authorId: 1,
      isActive: true
    },
    {
      title: "Negosiasi Gaji yang Efektif",
      content: "Lakukan riset rentang gaji untuk posisi dan industri Anda. Saat bernegosiasi, fokus pada nilai yang Anda bawa, bukan kebutuhan keuangan pribadi. Pertimbangkan paket kompensasi total, bukan hanya gaji pokok.",
      category: "salary_negotiation",
      difficultyLevel: "advanced",
      targetIndustries: ["semua"],
      targetRoles: ["mid_level", "senior_level", "management"],
      authorId: 1,
      isActive: true
    },
    {
      title: "Menangani Pertanyaan Tentang Kesenjangan Karir",
      content: "Saat ditanya tentang kesenjangan dalam riwayat kerja, jawab dengan jujur namun positif. Fokus pada keterampilan atau perspektif yang Anda kembangkan selama periode tersebut dan bagaimana itu membuat Anda kandidat yang lebih baik.",
      category: "behavioral",
      difficultyLevel: "intermediate",
      targetIndustries: ["semua"],
      targetRoles: ["semua"],
      authorId: 1,
      isActive: true
    }
  ];

  // Tambahkan data tips wawancara
  for (const tip of interviewTipsData) {
    // Format array ke tipe PostgreSQL array
    const targetIndustries = tip.targetIndustries ? sql`ARRAY[${sql.join(tip.targetIndustries, sql`, `)}]` : sql`ARRAY[]::text[]`;
    const targetRoles = tip.targetRoles ? sql`ARRAY[${sql.join(tip.targetRoles, sql`, `)}]` : sql`ARRAY[]::text[]`;
    
    await db.execute(sql`
      INSERT INTO interview_tips 
      (title, content, category, difficulty_level, target_industries, target_roles, author_id, is_active) 
      VALUES 
      (${tip.title}, 
       ${tip.content}, 
       ${tip.category}, 
       ${tip.difficultyLevel}, 
       ${targetIndustries}, 
       ${targetRoles}, 
       ${tip.authorId}, 
       ${tip.isActive})
    `);
  }
  console.log(`${interviewTipsData.length} tips wawancara berhasil ditambahkan.`);

  console.log("Seeding data interview berhasil!");
}

async function main() {
  try {
    await seedInterviewData();
  } catch (error) {
    console.error("Error seeding interview data:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();