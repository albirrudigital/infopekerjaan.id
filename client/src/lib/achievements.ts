import type { AchievementBadgeProps } from "@/components/achievements/achievement-badge";

// Kategori pencapaian
export const ACHIEVEMENT_CATEGORIES = {
  PROFILE: 'profile',
  APPLICATIONS: 'applications', 
  JOBS: 'jobs',
  ENGAGEMENT: 'engagement',
  SKILLS: 'skills',
  SPECIAL: 'special',
};

// Definisi pencapaian untuk pencari kerja
export const JOBSEEKER_ACHIEVEMENTS: AchievementBadgeProps[] = [
  // Kategori Profile
  {
    id: 'profile-complete-basic',
    name: 'Profil Dasar',
    description: 'Melengkapi informasi dasar profil pencari kerja',
    icon: 'user',
    level: 'bronze',
    unlocked: false,
  },
  {
    id: 'profile-complete-full',
    name: 'Profil Lengkap',
    description: 'Melengkapi 100% informasi profil pencari kerja',
    icon: 'user',
    level: 'silver',
    unlocked: false,
  },
  {
    id: 'profile-add-photo',
    name: 'Foto Profesional',
    description: 'Menambahkan foto profil profesional',
    icon: 'image',
    level: 'bronze',
    unlocked: false,
  },
  {
    id: 'profile-add-resume',
    name: 'CV Siap Kirim',
    description: 'Mengunggah CV terbaru',
    icon: 'file',
    level: 'bronze',
    unlocked: false,
  },
  {
    id: 'profile-add-education',
    name: 'Latar Belakang Pendidikan',
    description: 'Menambahkan informasi pendidikan ke profil',
    icon: 'graduation',
    level: 'bronze',
    unlocked: false,
  },
  {
    id: 'profile-add-experience',
    name: 'Pengalaman Kerja',
    description: 'Menambahkan pengalaman kerja ke profil',
    icon: 'briefcase',
    level: 'bronze',
    unlocked: false,
  },
  {
    id: 'profile-add-skills',
    name: 'Spesialis Keahlian',
    description: 'Menambahkan minimal 5 keahlian ke profil',
    icon: 'star',
    level: 'bronze',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'profile-verified',
    name: 'Identitas Terverifikasi',
    description: 'Memverifikasi identitas melalui email dan telepon',
    icon: 'check',
    level: 'silver',
    unlocked: false,
  },
  
  // Kategori Aplikasi/Lamaran
  {
    id: 'applications-first',
    name: 'Langkah Pertama',
    description: 'Mengirim lamaran pertama',
    icon: 'briefcase',
    level: 'bronze',
    unlocked: false,
  },
  {
    id: 'applications-10',
    name: 'Pencari Aktif',
    description: 'Mengirim 10 lamaran',
    icon: 'briefcase',
    level: 'silver', 
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'applications-50',
    name: 'Pemburu Karir',
    description: 'Mengirim 50 lamaran',
    icon: 'briefcase',
    level: 'gold',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'applications-100',
    name: 'Pencari Profesional',
    description: 'Mengirim 100 lamaran',
    icon: 'briefcase',
    level: 'platinum',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'applications-get-interview',
    name: 'Wawancara Pertama',
    description: 'Mendapatkan undangan wawancara pertama',
    icon: 'users',
    level: 'silver',
    unlocked: false,
  },
  {
    id: 'applications-get-offer',
    name: 'Tawaran Pekerjaan',
    description: 'Mendapatkan tawaran pekerjaan',
    icon: 'award',
    level: 'gold',
    unlocked: false,
  },
  
  // Kategori Engagement
  {
    id: 'engagement-login-streak-7',
    name: 'Aktif 7 Hari',
    description: 'Login 7 hari berturut-turut',
    icon: 'medal',
    level: 'bronze',
    unlocked: false,
    progress: 0,
    maxProgress: 7,
  },
  {
    id: 'engagement-login-streak-30',
    name: 'Konsisten 30 Hari',
    description: 'Login 30 hari berturut-turut',
    icon: 'medal',
    level: 'silver',
    unlocked: false,
    progress: 0,
    maxProgress: 30,
  },
  {
    id: 'engagement-daily-check',
    name: 'Pencari Rutin',
    description: 'Memeriksa lowongan setiap hari selama 5 hari',
    icon: 'check',
    level: 'bronze',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'engagement-saved-jobs',
    name: 'Kolektor Lowongan',
    description: 'Menyimpan 10 lowongan untuk ditinjau nanti',
    icon: 'bookmark',
    level: 'bronze',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  
  // Kategori Skills
  {
    id: 'skills-endorsed-first',
    name: 'Skill Terverifikasi',
    description: 'Mendapatkan endorsement pertama untuk keahlian',
    icon: 'thumbs-up',
    level: 'bronze',
    unlocked: false,
  },
  {
    id: 'skills-endorsed-10',
    name: 'Ahli Terverifikasi',
    description: 'Mendapatkan 10 endorsement untuk keahlian',
    icon: 'thumbs-up',
    level: 'silver',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'skills-learn-new',
    name: 'Pelajar Seumur Hidup',
    description: 'Menambahkan keahlian baru yang dipelajari',
    icon: 'graduation',
    level: 'bronze',
    unlocked: false,
  },
  
  // Kategori Special
  {
    id: 'special-early-adopter',
    name: 'Pengguna Awal',
    description: 'Bergabung dengan InfoPekerjaan.id di tahap awal',
    icon: 'star',
    level: 'gold',
    unlocked: false,
  },
  {
    id: 'special-premium',
    name: 'Pengguna Premium',
    description: 'Berlangganan akun premium InfoPekerjaan.id',
    icon: 'award',
    level: 'platinum',
    unlocked: false,
  },
  {
    id: 'special-verified',
    name: 'Identitas Terverifikasi',
    description: 'Memverifikasi akun dengan ID resmi',
    icon: 'check',
    level: 'gold',
    unlocked: false,
  },
];

// Definisi pencapaian untuk perusahaan/employer
export const EMPLOYER_ACHIEVEMENTS: AchievementBadgeProps[] = [
  // Kategori Profile
  {
    id: 'company-profile-complete',
    name: 'Profil Perusahaan',
    description: 'Melengkapi profil perusahaan',
    icon: 'building',
    level: 'bronze',
    unlocked: false,
  },
  {
    id: 'company-logo-add',
    name: 'Branding Perusahaan',
    description: 'Menambahkan logo perusahaan',
    icon: 'image',
    level: 'bronze',
    unlocked: false,
  },
  {
    id: 'company-verified',
    name: 'Perusahaan Terverifikasi',
    description: 'Memverifikasi identitas dan legalitas perusahaan',
    icon: 'check',
    level: 'gold',
    unlocked: false,
  },
  
  // Kategori Jobs
  {
    id: 'jobs-first-post',
    name: 'Pemberi Kerja',
    description: 'Memposting lowongan pertama',
    icon: 'briefcase',
    level: 'bronze',
    unlocked: false,
  },
  {
    id: 'jobs-10-posts',
    name: 'Pengrekrut Aktif',
    description: 'Memposting 10 lowongan',
    icon: 'briefcase',
    level: 'silver',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'jobs-50-posts',
    name: 'Pengrekrut Berpengalaman',
    description: 'Memposting 50 lowongan',
    icon: 'briefcase',
    level: 'gold',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'jobs-100-applications',
    name: 'Pemberi Kerja Populer',
    description: 'Menerima 100 lamaran untuk lowongan Anda',
    icon: 'users',
    level: 'silver',
    unlocked: false,
    progress: 0,
    maxProgress: 100,
  },
  {
    id: 'jobs-10-hires',
    name: 'Pemberi Kerja Sukses',
    description: 'Mempekerjakan 10 karyawan melalui platform',
    icon: 'users',
    level: 'gold',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  
  // Kategori Engagement
  {
    id: 'engagement-quick-response',
    name: 'Responsif',
    description: 'Merespon 10 lamaran dalam 24 jam',
    icon: 'clock',
    level: 'silver',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'engagement-feedback',
    name: 'Pemberi Masukan',
    description: 'Memberikan umpan balik kepada pelamar',
    icon: 'message',
    level: 'bronze',
    unlocked: false,
  },
  
  // Kategori Special
  {
    id: 'special-premium-employer',
    name: 'Employer Premium',
    description: 'Berlangganan paket premium untuk perusahaan',
    icon: 'award',
    level: 'platinum',
    unlocked: false,
  },
  {
    id: 'special-top-employer',
    name: 'Pemberi Kerja Terbaik',
    description: 'Mendapatkan status pemberi kerja teratas',
    icon: 'trophy',
    level: 'platinum',
    unlocked: false,
  },
];

// Fungsi untuk mengategorikan pencapaian
export function categorizeAchievements(achievements: AchievementBadgeProps[]) {
  const categories = {
    profile: achievements.filter(a => a.id.startsWith('profile-') || a.id.startsWith('company-profile')),
    applications: achievements.filter(a => a.id.startsWith('applications-')),
    jobs: achievements.filter(a => a.id.startsWith('jobs-')),
    engagement: achievements.filter(a => a.id.startsWith('engagement-')),
    skills: achievements.filter(a => a.id.startsWith('skills-')),
    special: achievements.filter(a => a.id.startsWith('special-')),
  };
  
  return categories;
}

// Fungsi untuk menghitung jumlah achievement yang sudah dibuka
export function countUnlockedAchievements(achievements: AchievementBadgeProps[]) {
  return achievements.filter(a => a.unlocked).length;
}

// Fungsi untuk mendapatkan achievement berdasarkan ID
export function getAchievementById(
  id: string, 
  achievements: AchievementBadgeProps[]
): AchievementBadgeProps | undefined {
  return achievements.find(a => a.id === id);
}

// Fungsi untuk mengupdate progress achievement
export function updateAchievementProgress(
  id: string, 
  progress: number, 
  achievements: AchievementBadgeProps[]
): AchievementBadgeProps[] {
  return achievements.map(a => {
    if (a.id === id) {
      const updatedProgress = Math.min(a.maxProgress || 100, progress);
      const isUnlocked = updatedProgress >= (a.maxProgress || 100);
      
      return {
        ...a,
        progress: updatedProgress,
        unlocked: isUnlocked || a.unlocked,
        date: isUnlocked && !a.unlocked ? new Date().toLocaleDateString('id-ID') : a.date,
      };
    }
    return a;
  });
}

// Fungsi untuk membuka achievement
export function unlockAchievement(
  id: string, 
  achievements: AchievementBadgeProps[]
): AchievementBadgeProps[] {
  return achievements.map(a => {
    if (a.id === id && !a.unlocked) {
      return {
        ...a,
        unlocked: true,
        date: new Date().toLocaleDateString('id-ID'),
      };
    }
    return a;
  });
}