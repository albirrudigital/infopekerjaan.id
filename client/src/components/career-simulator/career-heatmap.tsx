import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Briefcase, DollarSign, Clock, TrendingUp, Heart, Shield, Star, Share2, Save, Bookmark } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Definisi tipe untuk node karir 
interface CareerNode {
  id: string;
  title: string;
  level: string;
  salaryRange: string;
  requiredSkills: string[];
  growthScore: number;
  demandScore: number;
  timeToAchieve: string;
  description: string;
  matchScore: number;
}

interface CareerPathHeatmapProps {
  userSkills: string[];
  userPreferences: {
    salaryPriority: number;
    workLifeBalance: number;
    growthOpportunity: number;
    jobSecurity: number;
  };
  industry?: string;
  currentRole?: string;
}

// Data sampel untuk visualisasi - ini hanya untuk keperluan demo
// Pada implementasi nyata, data akan berasal dari API berdasarkan userSkills dan userPreferences
const generateSampleCareerNodes = (
  userSkills: string[], 
  preferences: CareerPathHeatmapProps['userPreferences'],
  currentRole?: string
): CareerNode[] => {
  // Beberapa role dasar dalam teknologi
  const baseRoles = [
    {
      id: "junior-developer",
      title: "Junior Developer",
      level: "Entry Level",
      salaryRange: "Rp4.000.000 - Rp8.000.000",
      requiredSkills: ["JavaScript", "HTML", "CSS"],
      growthScore: 85,
      demandScore: 80,
      timeToAchieve: "0-1 tahun",
      description: "Posisi untuk pengembang software pemula yang berfokus pada pengembangan fitur dasar dan bug fixing."
    },
    {
      id: "mid-developer",
      title: "Mid-level Developer",
      level: "Mid Level",
      salaryRange: "Rp8.000.000 - Rp15.000.000",
      requiredSkills: ["JavaScript", "React", "Node.js", "SQL"],
      growthScore: 80,
      demandScore: 85,
      timeToAchieve: "1-3 tahun",
      description: "Pengembang dengan pengalaman yang dapat mengerjakan fitur kompleks dan memimpin pengembangan fitur."
    },
    {
      id: "senior-developer",
      title: "Senior Developer",
      level: "Senior Level",
      salaryRange: "Rp15.000.000 - Rp25.000.000",
      requiredSkills: ["JavaScript", "React", "Node.js", "SQL", "System Design"],
      growthScore: 75,
      demandScore: 80,
      timeToAchieve: "3-5 tahun",
      description: "Pengembang senior yang memiliki kemampuan untuk membuat arsitektur, mentoring, dan optimasi kinerja."
    },
    {
      id: "lead-developer",
      title: "Lead Developer",
      level: "Lead Level",
      salaryRange: "Rp25.000.000 - Rp35.000.000",
      requiredSkills: ["JavaScript", "React", "Node.js", "SQL", "System Design", "Leadership"],
      growthScore: 70,
      demandScore: 75,
      timeToAchieve: "5-7 tahun",
      description: "Pengembang yang memimpin tim teknis, membuat keputusan arsitektur, dan mengelola deliverables."
    },
    {
      id: "software-architect",
      title: "Software Architect",
      level: "Architect Level",
      salaryRange: "Rp35.000.000 - Rp50.000.000",
      requiredSkills: ["System Design", "Cloud Architecture", "Scalability", "Leadership", "Multiple Languages"],
      growthScore: 65,
      demandScore: 70,
      timeToAchieve: "7-10 tahun",
      description: "Arsitek software yang bertanggung jawab untuk desain teknis, standar, dan evolusi platform."
    },
    {
      id: "cto",
      title: "Chief Technology Officer",
      level: "Executive Level",
      salaryRange: "> Rp50.000.000",
      requiredSkills: ["Leadership", "Strategic Planning", "Technical Vision", "Business Acumen"],
      growthScore: 60,
      demandScore: 50,
      timeToAchieve: "10-15 tahun",
      description: "Posisi eksekutif yang bertanggung jawab untuk strategi teknologi perusahaan dan tim teknis."
    },
    {
      id: "product-manager",
      title: "Product Manager",
      level: "Mid Level",
      salaryRange: "Rp15.000.000 - Rp25.000.000",
      requiredSkills: ["Product Development", "User Research", "Business Strategy", "Technical Understanding"],
      growthScore: 80,
      demandScore: 85,
      timeToAchieve: "3-5 tahun",
      description: "Mengelola pengembangan produk, peta jalan, dan kepuasan pelanggan."
    },
    {
      id: "data-scientist",
      title: "Data Scientist",
      level: "Mid Level",
      salaryRange: "Rp15.000.000 - Rp30.000.000",
      requiredSkills: ["Python", "Machine Learning", "Statistics", "Data Visualization"],
      growthScore: 90,
      demandScore: 85,
      timeToAchieve: "2-4 tahun",
      description: "Menganalisis data untuk memberikan insight dan membangun model prediktif."
    },
    {
      id: "devops-engineer",
      title: "DevOps Engineer",
      level: "Mid Level",
      salaryRange: "Rp15.000.000 - Rp25.000.000",
      requiredSkills: ["Cloud Services", "CI/CD", "Containerization", "Scripting"],
      growthScore: 85,
      demandScore: 90,
      timeToAchieve: "2-4 tahun",
      description: "Mengotomatisasi dan mengoptimalkan infrastruktur dan proses deployment."
    },
    {
      id: "ui-ux-designer",
      title: "UI/UX Designer",
      level: "Mid Level",
      salaryRange: "Rp10.000.000 - Rp20.000.000",
      requiredSkills: ["User Research", "Prototyping", "Visual Design", "User Testing"],
      growthScore: 80,
      demandScore: 85,
      timeToAchieve: "2-4 tahun",
      description: "Merancang antarmuka dan pengalaman pengguna yang intuitif dan menarik."
    }
  ];

  // Hitung match score berdasarkan skill user dan preferensi
  return baseRoles.map(role => {
    // Skill match percentage (berapa % skill user yang cocok dengan requirement)
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    const requiredSkillsLower = role.requiredSkills.map(s => s.toLowerCase());
    
    const matchedSkills = requiredSkillsLower.filter(s => 
      userSkillsLower.some(us => us.includes(s) || s.includes(us))
    );
    const skillMatchPercentage = role.requiredSkills.length > 0 
      ? (matchedSkills.length / role.requiredSkills.length) * 100 
      : 0;
    
    // Weighted score based on user preferences
    const salaryWeight = preferences.salaryPriority / 100;
    const growthWeight = preferences.growthOpportunity / 100;
    const securityWeight = preferences.jobSecurity / 100;
    const workLifeWeight = preferences.workLifeBalance / 100;
    
    // Extract salary as numeric for calculation (rough estimation)
    let salarySatisfaction = 0;
    if (role.salaryRange.includes('>')) {
      salarySatisfaction = 100; // Maximum if it's "above" something
    } else {
      const maxSalary = parseInt(role.salaryRange.split('-')[1].replace(/\D/g, ''));
      salarySatisfaction = Math.min(100, (maxSalary / 500000)); // Rough scaling
    }
    
    // Calculate match score with user preferences weights
    const matchScore = Math.round(
      (skillMatchPercentage * 0.4) +
      (salarySatisfaction * salaryWeight * 0.15) +
      (role.growthScore * growthWeight * 0.15) +
      (role.demandScore * securityWeight * 0.15) +
      // Assign a work-life balance score (inverse to level - higher positions typically have less work-life balance)
      ((100 - (["Executive Level", "Architect Level"].includes(role.level) ? 30 : 0)) * workLifeWeight * 0.15)
    );
    
    return {
      ...role,
      matchScore
    };
  }).sort((a, b) => b.matchScore - a.matchScore); // Sort by match score descending
};

const CareerPathHeatmap: React.FC<CareerPathHeatmapProps> = ({ 
  userSkills, 
  userPreferences, 
  industry, 
  currentRole 
}) => {
  const [activeTab, setActiveTab] = useState('heatmap');
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [savedCareers, setSavedCareers] = useState<string[]>([]);
  const { toast } = useToast();

  // Generate career nodes based on user input
  const careerNodes = generateSampleCareerNodes(userSkills, userPreferences, currentRole);
  
  // Helper function to get color based on match score
  // Improved color gradient system that maps to user's career fit
  const getMatchScoreColor = (score: number) => {
    // Perfect match: Deep green gradient
    if (score >= 90) return 'bg-gradient-to-br from-green-50 to-green-100 border-green-500 text-green-800 shadow-sm';
    
    // Strong match: Emerald gradient - Good option with minimal skill gap
    if (score >= 75) return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-500 text-emerald-800 shadow-sm';
    
    // Moderate match: Yellow gradient - Requires some skill development 
    if (score >= 60) return 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-500 text-yellow-800 shadow-sm';
    
    // Challenging match: Orange gradient - Substantial skill gap exists
    if (score >= 40) return 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-500 text-orange-800 shadow-sm';
    
    // Difficult match: Red gradient - Major skill development needed
    return 'bg-gradient-to-br from-red-50 to-red-100 border-red-500 text-red-800 shadow-sm';
  };
  
  // Handle node click to show details
  const handleNodeClick = (node: CareerNode) => {
    setSelectedNode(node);
    setDetailOpen(true);
  };
  
  // Menyimpan jalur karir
  const handleSaveCareer = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation(); // Mencegah event menyebar ke handleNodeClick
    
    if (savedCareers.includes(nodeId)) {
      // Hapus node dari daftar tersimpan jika sudah ada
      setSavedCareers(savedCareers.filter(id => id !== nodeId));
      toast({
        title: "Jalur karir dihapus",
        description: "Jalur karir ini telah dihapus dari daftar tersimpan Anda",
        variant: "default",
      });
    } else {
      // Tambahkan node ke daftar tersimpan
      setSavedCareers([...savedCareers, nodeId]);
      toast({
        title: "Jalur karir disimpan",
        description: "Jalur karir ini telah ditambahkan ke daftar tersimpan Anda",
        variant: "default",
      });
    }
  };
  
  // Berbagi jalur karir
  const handleShareCareer = (e: React.MouseEvent, node: CareerNode) => {
    e.stopPropagation(); // Mencegah event menyebar ke handleNodeClick
    
    // Dalam produksi ini akan membuat URL untuk dibagikan
    // Untuk demo, kita hanya memberikan toast notification
    toast({
      title: "Bagikan Jalur Karir",
      description: `Tautan untuk membagikan jalur karir "${node.title}" telah disalin ke clipboard Anda`,
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="heatmap">Career Heatmap</TabsTrigger>
          <TabsTrigger value="list">Career List</TabsTrigger>
        </TabsList>
        
        {/* Heatmap View */}
        <TabsContent value="heatmap" className="space-y-4">
          {/* Color Legend untuk membantu pengguna memahami sistem warna */}
          <div className="p-3 bg-muted rounded-md mb-4">
            <h4 className="text-sm font-medium mb-2">Panduan Kesesuaian Karir:</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-50 to-green-100 border border-green-500 mr-1"></div>
                <span>Sangat Sesuai (90%+)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-500 mr-1"></div>
                <span>Sesuai (75-89%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-500 mr-1"></div>
                <span>Cukup Sesuai (60-74%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-500 mr-1"></div>
                <span>Perlu Upaya (40-59%)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-50 to-red-100 border border-red-500 mr-1"></div>
                <span>Gap Skill Besar (&lt;40%)</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerNodes.slice(0, 9).map((node) => (
              <Card 
                key={node.id}
                className={`cursor-pointer transition-all hover:shadow-lg border-2 ${getMatchScoreColor(node.matchScore)} relative group`}
                onClick={() => handleNodeClick(node)}
              >
                {/* Hover Insight Pop-up - hanya muncul saat hover */}
                <div className="absolute inset-0 bg-black/75 text-white rounded-sm p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 flex flex-col justify-between overflow-auto">
                  <div>
                    <h3 className="font-bold text-base mb-1">{node.title}</h3>
                    <p className="text-xs mb-3 opacity-90">{node.description}</p>
                    
                    {/* Skill Gap Analysis */}
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold mb-1 flex items-center">
                        <Star className="h-3 w-3 mr-1" />
                        Skill Gap
                      </h4>
                      <div className="space-y-1">
                        {node.requiredSkills.map((skill) => {
                          const isAcquired = userSkills.some(us => 
                            us.toLowerCase().includes(skill.toLowerCase()) ||
                            skill.toLowerCase().includes(us.toLowerCase())
                          );
                          return (
                            <div key={skill} className="flex items-center text-xs">
                              <div className={`w-2 h-2 rounded-full mr-1 ${isAcquired ? 'bg-green-400' : 'bg-red-400'}`}></div>
                              <span>{skill}</span>
                              {!isAcquired && (
                                <span className="ml-auto text-red-300">Perlu dikembangkan</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs mt-auto pt-2 border-t border-white/20">
                    <div className="flex justify-between items-center mb-1">
                      <span>Waktu transisi rata-rata:</span>
                      <span className="font-semibold">{node.timeToAchieve}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rekomendasi:</span>
                      <span className="font-semibold">
                        {node.matchScore >= 75 ? 'Sangat cocok untuk Anda!' : 
                         node.matchScore >= 60 ? 'Butuh sedikit pengembangan skill' : 
                         'Butuh pengembangan skill signifikan'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Card Content Normal */}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{node.title}</CardTitle>
                    <Badge variant="outline">{node.level}</Badge>
                  </div>
                  <CardDescription className="flex items-center">
                    <DollarSign className="h-3.5 w-3.5 mr-1" />
                    {node.salaryRange}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mb-2">
                    <p className="text-sm font-medium mb-1">Kesesuaian dengan Profil Anda:</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${node.matchScore}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-xs text-muted-foreground mt-1">{node.matchScore}%</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{node.timeToAchieve}</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" />
                      <span>Demand: {node.demandScore}%</span>
                    </div>
                  </div>
                  
                  {/* Action buttons for save and share */}
                  <div className="flex justify-end mt-2 space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => handleSaveCareer(e, node.id)}
                    >
                      {savedCareers.includes(node.id) ? (
                        <Bookmark className="h-4 w-4 text-primary" fill="currentColor" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                      <span className="sr-only">{savedCareers.includes(node.id) ? 'Hapus dari tersimpan' : 'Simpan jalur karir'}</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={(e) => handleShareCareer(e, node)}
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="sr-only">Bagikan jalur karir</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* List View */}
        <TabsContent value="list">
          <div className="space-y-2">
            {careerNodes.map((node) => (
              <div 
                key={node.id}
                className="flex items-center justify-between p-3 rounded-md border-l-4 cursor-pointer hover:bg-accent/5 group relative"
                style={{ borderLeftColor: node.matchScore >= 90 ? '#22c55e' : 
                         node.matchScore >= 75 ? '#10b981' : 
                         node.matchScore >= 60 ? '#eab308' : 
                         node.matchScore >= 40 ? '#f97316' : '#ef4444' }}
                onClick={() => handleNodeClick(node)}
              >
                {/* Hover Insight Pop-up - hanya muncul saat hover pada tampilan list */}
                <div className="absolute left-full ml-2 top-0 w-64 bg-black/90 text-white rounded p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 text-xs shadow-lg">
                  <h4 className="font-bold mb-1">Skill Gap:</h4>
                  <div className="space-y-1 mb-2">
                    {node.requiredSkills.map((skill) => {
                      const isAcquired = userSkills.some(us => 
                        us.toLowerCase().includes(skill.toLowerCase()) ||
                        skill.toLowerCase().includes(us.toLowerCase())
                      );
                      return (
                        <div key={skill} className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-1 ${isAcquired ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span>{skill}</span>
                          {!isAcquired && (
                            <span className="ml-auto text-red-300 text-[10px]">Perlu</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-white/20 pt-1">
                    <p className="text-[10px] opacity-80">{node.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getMatchScoreColor(node.matchScore)}`}>
                    <span className="font-bold text-lg">{node.matchScore}%</span>
                  </div>
                  <div>
                    <p className="font-medium">{node.title}</p>
                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                      <Badge variant="outline" className="mr-2 text-[10px] h-4">{node.level}</Badge>
                      <DollarSign className="h-3 w-3 mr-0.5" />
                      <span>{node.salaryRange}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3 mr-0.5" />
                      <span>{node.timeToAchieve}</span>
                      <TrendingUp className="h-3 w-3 ml-2 mr-0.5" />
                      <span>Market: {node.demandScore}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => handleSaveCareer(e, node.id)}
                  >
                    {savedCareers.includes(node.id) ? (
                      <Bookmark className="h-4 w-4 text-primary" fill="currentColor" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    onClick={(e) => handleShareCareer(e, node)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Career Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedNode && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedNode.title}
                  <Badge variant="outline" className="ml-2">{selectedNode.level}</Badge>
                </DialogTitle>
                <DialogDescription className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {selectedNode.salaryRange}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-2">
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Kesesuaian dengan Profil Anda</h4>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${selectedNode.matchScore}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-muted rounded-md">
                      <DollarSign className="h-4 w-4 mx-auto mb-1" />
                      <p className="text-xs font-medium">Gaji</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${userPreferences.salaryPriority}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                      <TrendingUp className="h-4 w-4 mx-auto mb-1" />
                      <p className="text-xs font-medium">Pertumbuhan</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${userPreferences.growthOpportunity}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                      <Heart className="h-4 w-4 mx-auto mb-1" />
                      <p className="text-xs font-medium">Work-Life</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${userPreferences.workLifeBalance}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded-md">
                      <Shield className="h-4 w-4 mx-auto mb-1" />
                      <p className="text-xs font-medium">Stabilitas</p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${userPreferences.jobSecurity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Deskripsi Posisi</h4>
                  <p className="text-sm text-muted-foreground">{selectedNode.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Skill yang Dibutuhkan</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.requiredSkills.map((skill) => {
                      const isAcquired = userSkills.some(us => 
                        us.toLowerCase().includes(skill.toLowerCase()) ||
                        skill.toLowerCase().includes(us.toLowerCase())
                      );
                      return (
                        <Badge 
                          key={skill} 
                          variant={isAcquired ? "default" : "outline"}
                          className={isAcquired ? "" : "text-muted-foreground"}
                        >
                          {isAcquired ? "✓ " : ""}{skill}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Potensi Pertumbuhan
                    </h4>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full" 
                        style={{ width: `${selectedNode.growthScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Briefcase className="h-4 w-4 mr-1" />
                      Permintaan Pasar
                    </h4>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${selectedNode.demandScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t mt-4 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="text-sm">Estimasi waktu pencapaian: <strong>{selectedNode.timeToAchieve}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveCareer(e, selectedNode.id);
                        }}
                      >
                        {savedCareers.includes(selectedNode.id) ? (
                          <>
                            <Bookmark className="h-4 w-4 mr-2 text-primary" fill="currentColor" />
                            Tersimpan
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4 mr-2" />
                            Simpan
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareCareer(e, selectedNode);
                        }}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Bagikan
                      </Button>
                      <Button onClick={() => setDetailOpen(false)}>
                        Tutup
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CareerPathHeatmap;