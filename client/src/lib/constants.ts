export const JOB_TYPES = [
  { value: "full-time", label: "Penuh Waktu" },
  { value: "part-time", label: "Paruh Waktu" },
  { value: "contract", label: "Kontrak" },
  { value: "remote", label: "Remote" },
];

export const CAREER_LEVELS = [
  { value: "entry", label: "Entry Level" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "executive", label: "Executive" },
];

export const INDUSTRIES = [
  { value: "technology", label: "Teknologi" },
  { value: "banking", label: "Perbankan" },
  { value: "education", label: "Pendidikan" },
  { value: "healthcare", label: "Kesehatan" },
  { value: "finance", label: "Keuangan" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufaktur" },
  { value: "hospitality", label: "Perhotelan & Pariwisata" },
  { value: "media", label: "Media & Entertainment" },
  { value: "logistics", label: "Logistik & Transportasi" },
  { value: "construction", label: "Konstruksi" },
  { value: "agriculture", label: "Pertanian" },
  { value: "government", label: "Pemerintahan" },
  { value: "nonprofit", label: "Non-Profit" },
  { value: "telecom", label: "Telekomunikasi" },
];

export const LOCATIONS = [
  "Jakarta Pusat",
  "Jakarta Selatan",
  "Jakarta Barat",
  "Jakarta Timur",
  "Jakarta Utara",
  "Bandung",
  "Surabaya",
  "Medan",
  "Makassar",
  "Semarang",
  "Yogyakarta",
  "Bali",
  "Tangerang",
  "Bekasi",
  "Bogor",
  "Depok",
  "Malang",
  "Palembang",
  "Batam",
  "Balikpapan",
];

export const APPLICATION_STATUS = {
  pending: "Menunggu",
  reviewed: "Dipertimbangkan",
  shortlisted: "Shortlisted",
  rejected: "Ditolak",
  hired: "Diterima",
};

export const CATEGORIES = [
  {
    name: "Teknologi Informasi",
    icon: "laptop-code",
    jobCount: 1240
  },
  {
    name: "Keuangan & Akuntansi",
    icon: "chart-line",
    jobCount: 876
  },
  {
    name: "Penjualan & Pemasaran",
    icon: "shopping-cart",
    jobCount: 920
  },
  {
    name: "Sumber Daya Manusia",
    icon: "users",
    jobCount: 548
  },
  {
    name: "Administrasi",
    icon: "building",
    jobCount: 635
  },
  {
    name: "Logistik & Supply Chain",
    icon: "truck",
    jobCount: 418
  },
  {
    name: "Pendidikan & Pelatihan",
    icon: "graduation-cap",
    jobCount: 312
  },
  {
    name: "Media & Kreatif",
    icon: "pencil-alt",
    jobCount: 294
  }
];

export const BLOG_POSTS = [
  {
    id: 1,
    title: "7 Tips Sukses Wawancara Kerja di Era Digital",
    excerpt: "Bagaimana mempersiapkan diri untuk wawancara virtual dan membuat kesan pertama yang baik melalui layar.",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
    category: "Tips Karir",
    date: "15 Oktober 2023"
  },
  {
    id: 2,
    title: "5 Keahlian Digital yang Paling Dicari di 2023",
    excerpt: "Keahlian teknologi yang sedang naik daun dan bagaimana mengembangkannya untuk meningkatkan nilai Anda di pasar kerja.",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d",
    category: "Pengembangan Diri",
    date: "10 Oktober 2023"
  },
  {
    id: 3,
    title: "Tren Rekrutmen di Industri Teknologi Indonesia",
    excerpt: "Bagaimana perusahaan teknologi di Indonesia mengubah strategi rekrutmen mereka pasca-pandemi.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998",
    category: "Industri",
    date: "5 Oktober 2023"
  }
];

export const COMPANIES = [
  {
    id: 1,
    name: "Gojek",
    logo: "https://logo.clearbit.com/gojek.com",
    jobCount: 42
  },
  {
    id: 2,
    name: "Tokopedia",
    logo: "https://logo.clearbit.com/tokopedia.com",
    jobCount: 38
  },
  {
    id: 3,
    name: "Bank BCA",
    logo: "https://logo.clearbit.com/bca.co.id",
    jobCount: 29
  },
  {
    id: 4,
    name: "Unilever",
    logo: "https://logo.clearbit.com/unilever.com",
    jobCount: 26
  },
  {
    id: 5,
    name: "Bank Mandiri",
    logo: "https://logo.clearbit.com/mandiri.co.id",
    jobCount: 24
  },
  {
    id: 6,
    name: "Telkom",
    logo: "https://logo.clearbit.com/telkom.co.id",
    jobCount: 22
  }
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Wulandari",
    position: "UI/UX Designer di Tokopedia",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    rating: 5,
    text: "Saya menemukan pekerjaan impian saya di infopekerjaan.id hanya dalam 2 minggu! Fitur pencarian yang mudah dan rekomendasi yang akurat membuat proses mencari kerja jadi sangat mudah."
  },
  {
    id: 2,
    name: "Budi Santoso",
    position: "Software Engineer di Gojek",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    rating: 5,
    text: "Platform yang luar biasa untuk para profesional IT. CV saya langsung mendapat respon dari beberapa perusahaan teknologi ternama. Fitur upload CV sangat membantu dalam proses aplikasi."
  },
  {
    id: 3,
    name: "Anita Wijaya",
    position: "Marketing Manager di Unilever",
    photo: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
    rating: 4.5,
    text: "Setelah 5 tahun bekerja, saya ingin mencari tantangan baru. Melalui infopekerjaan.id, saya bisa dengan mudah memfilter lowongan sesuai gaji dan level karir yang saya inginkan."
  }
];
