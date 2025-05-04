import { db } from "../server/db";
import { profileCompletionItems, userProfileCompletions } from "../shared/schema";
import { eq } from "drizzle-orm";

async function seedProfileCompletionItems() {
  console.log("Seeding profile completion items...");

  // First, check if items already exist
  const existingItems = await db.select().from(profileCompletionItems);
  if (existingItems.length > 0) {
    console.log(`Found ${existingItems.length} existing items. Skipping seeding.`);
    return;
  }

  // Items for jobseekers
  const jobseekerItems = [
    // Basic Info
    {
      name: "Foto Profil",
      description: "Tambahkan foto profil profesional untuk identitas visual Anda",
      pointValue: 15,
      category: "basic_info",
      userType: "jobseeker",
      isRequired: true,
      displayOrder: 1,
      iconName: "image",
    },
    {
      name: "Data Pribadi Dasar",
      description: "Lengkapi nama, tanggal lahir, jenis kelamin dan informasi dasar lainnya",
      pointValue: 10,
      category: "basic_info",
      userType: "jobseeker",
      isRequired: true,
      displayOrder: 2,
      iconName: "user",
    },
    {
      name: "Informasi Kontak",
      description: "Tambahkan email dan nomor telepon yang aktif untuk dihubungi",
      pointValue: 15,
      category: "basic_info",
      userType: "jobseeker",
      isRequired: true,
      displayOrder: 3,
      iconName: "phone",
    },
    {
      name: "Lokasi & Alamat",
      description: "Tentukan lokasi dan alamat tempat tinggal Anda saat ini",
      pointValue: 10,
      category: "basic_info",
      userType: "jobseeker",
      isRequired: true,
      displayOrder: 4,
      iconName: "location",
    },

    // Professional Info
    {
      name: "Ringkasan Profil",
      description: "Tambahkan ringkasan profesional singkat tentang diri Anda",
      pointValue: 20,
      category: "professional_info",
      userType: "jobseeker",
      isRequired: true,
      displayOrder: 5,
      iconName: "file",
    },
    {
      name: "Pengalaman Kerja",
      description: "Tambahkan minimal 1 pengalaman kerja Anda sebelumnya",
      pointValue: 25,
      category: "professional_info",
      userType: "jobseeker",
      isRequired: true,
      displayOrder: 6,
      iconName: "briefcase",
    },
    {
      name: "Riwayat Pendidikan",
      description: "Tambahkan riwayat pendidikan formal Anda",
      pointValue: 20,
      category: "professional_info",
      userType: "jobseeker",
      isRequired: true,
      displayOrder: 7,
      iconName: "education",
    },
    {
      name: "Keahlian",
      description: "Tambahkan minimal 3 keahlian utama yang Anda miliki",
      pointValue: 15,
      category: "professional_info",
      userType: "jobseeker",
      isRequired: true,
      displayOrder: 8,
      iconName: "award",
    },
    {
      name: "Bahasa",
      description: "Tambahkan bahasa yang Anda kuasai beserta tingkat kemampuannya",
      pointValue: 10,
      category: "professional_info",
      userType: "jobseeker",
      isRequired: false,
      displayOrder: 9,
      iconName: "file",
    },

    // Documents
    {
      name: "Unggah CV",
      description: "Unggah CV terbaru Anda dalam format PDF",
      pointValue: 30,
      category: "documents",
      userType: "jobseeker",
      isRequired: true,
      displayOrder: 10,
      iconName: "file",
    },
    {
      name: "Unggah Portfolio",
      description: "Unggah portfolio atau contoh hasil pekerjaan Anda (opsional)",
      pointValue: 15,
      category: "documents",
      userType: "jobseeker",
      isRequired: false,
      displayOrder: 11,
      iconName: "briefcase",
    },
    {
      name: "Sertifikasi",
      description: "Tambahkan sertifikasi profesional yang Anda miliki",
      pointValue: 20,
      category: "documents",
      userType: "jobseeker",
      isRequired: false,
      displayOrder: 12,
      iconName: "award",
    },

    // Preferences
    {
      name: "Preferensi Pekerjaan",
      description: "Tentukan jenis pekerjaan dan industri yang Anda minati",
      pointValue: 15,
      category: "preferences",
      userType: "jobseeker",
      isRequired: true,
      displayOrder: 13,
      iconName: "settings",
    },
    {
      name: "Ekspektasi Gaji",
      description: "Tetapkan kisaran gaji yang Anda harapkan",
      pointValue: 10,
      category: "preferences",
      userType: "jobseeker",
      isRequired: false,
      displayOrder: 14,
      iconName: "briefcase",
    },
    {
      name: "Ketersediaan",
      description: "Tentukan kapan Anda dapat mulai bekerja",
      pointValue: 10,
      category: "preferences",
      userType: "jobseeker",
      isRequired: false,
      displayOrder: 15,
      iconName: "time",
    },

    // Verification
    {
      name: "Verifikasi Email",
      description: "Verifikasi alamat email Anda untuk keamanan akun",
      pointValue: 15,
      category: "verification",
      userType: "jobseeker",
      isRequired: true,
      displayOrder: 16,
      iconName: "email",
    },
    {
      name: "Verifikasi Nomor Telepon",
      description: "Verifikasi nomor telepon Anda untuk meningkatkan keamanan",
      pointValue: 15,
      category: "verification",
      userType: "jobseeker",
      isRequired: false,
      displayOrder: 17,
      iconName: "phone",
    },
    {
      name: "Identitas KTP",
      description: "Verifikasi identitas dengan mengunggah KTP Anda",
      pointValue: 25,
      category: "verification",
      userType: "jobseeker",
      isRequired: false,
      displayOrder: 18,
      iconName: "shield",
    },
    {
      name: "Koneksi Media Sosial",
      description: "Hubungkan akun LinkedIn atau media sosial profesional Anda",
      pointValue: 10,
      category: "verification",
      userType: "jobseeker",
      isRequired: false,
      displayOrder: 19,
      iconName: "user",
    },
  ];

  // Items for employers
  const employerItems = [
    // Basic Info
    {
      name: "Logo Perusahaan",
      description: "Unggah logo perusahaan untuk identitas visual",
      pointValue: 15,
      category: "basic_info",
      userType: "employer",
      isRequired: true,
      displayOrder: 1,
      iconName: "image",
    },
    {
      name: "Profil Perusahaan",
      description: "Lengkapi nama, industri, dan ukuran perusahaan",
      pointValue: 20,
      category: "basic_info",
      userType: "employer",
      isRequired: true,
      displayOrder: 2,
      iconName: "briefcase",
    },
    {
      name: "Informasi Kontak Bisnis",
      description: "Tambahkan kontak bisnis untuk komunikasi",
      pointValue: 15,
      category: "basic_info",
      userType: "employer",
      isRequired: true,
      displayOrder: 3,
      iconName: "phone",
    },
    {
      name: "Alamat Kantor",
      description: "Tambahkan alamat fisik kantor perusahaan",
      pointValue: 10,
      category: "basic_info",
      userType: "employer",
      isRequired: true,
      displayOrder: 4,
      iconName: "location",
    },

    // Professional Info
    {
      name: "Deskripsi Perusahaan",
      description: "Tambahkan deskripsi lengkap tentang perusahaan Anda",
      pointValue: 25,
      category: "professional_info",
      userType: "employer",
      isRequired: true,
      displayOrder: 5,
      iconName: "file",
    },
    {
      name: "Visi & Misi",
      description: "Jelaskan visi dan misi perusahaan Anda",
      pointValue: 15,
      category: "professional_info",
      userType: "employer",
      isRequired: false,
      displayOrder: 6,
      iconName: "award",
    },
    {
      name: "Budaya Perusahaan",
      description: "Jelaskan nilai-nilai dan budaya kerja di perusahaan Anda",
      pointValue: 15,
      category: "professional_info",
      userType: "employer",
      isRequired: false,
      displayOrder: 7,
      iconName: "briefcase",
    },
    {
      name: "Website & Media Sosial",
      description: "Tambahkan website dan akun media sosial perusahaan",
      pointValue: 10,
      category: "professional_info",
      userType: "employer",
      isRequired: true,
      displayOrder: 8,
      iconName: "user",
    },

    // Documents
    {
      name: "Unggah Profil Perusahaan",
      description: "Unggah dokumen company profile dalam format PDF",
      pointValue: 20,
      category: "documents",
      userType: "employer",
      isRequired: false,
      displayOrder: 9,
      iconName: "file",
    },
    {
      name: "Foto Perusahaan",
      description: "Unggah minimal 3 foto lingkungan kerja di perusahaan",
      pointValue: 15,
      category: "documents",
      userType: "employer",
      isRequired: false,
      displayOrder: 10,
      iconName: "image",
    },
    {
      name: "Video Perusahaan",
      description: "Unggah video pendek tentang perusahaan Anda (opsional)",
      pointValue: 20,
      category: "documents",
      userType: "employer",
      isRequired: false,
      displayOrder: 11,
      iconName: "image",
    },

    // Verification
    {
      name: "Verifikasi Email Bisnis",
      description: "Verifikasi dengan email domain perusahaan Anda",
      pointValue: 15,
      category: "verification",
      userType: "employer",
      isRequired: true,
      displayOrder: 12,
      iconName: "email",
    },
    {
      name: "Verifikasi Telepon Bisnis",
      description: "Verifikasi nomor telepon bisnis untuk meningkatkan keamanan",
      pointValue: 15,
      category: "verification",
      userType: "employer",
      isRequired: false,
      displayOrder: 13,
      iconName: "phone",
    },
    {
      name: "Dokumen Legal",
      description: "Unggah dokumen pendirian perusahaan atau SIUP",
      pointValue: 30,
      category: "verification",
      userType: "employer",
      isRequired: false,
      displayOrder: 14,
      iconName: "shield",
    },
    {
      name: "NPWP Perusahaan",
      description: "Verifikasi NPWP perusahaan untuk keperluan finansial",
      pointValue: 25,
      category: "verification",
      userType: "employer",
      isRequired: false,
      displayOrder: 15,
      iconName: "shield",
    },
  ];

  // Combine all items
  const allItems = [...jobseekerItems, ...employerItems];

  try {
    // Insert all profile completion items
    const insertedItems = await db.insert(profileCompletionItems).values(allItems).returning();
    console.log(`Successfully inserted ${insertedItems.length} profile completion items`);
    
    return insertedItems;
  } catch (error) {
    console.error("Error seeding profile completion items:", error);
    throw error;
  }
}

async function resetProfileCompletionItems() {
  console.log("Resetting profile completion items...");
  
  try {
    // Delete all existing user profile completions first
    await db.delete(userProfileCompletions);
    
    // Delete all existing profile completion items
    await db.delete(profileCompletionItems);
    
    console.log("Successfully deleted all profile completion data");
  } catch (error) {
    console.error("Error resetting profile completion data:", error);
    throw error;
  }
}

async function main() {
  const shouldReset = process.argv.includes("--reset");
  
  if (shouldReset) {
    await resetProfileCompletionItems();
  }
  
  await seedProfileCompletionItems();
  process.exit(0);
}

main().catch(error => {
  console.error("Error in seed script:", error);
  process.exit(1);
});