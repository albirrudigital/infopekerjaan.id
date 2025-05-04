import React, { useState } from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useCareerSimulator } from '@/hooks/use-career-simulator';
import { useCareerSkills } from '@/hooks/use-career-skills';
import { 
  PlusCircle, 
  FileEdit, 
  Trash2, 
  Calendar, 
  Briefcase, 
  TrendingUp,
  DollarSign,
  Star,
  Heart,
  Share2,
  Download,
  Save,
  BookOpen,
  Lightbulb
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useEffect } from 'react';
import CareerPathHeatmap from '@/components/career-simulator/career-heatmap';
import MicroLearningRecommendations from '@/components/career-simulator/micro-learning-recommendations';

// Schema untuk form pembuatan skenario baru
const createScenarioSchema = z.object({
  name: z.string().min(3, 'Nama skenario minimal 3 karakter'),
  description: z.string().optional(),
  currentRole: z.string().min(1, 'Posisi saat ini harus diisi'),
  targetRole: z.string().min(1, 'Posisi target harus diisi'),
  timeframe: z.string().min(1, 'Timeline harus dipilih'),
});

// Schema untuk form pembuatan keputusan baru
const createDecisionSchema = z.object({
  description: z.string().min(3, 'Deskripsi keputusan minimal 3 karakter'),
  decisionType: z.string().min(1, 'Tipe keputusan harus dipilih'),
  timepoint: z.string().min(1, 'Timepoint harus dipilih'),
});

// Schema untuk form perbandingan skenario
const createComparisonSchema = z.object({
  name: z.string().min(3, 'Nama perbandingan minimal 3 karakter'),
  description: z.string().optional(),
  scenarioIds: z.array(z.number()).min(1, 'Minimal 1 skenario harus dipilih'),
  highlightedMetrics: z.array(z.string()).optional(),
});

// Schema untuk form preferensi pengguna
const updatePreferencesSchema = z.object({
  salaryPriority: z.number().min(0).max(100),
  workLifeBalance: z.number().min(0).max(100),
  growthOpportunity: z.number().min(0).max(100),
  jobSecurity: z.number().min(0).max(100),
  skillPreferences: z.array(z.string()).optional(),
  locationPreferences: z.array(z.string()).optional(),
});

const CareerSimulatorPage: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("scenarios");
  const [createScenarioOpen, setCreateScenarioOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [createDecisionOpen, setCreateDecisionOpen] = useState(false);
  const [createComparisonOpen, setCreateComparisonOpen] = useState(false);
  
  const { 
    scenarios,
    scenarioLoading,
    scenarioError,
    createScenarioMutation,
    updateScenarioMutation,
    deleteScenarioMutation,
    decisions,
    decisionsLoading,
    createDecisionMutation,
    comparisons,
    comparisonsLoading,
    createComparisonMutation,
    deleteComparisonMutation,
    preferences,
    preferencesLoading,
    updatePreferencesMutation,
    calculateOutcomeMutation
  } = useCareerSimulator();

  // State untuk visualisasi timeline
  const [timelineSteps, setTimelineSteps] = useState<any[]>([]);
  
  // Get user skills and preferences
  const {
    skills,
    skillsLoading,
    preferences: careerPreferences,
    preferencesLoading: careerPreferencesLoading,
    getSkillNames
  } = useCareerSkills();
  
  // Form untuk pembuatan skenario baru
  const scenarioForm = useForm<z.infer<typeof createScenarioSchema>>({
    resolver: zodResolver(createScenarioSchema),
    defaultValues: {
      name: '',
      description: '',
      currentRole: '',
      targetRole: '',
      timeframe: '1',
    },
  });

  // Form untuk pembuatan keputusan baru
  const decisionForm = useForm<z.infer<typeof createDecisionSchema>>({
    resolver: zodResolver(createDecisionSchema),
    defaultValues: {
      description: '',
      decisionType: 'skill',
      timepoint: '3',
    },
  });

  // Form untuk pembuatan perbandingan skenario
  const comparisonForm = useForm<z.infer<typeof createComparisonSchema>>({
    resolver: zodResolver(createComparisonSchema),
    defaultValues: {
      name: '',
      description: '',
      scenarioIds: [],
      highlightedMetrics: ['salary', 'growth', 'worklife'],
    },
  });

  // Form untuk pengaturan preferensi pengguna
  const preferencesForm = useForm<z.infer<typeof updatePreferencesSchema>>({
    resolver: zodResolver(updatePreferencesSchema),
    defaultValues: {
      salaryPriority: preferences?.salaryPriority || 50,
      workLifeBalance: preferences?.workLifeBalance || 50,
      growthOpportunity: preferences?.growthOpportunity || 50,
      jobSecurity: preferences?.jobSecurity || 50,
      skillPreferences: preferences?.skillPreferences || [],
      locationPreferences: preferences?.locationPreferences || [],
    },
  });

  // Update form values when preferences are loaded
  useEffect(() => {
    if (preferences) {
      preferencesForm.reset({
        salaryPriority: preferences.salaryPriority || 50,
        workLifeBalance: preferences.workLifeBalance || 50,
        growthOpportunity: preferences.growthOpportunity || 50,
        jobSecurity: preferences.jobSecurity || 50,
        skillPreferences: preferences.skillPreferences || [],
        locationPreferences: preferences.locationPreferences || [],
      });
    }
  }, [preferences, preferencesForm]);

  // Update timeline when decisions or selected scenario changes
  useEffect(() => {
    if (selectedScenario && decisions) {
      const scenarioDecisions = decisions.filter(d => d.scenarioId === selectedScenario);
      
      // Build timeline steps from decisions
      const timeline = scenarioDecisions.map(decision => ({
        id: decision.id,
        description: decision.description,
        timepoint: decision.timepoint,
        type: decision.decisionType,
        impact: decision.impact || {},
      }));
      
      // Sort by timepoint
      timeline.sort((a, b) => a.timepoint - b.timepoint);
      
      setTimelineSteps(timeline);
    }
  }, [selectedScenario, decisions]);

  // Handler untuk submit form pembuatan skenario
  const handleCreateScenario = async (values: z.infer<typeof createScenarioSchema>) => {
    try {
      await createScenarioMutation.mutateAsync({
        name: values.name,
        description: values.description || null,
        currentRole: values.currentRole,
        targetRole: values.targetRole,
        timeframe: parseInt(values.timeframe),
      });
      
      toast({
        title: 'Skenario berhasil dibuat',
        description: 'Skenario karir baru telah berhasil dibuat.',
      });
      
      setCreateScenarioOpen(false);
      scenarioForm.reset();
    } catch (error) {
      toast({
        title: 'Gagal membuat skenario',
        description: 'Terjadi kesalahan saat membuat skenario baru.',
        variant: 'destructive',
      });
    }
  };

  // Handler untuk submit form pembuatan keputusan
  const handleCreateDecision = async (values: z.infer<typeof createDecisionSchema>) => {
    if (!selectedScenario) return;
    
    try {
      await createDecisionMutation.mutateAsync({
        scenarioId: selectedScenario,
        description: values.description,
        decisionType: values.decisionType,
        timepoint: parseInt(values.timepoint),
        isActive: true,
        impact: {},
        metadata: {},
      });
      
      toast({
        title: 'Keputusan berhasil ditambahkan',
        description: 'Keputusan karir baru telah berhasil ditambahkan ke skenario.',
      });
      
      setCreateDecisionOpen(false);
      decisionForm.reset();
    } catch (error) {
      toast({
        title: 'Gagal menambahkan keputusan',
        description: 'Terjadi kesalahan saat menambahkan keputusan baru.',
        variant: 'destructive',
      });
    }
  };

  // Handler untuk submit form pembuatan perbandingan
  const handleCreateComparison = async (values: z.infer<typeof createComparisonSchema>) => {
    try {
      await createComparisonMutation.mutateAsync({
        name: values.name,
        description: values.description || null,
        scenarioIds: values.scenarioIds,
        highlightedMetrics: values.highlightedMetrics || [],
      });
      
      toast({
        title: 'Perbandingan berhasil dibuat',
        description: 'Perbandingan skenario karir baru telah berhasil dibuat.',
      });
      
      setCreateComparisonOpen(false);
      comparisonForm.reset();
    } catch (error) {
      toast({
        title: 'Gagal membuat perbandingan',
        description: 'Terjadi kesalahan saat membuat perbandingan baru.',
        variant: 'destructive',
      });
    }
  };

  // Handler untuk submit form preferensi pengguna
  const handleUpdatePreferences = async (values: z.infer<typeof updatePreferencesSchema>) => {
    try {
      await updatePreferencesMutation.mutateAsync({
        salaryPriority: values.salaryPriority,
        workLifeBalance: values.workLifeBalance,
        growthOpportunity: values.growthOpportunity,
        jobSecurity: values.jobSecurity,
        skillPreferences: values.skillPreferences || [],
        locationPreferences: values.locationPreferences || [],
      });
      
      toast({
        title: 'Preferensi berhasil diperbarui',
        description: 'Preferensi karir Anda telah berhasil diperbarui.',
      });
    } catch (error) {
      toast({
        title: 'Gagal memperbarui preferensi',
        description: 'Terjadi kesalahan saat memperbarui preferensi.',
        variant: 'destructive',
      });
    }
  };

  // Handler untuk menghapus skenario
  const handleDeleteScenario = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus skenario ini?')) {
      try {
        await deleteScenarioMutation.mutateAsync(id);
        
        toast({
          title: 'Skenario berhasil dihapus',
          description: 'Skenario karir telah berhasil dihapus.',
        });
        
        if (selectedScenario === id) {
          setSelectedScenario(null);
        }
      } catch (error) {
        toast({
          title: 'Gagal menghapus skenario',
          description: 'Terjadi kesalahan saat menghapus skenario.',
          variant: 'destructive',
        });
      }
    }
  };

  // Handler untuk menghapus perbandingan
  const handleDeleteComparison = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus perbandingan ini?')) {
      try {
        await deleteComparisonMutation.mutateAsync(id);
        
        toast({
          title: 'Perbandingan berhasil dihapus',
          description: 'Perbandingan skenario karir telah berhasil dihapus.',
        });
      } catch (error) {
        toast({
          title: 'Gagal menghapus perbandingan',
          description: 'Terjadi kesalahan saat menghapus perbandingan.',
          variant: 'destructive',
        });
      }
    }
  };

  // Handler untuk menghitung outcome skenario
  const handleCalculateOutcome = async (scenarioId: number) => {
    try {
      const outcome = await calculateOutcomeMutation.mutateAsync(scenarioId);
      
      toast({
        title: 'Outcome berhasil dihitung',
        description: 'Perhitungan outcome skenario karir telah selesai.',
      });
      
      return outcome;
    } catch (error) {
      toast({
        title: 'Gagal menghitung outcome',
        description: 'Terjadi kesalahan saat menghitung outcome skenario.',
        variant: 'destructive',
      });
    }
  };

  // Function to render skill gap analysis
  const renderSkillGapAnalysis = () => {
    if (!selectedScenario || !scenarios) return null;
    
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (!scenario) return null;
    
    // Mock skill gap data (will be replaced with real data from API)
    const requiredSkills = [
      { name: "React", status: "acquired", level: "advanced" },
      { name: "TypeScript", status: "acquired", level: "intermediate" },
      { name: "Node.js", status: "gap", level: "intermediate" },
      { name: "AWS", status: "gap", level: "basic" },
      { name: "UI/UX Design", status: "acquired", level: "basic" }
    ];
    
    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Skill Gap Analysis</h3>
          <Button variant="outline" size="sm">Lihat Detail</Button>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {requiredSkills.map((skill, i) => (
            <div key={i} className="flex items-center justify-between bg-card p-3 rounded-md border">
              <div className="flex items-center">
                <Badge variant={skill.status === "acquired" ? "default" : "outline"} className="mr-2">
                  {skill.status === "acquired" ? "✓" : "○"}
                </Badge>
                <div>
                  <p className="font-medium">{skill.name}</p>
                  <p className="text-xs text-muted-foreground">Level: {skill.level}</p>
                </div>
              </div>
              {skill.status === "gap" && (
                <Button variant="secondary" size="sm">Cari Kursus</Button>
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-muted/50 p-3 rounded-md mt-2">
          <p className="text-sm font-medium">Career Path Insight:</p>
          <p className="text-sm text-muted-foreground">
            Setelah menguasai Node.js dan AWS, Anda memenuhi 85% skill yang dibutuhkan untuk posisi {scenario.targetRole}.
          </p>
        </div>
      </div>
    );
  };

  // Function to render interactive career timeline
  const renderCareerTimeline = () => {
    if (!selectedScenario || !scenarios || timelineSteps.length === 0) return null;
    
    const scenario = scenarios.find(s => s.id === selectedScenario);
    if (!scenario) return null;
    
    return (
      <div className="mt-6 relative">
        <h3 className="text-lg font-semibold mb-4">Timeline Karir</h3>
        
        {/* Timeline track */}
        <div className="absolute left-7 top-10 bottom-2 w-0.5 bg-primary/30" />
        
        {/* Starting point */}
        <div className="relative z-10 flex items-center mb-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shrink-0">
            <Briefcase className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h4 className="font-medium">{scenario.currentRole}</h4>
            <p className="text-sm text-muted-foreground">Posisi Saat Ini</p>
          </div>
        </div>
        
        {/* Timeline steps */}
        {timelineSteps.map((step, index) => (
          <div key={step.id} className="relative z-10 flex items-center mb-6 ml-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary shrink-0 ${
              step.type === 'skill' ? 'bg-blue-100 text-blue-700' :
              step.type === 'education' ? 'bg-amber-100 text-amber-700' :
              step.type === 'job' ? 'bg-green-100 text-green-700' :
              'bg-muted'
            }`}>
              {step.type === 'skill' ? '💡' : 
               step.type === 'education' ? '🎓' : 
               step.type === 'job' ? '💼' : '📌'}
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <h4 className="font-medium">{step.description}</h4>
                <Badge variant="outline" className="ml-2">
                  {step.timepoint} bulan
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {step.type === 'skill' ? 'Pengembangan Skill' :
                 step.type === 'education' ? 'Pendidikan/Sertifikasi' :
                 step.type === 'job' ? 'Perubahan Pekerjaan' : 'Keputusan'}
              </p>
              
              {/* Impact badges if available */}
              {step.impact && Object.keys(step.impact).length > 0 && (
                <div className="flex gap-2 mt-1">
                  {step.impact.salary && (
                    <Badge variant="secondary" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {step.impact.salary > 0 ? '+' : ''}{step.impact.salary}%
                    </Badge>
                  )}
                  {step.impact.skills && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      +{step.impact.skills} skill
                    </Badge>
                  )}
                  {step.impact.worklife && (
                    <Badge variant="secondary" className="text-xs">
                      <Heart className="h-3 w-3 mr-1" />
                      {step.impact.worklife > 0 ? '+' : ''}{step.impact.worklife}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Target role */}
        <div className="relative z-10 flex items-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 border-2 border-primary text-primary shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h4 className="font-medium">{scenario.targetRole}</h4>
            <p className="text-sm text-muted-foreground">Posisi Target ({scenario.timeframe} tahun)</p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={() => setCreateDecisionOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Tambah Langkah
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Bagikan
          </Button>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Simpan
          </Button>
        </div>
      </div>
    );
  };

  // Function to render comparison radar chart (mock)
  const renderComparisonChart = (comparison: any) => {
    if (!comparison) return null;
    
    return (
      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <h3 className="text-base font-medium mb-2">Radar Chart Comparison</h3>
        <div className="aspect-square w-full max-w-md mx-auto flex items-center justify-center bg-card rounded-lg border">
          <p className="text-center text-muted-foreground">Radar chart akan tampil di sini</p>
        </div>
        
        <div className="grid grid-cols-2 mt-4 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Kelebihan Path A:</h4>
            <ul className="text-sm space-y-1">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <span>Peningkatan gaji lebih tinggi</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <span>Potensi karir jangka panjang</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Kelebihan Path B:</h4>
            <ul className="text-sm space-y-1">
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                <span>Work-life balance lebih baik</span>
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                <span>Stabilitas pekerjaan lebih tinggi</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Render app
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Simulator Jalur Karir</h1>
        <p className="text-muted-foreground">
          Jelajahi dan rencanakan jalur karir Anda untuk mencapai tujuan profesional
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="scenarios">Skenario</TabsTrigger>
          <TabsTrigger value="comparisons">Perbandingan</TabsTrigger>
          <TabsTrigger value="preferences">Preferensi</TabsTrigger>
          <TabsTrigger value="heatmap">Career Heatmap</TabsTrigger>
          <TabsTrigger value="learning">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Micro-Learning</span>
            </div>
          </TabsTrigger>
        </TabsList>
        
        {/* Tab Content: Skenario */}
        <TabsContent value="scenarios" className="space-y-4">
          {/* Panel atas: Daftar skenario dan tombol tambah */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Skenario Karir Saya</h2>
            <Dialog open={createScenarioOpen} onOpenChange={setCreateScenarioOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Buat Skenario Baru
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat Skenario Karir Baru</DialogTitle>
                  <DialogDescription>
                    Isi detail skenario karir yang ingin Anda eksplorasi.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...scenarioForm}>
                  <form onSubmit={scenarioForm.handleSubmit(handleCreateScenario)} className="space-y-4">
                    <FormField
                      control={scenarioForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Skenario</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Karir Data Scientist" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={scenarioForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deskripsi (Opsional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Jelaskan tujuan eksplorasi karir ini" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={scenarioForm.control}
                        name="currentRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posisi Saat Ini</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Junior Developer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={scenarioForm.control}
                        name="targetRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posisi Target</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Senior Data Scientist" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={scenarioForm.control}
                      name="timeframe"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeline (Tahun)</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih timeline" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 Tahun</SelectItem>
                              <SelectItem value="2">2 Tahun</SelectItem>
                              <SelectItem value="3">3 Tahun</SelectItem>
                              <SelectItem value="5">5 Tahun</SelectItem>
                              <SelectItem value="10">10 Tahun</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" disabled={createScenarioMutation.isPending}>
                        {createScenarioMutation.isPending ? 'Menyimpan...' : 'Simpan Skenario'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Panel konten: Grid skenario dan detail skenario terpilih */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panel kiri: Daftar skenario */}
            <div className="md:col-span-1 space-y-4">
              {scenarioLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ))
              ) : scenarios && scenarios.length > 0 ? (
                scenarios.map(scenario => (
                  <Card 
                    key={scenario.id} 
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${selectedScenario === scenario.id ? 'border-primary' : ''}`}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{scenario.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScenario(scenario.id);
                          }}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span>{scenario.timeframe} tahun</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="text-sm">
                        <div className="flex items-center mb-1">
                          <Briefcase className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>Dari: {scenario.currentRole}</span>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          <span>Ke: {scenario.targetRole}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center border rounded-lg p-6 text-center">
                  <p className="text-muted-foreground mb-4">Belum ada skenario karir</p>
                  <Button onClick={() => setCreateScenarioOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Buat Skenario
                  </Button>
                </div>
              )}
            </div>
            
            {/* Panel kanan: Detail skenario terpilih */}
            <div className="md:col-span-2">
              {selectedScenario && scenarios ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {scenarios.find(s => s.id === selectedScenario)?.name}
                        </CardTitle>
                        <CardDescription>
                          {scenarios.find(s => s.id === selectedScenario)?.description || 'Tidak ada deskripsi'}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleCalculateOutcome(selectedScenario)}>
                          Hitung Outcome
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileEdit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-6 space-y-6">
                    {/* Career path visualization */}
                    {renderCareerTimeline()}
                    
                    {/* Skill gap analysis */}
                    {renderSkillGapAnalysis()}
                    
                    {/* Add decision dialog */}
                    <Dialog open={createDecisionOpen} onOpenChange={setCreateDecisionOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Keputusan Karir</DialogTitle>
                          <DialogDescription>
                            Tambahkan langkah atau keputusan penting dalam jalur karir Anda.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Form {...decisionForm}>
                          <form onSubmit={decisionForm.handleSubmit(handleCreateDecision)} className="space-y-4">
                            <FormField
                              control={decisionForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Deskripsi Keputusan</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Contoh: Mengambil sertifikasi Cloud Architecture" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={decisionForm.control}
                                name="decisionType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tipe Keputusan</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Pilih tipe" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="skill">Pengembangan Skill</SelectItem>
                                        <SelectItem value="education">Pendidikan/Sertifikasi</SelectItem>
                                        <SelectItem value="job">Perubahan Pekerjaan</SelectItem>
                                        <SelectItem value="networking">Networking</SelectItem>
                                        <SelectItem value="other">Lainnya</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={decisionForm.control}
                                name="timepoint"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Timepoint (Bulan)</FormLabel>
                                    <Select 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Pilih bulan" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="1">1 Bulan</SelectItem>
                                        <SelectItem value="3">3 Bulan</SelectItem>
                                        <SelectItem value="6">6 Bulan</SelectItem>
                                        <SelectItem value="12">12 Bulan</SelectItem>
                                        <SelectItem value="18">18 Bulan</SelectItem>
                                        <SelectItem value="24">24 Bulan</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <DialogFooter>
                              <Button type="submit" disabled={createDecisionMutation.isPending}>
                                {createDecisionMutation.isPending ? 'Menyimpan...' : 'Tambah Keputusan'}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center border rounded-lg p-12 h-full text-center">
                  <p className="text-muted-foreground mb-4">Pilih skenario dari daftar atau buat yang baru</p>
                  <Button onClick={() => setCreateScenarioOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Buat Skenario Baru
                  </Button>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Tab Content: Perbandingan */}
        <TabsContent value="comparisons" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Perbandingan Skenario</h2>
            <Dialog open={createComparisonOpen} onOpenChange={setCreateComparisonOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Buat Perbandingan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat Perbandingan Skenario</DialogTitle>
                  <DialogDescription>
                    Bandingkan dua atau lebih skenario karir untuk melihat perbedaannya.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...comparisonForm}>
                  <form onSubmit={comparisonForm.handleSubmit(handleCreateComparison)} className="space-y-4">
                    <FormField
                      control={comparisonForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Perbandingan</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Data Science vs Product Management" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={comparisonForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deskripsi (Opsional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Jelaskan tujuan perbandingan ini" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Scenario selection would go here */}
                    
                    <DialogFooter>
                      <Button type="submit" disabled={createComparisonMutation.isPending}>
                        {createComparisonMutation.isPending ? 'Menyimpan...' : 'Buat Perbandingan'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {comparisonsLoading ? (
            <div className="space-y-4">
              {Array(2).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comparisons && comparisons.length > 0 ? (
            <div className="space-y-6">
              {comparisons.map(comparison => (
                <Card key={comparison.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{comparison.name}</CardTitle>
                        <CardDescription>{comparison.description || 'Tidak ada deskripsi'}</CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteComparison(comparison.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderComparisonChart(comparison)}
                    
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <FileEdit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Bagikan
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Ekspor PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border rounded-lg p-12 text-center">
              <p className="text-muted-foreground mb-4">Belum ada perbandingan skenario</p>
              <p className="text-sm text-muted-foreground mb-6">Buat minimal 2 skenario karir terlebih dahulu, kemudian bandingkan keduanya.</p>
              <Button onClick={() => setCreateComparisonOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Buat Perbandingan
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* Tab Content: Preferensi */}
        <TabsContent value="preferences" className="space-y-4">
          <h2 className="text-xl font-semibold">Preferensi Karir Saya</h2>
          <p className="text-muted-foreground">
            Tentukan prioritas dan preferensi karir Anda untuk menyesuaikan rekomendasi jalur karir.
          </p>
          
          <Card>
            <CardContent className="pt-6">
              {preferencesLoading ? (
                <div className="space-y-6">
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-5 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <Form {...preferencesForm}>
                  <form onSubmit={preferencesForm.handleSubmit(handleUpdatePreferences)} className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Prioritas Karir</h3>
                      
                      <FormField
                        control={preferencesForm.control}
                        name="salaryPriority"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Pendapatan/Gaji</FormLabel>
                              <span className="text-sm text-muted-foreground">{field.value}%</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={0}
                                max={100}
                                step={5}
                                defaultValue={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={preferencesForm.control}
                        name="workLifeBalance"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Work-Life Balance</FormLabel>
                              <span className="text-sm text-muted-foreground">{field.value}%</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={0}
                                max={100}
                                step={5}
                                defaultValue={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={preferencesForm.control}
                        name="growthOpportunity"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Peluang Pertumbuhan</FormLabel>
                              <span className="text-sm text-muted-foreground">{field.value}%</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={0}
                                max={100}
                                step={5}
                                defaultValue={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={preferencesForm.control}
                        name="jobSecurity"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Stabilitas Pekerjaan</FormLabel>
                              <span className="text-sm text-muted-foreground">{field.value}%</span>
                            </div>
                            <FormControl>
                              <Slider
                                min={0}
                                max={100}
                                step={5}
                                defaultValue={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between pt-4">
                      <Button type="submit" disabled={updatePreferencesMutation.isPending}>
                        {updatePreferencesMutation.isPending ? 'Menyimpan...' : 'Simpan Preferensi'}
                      </Button>
                      
                      <Button type="button" variant="outline">
                        Terapkan ke Semua Skenario
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
          
          <div className="bg-muted/30 rounded-lg p-4 mt-4">
            <h3 className="text-base font-medium mb-2">Insight Preferensi</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Berdasarkan preferensi Anda, jalur karir berikut mungkin cocok untuk Anda:
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-background rounded-md border">
                <div>
                  <p className="font-medium">Senior Data Engineer</p>
                  <p className="text-xs text-muted-foreground">Cocok 85% dengan preferensi Anda</p>
                </div>
                <Progress value={85} className="w-24" />
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-md border">
                <div>
                  <p className="font-medium">Product Manager</p>
                  <p className="text-xs text-muted-foreground">Cocok 78% dengan preferensi Anda</p>
                </div>
                <Progress value={78} className="w-24" />
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-md border">
                <div>
                  <p className="font-medium">DevOps Engineer</p>
                  <p className="text-xs text-muted-foreground">Cocok 72% dengan preferensi Anda</p>
                </div>
                <Progress value={72} className="w-24" />
              </div>
            </div>
            
            <Button className="w-full mt-4" variant="outline">
              Terapkan ke Skenario Baru
            </Button>
          </div>
        </TabsContent>
        
        {/* Tab Content: Career Heatmap */}
        <TabsContent value="heatmap" className="space-y-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Career Progression Heatmap</h2>
            <p className="text-muted-foreground">
              Visualisasi jalur karir potensial berdasarkan skill dan preferensi Anda
            </p>
          </div>
          
          {skillsLoading || careerPreferencesLoading ? (
            <div className="flex justify-center items-center h-72">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <CareerPathHeatmap 
              userSkills={getSkillNames()}
              userPreferences={careerPreferences || {
                salaryPriority: 50,
                workLifeBalance: 50,
                growthOpportunity: 50,
                jobSecurity: 50,
                skillPreferences: [],
                locationPreferences: []
              }}
              industry="Technology"
              currentRole={user?.profileData?.currentPosition || "Software Engineer"}
            />
          )}
        </TabsContent>
        
        {/* Tab Content: Micro-Learning */}
        <TabsContent value="learning" className="space-y-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Micro-Learning Recommendations</h2>
            <p className="text-muted-foreground">
              Temukan materi pembelajaran yang relevan dengan skill gap dan kebutuhan pengembangan karir Anda.
            </p>
          </div>
          
          <Card>
            <CardContent className="py-6">
              {selectedScenario && scenarios ? (
                <MicroLearningRecommendations 
                  skillsToImprove={[
                    "JavaScript", 
                    "React", 
                    "Node.js", 
                    "Cloud Architecture", 
                    "DevOps", 
                    "System Design"
                  ]}
                  currentLevel="intermediate"
                  selectedCareerNode={{
                    id: "senior-dev",
                    title: scenarios.find(s => s.id === selectedScenario)?.targetRole || "Senior Developer",
                    requiredSkills: ["JavaScript", "React", "Node.js", "Cloud Architecture", "System Design"]
                  }}
                />
              ) : (
                <div className="text-center py-10">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <h3 className="text-lg font-medium">Pilih skenario karir terlebih dahulu</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Untuk mendapatkan rekomendasi pembelajaran yang relevan, silakan pilih skenario karir Anda.
                  </p>
                  <Button variant="outline" onClick={() => setActiveTab("scenarios")}>
                    Pilih Skenario
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CareerSimulatorPage;