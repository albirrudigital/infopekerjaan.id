import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Code, 
  LucideIcon, 
  Lightbulb, 
  Video, 
  GraduationCap, 
  CheckCircle2,
  Star,
  ExternalLink,
  Clock,
  Filter,
  SortAsc,
  Bookmark,
  Timer,
  BarChart3,
  GraduationCap as Education
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Definisi tipe untuk resource micro-learning
export interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'course' | 'tutorial' | 'book';
  provider: string;
  url: string;
  duration: string;  // e.g., "5 mins read", "2 hour course"
  durationMinutes: number; // Durasi dalam menit untuk sorting/filtering
  level: 'beginner' | 'intermediate' | 'advanced';
  skills: string[];
  rating: number;    // out of 5
  status?: 'not_started' | 'in_progress' | 'completed'; // Progress status
  completionPercentage?: number; // 0-100
}

interface MicroLearningRecommendationsProps {
  skillsToImprove: string[];
  currentLevel?: 'beginner' | 'intermediate' | 'advanced';
  selectedCareerNode?: {
    id: string;
    title: string;
    requiredSkills: string[];
  };
}

// Data sampel untuk rekomendasi micro-learning
// Pada implementasi nyata, data ini akan dari API berdasarkan skillsToImprove dan currentLevel
const sampleLearningResources: LearningResource[] = [
  {
    id: "react-basics",
    title: "Dasar-dasar React.js",
    description: "Pelajari cara membuat aplikasi web dengan React.js dari awal hingga deployment",
    type: "course",
    provider: "Dicoding",
    url: "https://www.dicoding.com/academies/403",
    duration: "20 jam",
    durationMinutes: 1200, // 20 jam
    level: "beginner",
    skills: ["JavaScript", "React", "Web Development"],
    rating: 4.8,
    status: "not_started",
    completionPercentage: 0
  },
  {
    id: "nodejs-api",
    title: "Membangun RESTful API dengan Node.js",
    description: "Tutorial lengkap membangun RESTful API menggunakan Node.js, Express, dan MongoDB",
    type: "tutorial",
    provider: "Medium",
    url: "https://medium.com/bacaantech/membangun-restful-api-dengan-node-js-express-dan-mongodb-79758271d9d7",
    duration: "30 menit membaca",
    durationMinutes: 30,
    level: "intermediate",
    skills: ["Node.js", "Express", "RESTful API"],
    rating: 4.5,
    status: "in_progress",
    completionPercentage: 45
  },
  {
    id: "sql-basic",
    title: "Pengenalan SQL untuk Pemula",
    description: "Pelajari dasar-dasar SQL untuk mengakses dan manipulasi database",
    type: "video",
    provider: "YouTube",
    url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
    duration: "3 jam video",
    durationMinutes: 180,
    level: "beginner",
    skills: ["SQL", "Database"],
    rating: 4.7,
    status: "not_started",
    completionPercentage: 0
  },
  {
    id: "system-design",
    title: "Desain Sistem untuk Engineer Software",
    description: "Pelajari prinsip dasar desain sistem yang skalabel dan dapat diandalkan",
    type: "book",
    provider: "O'Reilly",
    url: "https://www.oreilly.com/library/view/fundamentals-of-software/9781492043447/",
    duration: "10 jam membaca",
    durationMinutes: 600,
    level: "advanced",
    skills: ["System Design", "Architecture"],
    rating: 4.9,
    status: "not_started",
    completionPercentage: 0
  },
  {
    id: "docker-basic",
    title: "Docker untuk Pemula",
    description: "Panduan lengkap menggunakan Docker untuk deployment aplikasi",
    type: "article",
    provider: "DEV.to",
    url: "https://dev.to/softchris/docker-for-beginners-56dm",
    duration: "15 menit membaca",
    durationMinutes: 15,
    level: "beginner",
    skills: ["Docker", "Containerization", "DevOps"],
    rating: 4.4,
    status: "completed",
    completionPercentage: 100
  },
  {
    id: "leadership-101",
    title: "Dasar-dasar Leadership untuk Developer",
    description: "Tingkatkan skill leadership Anda untuk mengembangkan karir teknis",
    type: "course",
    provider: "LinkedIn Learning",
    url: "https://www.linkedin.com/learning/leadership-foundations-4",
    duration: "2 jam",
    durationMinutes: 120,
    level: "intermediate",
    skills: ["Leadership", "Soft Skills", "Management"],
    rating: 4.6,
    status: "in_progress",
    completionPercentage: 25
  },
  {
    id: "cloud-architecture",
    title: "Arsitektur Cloud Modern",
    description: "Pelajari arsitektur cloud dan praktik terbaik untuk sistem berbasis cloud",
    type: "tutorial",
    provider: "AWS Documentation",
    url: "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html",
    duration: "45 menit membaca",
    durationMinutes: 45,
    level: "advanced",
    skills: ["Cloud Architecture", "AWS", "Scalability"],
    rating: 4.7,
    status: "not_started",
    completionPercentage: 0
  },
  {
    id: "machine-learning-intro",
    title: "Pengantar Machine Learning",
    description: "Pelajari konsep dasar machine learning dan implementasi praktisnya",
    type: "course",
    provider: "Coursera",
    url: "https://www.coursera.org/learn/machine-learning",
    duration: "40 jam",
    durationMinutes: 2400,
    level: "intermediate",
    skills: ["Machine Learning", "Python", "Data Science"],
    rating: 4.9,
    status: "not_started",
    completionPercentage: 0
  },
  {
    id: "security-basics",
    title: "Keamanan Web Dasar",
    description: "Pelajari praktik terbaik keamanan web untuk developer",
    type: "article",
    provider: "OWASP",
    url: "https://owasp.org/www-project-top-ten/",
    duration: "20 menit membaca",
    durationMinutes: 20,
    level: "beginner",
    skills: ["Security", "Web Security"],
    rating: 4.5,
    status: "in_progress",
    completionPercentage: 75
  },
  {
    id: "ui-ux-design",
    title: "Dasar UI/UX Design untuk Developer",
    description: "Pelajari prinsip dasar desain UI/UX untuk meningkatkan kualitas aplikasi Anda",
    type: "video",
    provider: "YouTube",
    url: "https://www.youtube.com/watch?v=c9Wg6Cb_YlU",
    duration: "1.5 jam video",
    durationMinutes: 90,
    level: "beginner",
    skills: ["UI Design", "UX Design", "User Research"],
    rating: 4.6,
    status: "not_started",
    completionPercentage: 0
  }
];

// Fungsi untuk mendapatkan ikon berdasarkan tipe konten
const getResourceIcon = (type: LearningResource['type']): LucideIcon => {
  switch (type) {
    case 'article':
      return BookOpen;
    case 'video':
      return Video;
    case 'course':
      return GraduationCap;
    case 'tutorial':
      return Code;
    case 'book':
      return BookOpen;
    default:
      return Lightbulb;
  }
};

// Fungsi untuk mencari rekomendasi berdasarkan skills
const getRecommendations = (
  skillsToImprove: string[],
  level?: 'beginner' | 'intermediate' | 'advanced',
  limit: number = 5
): LearningResource[] => {
  // Konversi ke lowercase untuk perbandingan yang lebih baik
  const skillsLower = skillsToImprove.map(s => s.toLowerCase());
  
  // Filter dan skor resource berdasarkan relevansi skills
  const scoredResources = sampleLearningResources.map(resource => {
    const resourceSkillsLower = resource.skills.map(s => s.toLowerCase());
    
    // Hitung skor berdasarkan jumlah skill yang cocok
    const matchCount = resourceSkillsLower.filter(skill => 
      skillsLower.some(s => s.includes(skill) || skill.includes(s))
    ).length;
    
    // Prioritaskan resource yang sesuai level
    const levelBonus = (level && resource.level === level) ? 2 : 0;
    
    // Skor akhir berdasarkan jumlah skill yang cocok, rating, dan level
    const score = matchCount * 3 + (resource.rating / 5) * 2 + levelBonus;
    
    return { resource, score };
  });
  
  // Urutkan berdasarkan skor dan ambil sejumlah rekomendasi teratas
  return scoredResources
    .filter(({ score }) => score > 0) // Hanya yang relevan
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ resource }) => resource);
};

const MicroLearningRecommendations: React.FC<MicroLearningRecommendationsProps> = ({
  skillsToImprove,
  currentLevel,
  selectedCareerNode
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('relevance');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterDuration, setFilterDuration] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);
  const [savedResources, setSavedResources] = useState<string[]>([]);
  
  // Track de total belajar mingguan
  const [weeklyLearnedMinutes, setWeeklyLearnedMinutes] = useState<number>(45);
  const weeklyLearningGoal = 120; // Target 2 jam per minggu
  
  // State untuk resource yang diupdate
  const [resourcesState, setResourcesState] = useState<LearningResource[]>([]);
  const [userFeedback, setUserFeedback] = useState<Record<string, { liked: boolean | null; rating: number | null }>>({});
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState<string | null>(null);
  const [nextRecommended, setNextRecommended] = useState<LearningResource | null>(null);
  
  // Inisialisasi resourcesState saat pertama kali komponen dimuat
  useEffect(() => {
    const recommendations = getRecommendations(skillsToImprove, currentLevel, 10);
    setResourcesState(recommendations);
    
    // Pilih materi yang direkomendasikan berikutnya
    // Prioritas: materi yang sedang dipelajari, atau materi yang terkait dengan materi yang baru selesai
    const inProgressItem = recommendations.find(r => r.status === 'in_progress');
    const relatedToCompleted = recommendations.find(r => {
      const completed = recommendations.find(c => c.status === 'completed');
      if (!completed) return false;
      // Cek apakah ada skill yang sama
      return r.status !== 'completed' && 
             r.skills.some(s => completed.skills.includes(s));
    });
    
    setNextRecommended(inProgressItem || relatedToCompleted || recommendations[0]);
  }, [skillsToImprove, currentLevel]);
  
  // Handler untuk mengubah status resource
  const handleStatusChange = (resourceId: string, newStatus: LearningResource['status']) => {
    setResourcesState(prev => 
      prev.map(resource => 
        resource.id === resourceId 
          ? { 
              ...resource, 
              status: newStatus,
              completionPercentage: newStatus === 'completed' ? 100 : 
                                    newStatus === 'in_progress' ? Math.max(25, resource.completionPercentage || 0) : 0
            } 
          : resource
      )
    );
  };
  
  // Handler untuk mengubah persentase progress
  const handleProgressChange = (resourceId: string, percentage: number) => {
    setResourcesState(prev => 
      prev.map(resource => 
        resource.id === resourceId 
          ? { 
              ...resource, 
              completionPercentage: percentage,
              status: percentage === 100 ? 'completed' : 
                     percentage > 0 ? 'in_progress' : 'not_started'
            } 
          : resource
      )
    );
    
    // Jika pengguna menyelesaikan materi, tampilkan prompt feedback
    if (percentage === 100) {
      setShowFeedbackPrompt(resourceId);
    }
    
    // Update progress belajar mingguan
    if (percentage > 0) {
      const resource = resourcesState.find(r => r.id === resourceId);
      if (resource) {
        const prevPercentage = resource.completionPercentage || 0;
        const deltaPercentage = percentage - prevPercentage;
        if (deltaPercentage > 0) {
          // Tambahkan waktu belajar berdasarkan persentase yang diselesaikan
          const additionalMinutes = Math.round((resource.durationMinutes * deltaPercentage) / 100);
          setWeeklyLearnedMinutes(prev => prev + additionalMinutes);
        }
      }
    }
  };
  
  // Handler untuk memberikan feedback
  const handleGiveFeedback = (resourceId: string, liked: boolean | null, rating: number | null) => {
    setUserFeedback(prev => ({
      ...prev,
      [resourceId]: { liked, rating }
    }));
    
    // Tutup prompt feedback setelah user memberikan feedback
    setShowFeedbackPrompt(null);
  };
  
  // Handler untuk menyimpan resource
  const handleToggleSave = (resourceId: string) => {
    setSavedResources(prev => 
      prev.includes(resourceId) 
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };
  
  // Render level badge dengan warna yang sesuai
  const renderLevelBadge = (level: LearningResource['level']) => {
    let className = '';
    switch (level) {
      case 'beginner':
        className = 'bg-green-100 text-green-800 border-green-200';
        break;
      case 'intermediate':
        className = 'bg-blue-100 text-blue-800 border-blue-200';
        break;
      case 'advanced':
        className = 'bg-purple-100 text-purple-800 border-purple-200';
        break;
    }
    
    return (
      <Badge variant="outline" className={className}>
        {level === 'beginner' ? 'Pemula' : level === 'intermediate' ? 'Menengah' : 'Lanjutan'}
      </Badge>
    );
  };
  
  // Render status badge
  const renderStatusBadge = (status: LearningResource['status']) => {
    if (!status) return null;
    
    let text = '';
    let className = '';
    let icon: LucideIcon | null = null;
    
    switch (status) {
      case 'not_started':
        text = 'Belum Dimulai';
        className = 'bg-slate-100 text-slate-800 border-slate-200';
        break;
      case 'in_progress':
        text = 'Sedang Dipelajari';
        className = 'bg-amber-100 text-amber-800 border-amber-200';
        icon = Timer;
        break;
      case 'completed':
        text = 'Selesai';
        className = 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium';
        icon = CheckCircle2;
        break;
    }
    
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${className}`}>
        {icon && React.createElement(icon, { className: "h-3 w-3" })}
        {text}
      </Badge>
    );
  };
  
  // Mendapatkan warna progress bar berdasarkan status
  const getProgressBarColor = (status: LearningResource['status']) => {
    switch (status) {
      case 'not_started':
        return 'bg-slate-500';
      case 'in_progress':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-emerald-500';
      default:
        return '';
    }
  };
  
  // Filter dan sort berdasarkan opsi yang dipilih
  const getFilteredAndSortedResources = () => {
    let filtered = [...resourcesState];
    
    // Filter khusus untuk tab "saved"
    if (activeTab === 'saved') {
      filtered = filtered.filter(resource => savedResources.includes(resource.id));
    }
    // Filter berdasarkan tipe
    else if (activeTab !== 'all') {
      filtered = filtered.filter(resource => resource.type === activeTab);
    }
    
    // Filter berdasarkan level
    if (filterLevel !== 'all') {
      filtered = filtered.filter(resource => resource.level === filterLevel);
    }
    
    // Filter berdasarkan durasi
    if (filterDuration !== 'all') {
      switch (filterDuration) {
        case 'short':
          filtered = filtered.filter(resource => resource.durationMinutes <= 30);
          break;
        case 'medium':
          filtered = filtered.filter(resource => resource.durationMinutes > 30 && resource.durationMinutes <= 120);
          break;
        case 'long':
          filtered = filtered.filter(resource => resource.durationMinutes > 120);
          break;
      }
    }
    
    // Filter berdasarkan status completed
    if (!showCompleted) {
      filtered = filtered.filter(resource => resource.status !== 'completed');
    }
    
    // Sort berdasarkan opsi yang dipilih
    switch (sortOption) {
      case 'relevance':
        // Default sorting dari getRecommendations
        break;
      case 'duration-asc':
        filtered.sort((a, b) => a.durationMinutes - b.durationMinutes);
        break;
      case 'duration-desc':
        filtered.sort((a, b) => b.durationMinutes - a.durationMinutes);
        break;
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'level-asc':
        filtered.sort((a, b) => {
          const levelOrder: Record<string, number> = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3
          };
          return levelOrder[a.level] - levelOrder[b.level];
        });
        break;
    }
    
    return filtered;
  };
  
  // Mendapatkan resource yang telah difilter dan diurutkan
  const filteredRecommendations = getFilteredAndSortedResources();
  
  // Progress tracker mingguan
  const weeklyProgressPercentage = Math.min(100, (weeklyLearnedMinutes / weeklyLearningGoal) * 100);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Rekomendasi Pembelajaran</h3>
        <p className="text-sm text-muted-foreground">
          Berdasarkan analisis skill gap, berikut adalah sumber belajar yang direkomendasikan untuk 
          {selectedCareerNode ? ` meningkatkan peluang Anda untuk posisi ${selectedCareerNode.title}` : ' pengembangan karir Anda'}
        </p>
      </div>
      
      {/* Weekly Learning Progress */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              <h4 className="font-medium">Progress Belajar Mingguan</h4>
            </div>
            <Badge variant={weeklyProgressPercentage >= 100 ? "default" : "outline"}>
              {weeklyLearnedMinutes} / {weeklyLearningGoal} menit
            </Badge>
          </div>
          <Progress value={weeklyProgressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {weeklyProgressPercentage >= 100 
              ? "Target mingguan tercapai! 🎉"
              : `${Math.round(weeklyProgressPercentage)}% dari target mingguan telah tercapai.`
            }
          </p>
        </CardContent>
      </Card>
      
      {/* Filtering and Sorting Controls */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Level</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setFilterLevel('all')}>
                  <span className={filterLevel === 'all' ? "font-medium" : ""}>Semua Level</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterLevel('beginner')}>
                  <span className={filterLevel === 'beginner' ? "font-medium" : ""}>Pemula</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterLevel('intermediate')}>
                  <span className={filterLevel === 'intermediate' ? "font-medium" : ""}>Menengah</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterLevel('advanced')}>
                  <span className={filterLevel === 'advanced' ? "font-medium" : ""}>Lanjutan</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Durasi</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setFilterDuration('all')}>
                  <span className={filterDuration === 'all' ? "font-medium" : ""}>Semua Durasi</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDuration('short')}>
                  <span className={filterDuration === 'short' ? "font-medium" : ""}>Singkat (&lt; 30 menit)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDuration('medium')}>
                  <span className={filterDuration === 'medium' ? "font-medium" : ""}>Sedang (30 - 120 menit)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDuration('long')}>
                  <span className={filterDuration === 'long' ? "font-medium" : ""}>Panjang (&gt; 120 menit)</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowCompleted(!showCompleted)}>
                <div className="flex items-center">
                  <span className="mr-2">{showCompleted ? "Sembunyikan" : "Tampilkan"} yang Selesai</span>
                  {showCompleted && <CheckCircle2 className="h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <SortAsc className="h-4 w-4" />
                Urutkan
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortOption('relevance')}>
                <span className={sortOption === 'relevance' ? "font-medium" : ""}>Relevansi</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('duration-asc')}>
                <span className={sortOption === 'duration-asc' ? "font-medium" : ""}>Durasi (Tersingkat)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('duration-desc')}>
                <span className={sortOption === 'duration-desc' ? "font-medium" : ""}>Durasi (Terlama)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('rating-desc')}>
                <span className={sortOption === 'rating-desc' ? "font-medium" : ""}>Rating (Tertinggi)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption('level-asc')}>
                <span className={sortOption === 'level-asc' ? "font-medium" : ""}>Level (Mudah ke Sulit)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div>
          <Button variant="ghost" size="sm" className="gap-1">
            <Bookmark className="h-4 w-4" />
            Tersimpan ({savedResources.length})
          </Button>
        </div>
      </div>
      
      {/* Next Recommended Learning */}
      {nextRecommended && (
        <Card className="border border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Rekomendasi Berikutnya</CardTitle>
              <Badge variant="outline">Dinamis</Badge>
            </div>
            <CardDescription>
              Berdasarkan pola belajar Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 items-start">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                {getResourceIcon(nextRecommended.type) && React.createElement(getResourceIcon(nextRecommended.type), { className: "h-6 w-6" })}
              </div>
              <div className="flex-grow">
                <h4 className="font-medium text-sm">{nextRecommended.title}</h4>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{nextRecommended.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span>{nextRecommended.provider}</span>
                  <span>•</span>
                  <span>{nextRecommended.duration}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-0.5" />
                    <span>{nextRecommended.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleStatusChange(nextRecommended.id, 'in_progress')}
                  >
                    Mulai Belajar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => window.open(nextRecommended.url, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Akses
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Feedback Prompt Dialog */}
      {showFeedbackPrompt && (
        <Card className="border-primary/20 bg-primary/5 mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Bagikan Pendapat Anda</CardTitle>
            <CardDescription>
              Bagaimana materi pembelajaran ini menurut Anda?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center gap-6">
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-2" 
                  onClick={() => handleGiveFeedback(showFeedbackPrompt, true, null)}
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    👍
                  </div>
                  <span className="text-xs">Membantu</span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="flex flex-col items-center gap-2"
                  onClick={() => handleGiveFeedback(showFeedbackPrompt, false, null)}
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    👎
                  </div>
                  <span className="text-xs">Kurang Membantu</span>
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Rating:</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button 
                        key={rating} 
                        variant="ghost" 
                        size="sm" 
                        className="w-8 h-8 p-0" 
                        onClick={() => handleGiveFeedback(showFeedbackPrompt, null, rating)}
                      >
                        <Star className={`h-5 w-5 ${
                          (userFeedback[showFeedbackPrompt]?.rating || 0) >= rating 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-muted-foreground"
                        }`} />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowFeedbackPrompt(null)}
                >
                  Lewati
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Learning Goals Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Target Belajar Anda</CardTitle>
              <Button variant="outline" size="sm">Edit Target</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Education className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <h4 className="text-sm font-medium">Menguasai Dasar Web Development</h4>
                    <p className="text-xs text-muted-foreground">Target: 3 minggu lagi</p>
                  </div>
                </div>
                <Badge>7 materi tersisa</Badge>
              </div>
              <Progress value={30} className="h-2" />
              
              <div className="flex flex-col gap-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span>Target Belajar Mingguan</span>
                  <span className="font-medium">3 jam/minggu</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Realisasi Minggu Ini</span>
                  <span className="font-medium">{Math.floor(weeklyLearnedMinutes / 60)} jam {weeklyLearnedMinutes % 60} menit</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Learning Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">Statistik Belajar</CardTitle>
              <Badge variant="outline">30 Hari Terakhir</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-muted-foreground">Total Materi</span>
                  <span className="text-xl font-semibold">{resourcesState.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Selesai</span>
                  <span className="font-medium text-sm">{resourcesState.filter(r => r.status === 'completed').length}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-muted-foreground">Waktu Belajar</span>
                  <span className="text-xl font-semibold">8.5 jam</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">Skill Terbanyak</span>
                  <span className="font-medium text-sm">React.js</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Distribusi Materi</span>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '30%' }}></div>
                <div className="bg-amber-500 h-full" style={{ width: '20%' }}></div>
                <div className="bg-blue-500 h-full" style={{ width: '25%' }}></div>
                <div className="bg-purple-500 h-full" style={{ width: '25%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Selesai</span>
                <span>On Progress</span>
                <span>Video</span>
                <span>Artikel</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="saved">Tersimpan</TabsTrigger>
          <TabsTrigger value="course">Kursus</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="article">Artikel</TabsTrigger>
          <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-4">
          {filteredRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecommendations.map((resource) => {
                const IconComponent = getResourceIcon(resource.type);
                const isSaved = savedResources.includes(resource.id);
                
                return (
                  <Card key={resource.id} className={`group hover:shadow-md transition-all ${resource.status === 'completed' ? 'bg-green-50/30' : ''}`}>
                    <CardHeader className="pb-2 flex">
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-base">{resource.title}</CardTitle>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleToggleSave(resource.id)}
                          >
                            <Bookmark 
                              className={`h-4 w-4 ${isSaved ? "text-primary fill-primary" : ""}`} 
                            />
                          </Button>
                        </div>
                        <CardDescription className="mt-1">
                          {resource.provider} • {resource.duration}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                      
                      {/* Status dan Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            {renderStatusBadge(resource.status)}
                            <span className="text-xs text-muted-foreground">
                              {resource.completionPercentage}%
                            </span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 px-2">
                                Ubah Status
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => handleStatusChange(resource.id, 'not_started')}>
                                Belum Dimulai
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(resource.id, 'in_progress')}>
                                Sedang Dipelajari
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(resource.id, 'completed')}>
                                Selesai
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <Progress 
                          value={resource.completionPercentage} 
                          className={`h-1.5 ${getProgressBarColor(resource.status)}`}
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {renderLevelBadge(resource.level)}
                        {resource.skills.slice(0, 2).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {resource.skills.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{resource.skills.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium ml-1">{resource.rating.toFixed(1)}</span>
                        </div>
                        <div className="space-x-2">
                          <Button 
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              if (resource.status !== 'completed') {
                                handleProgressChange(
                                  resource.id, 
                                  Math.min(100, (resource.completionPercentage || 0) + 25)
                                );
                              }
                            }}
                            disabled={resource.status === 'completed'}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Update
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="gap-1"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Akses
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
              <h3 className="text-lg font-medium mb-1">Tidak ada rekomendasi</h3>
              <p className="text-sm text-muted-foreground">
                Tidak ditemukan rekomendasi pembelajaran untuk filter yang dipilih.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MicroLearningRecommendations;