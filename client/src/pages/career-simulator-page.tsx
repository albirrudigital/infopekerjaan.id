import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCareerSimulator } from "@/hooks/use-career-simulator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertCareerScenarioSchema } from "@shared/schema";
import { z } from "zod";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Plus, BarChart, Trash2, PenLine, ArchiveX } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Komponen ini akan ditambahkan nanti sebagai bagian dari implementasi lengkap
const ScenarioDetailPage = ({ scenarioId, onBack }: { scenarioId: number; onBack: () => void }) => {
  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onBack} className="mb-4">
        Kembali ke daftar skenario
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Detail Skenario</CardTitle>
          <CardDescription>
            Fitur detail skenario sedang dalam pengembangan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>ID Skenario: {scenarioId}</p>
          <p className="text-muted-foreground mt-4">
            Detail skenario, timeline visual, dan pemodelan keputusan akan tersedia pada rilis berikutnya.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const NewScenarioForm = ({ onCancel }: { onCancel: () => void }) => {
  const { createScenario, isCreatingScenario } = useCareerSimulator();
  
  const form = useForm<z.infer<typeof insertCareerScenarioSchema>>({
    resolver: zodResolver(insertCareerScenarioSchema),
    defaultValues: {
      name: "",
      description: "",
      currentRole: "",
      targetRole: "",
      timeframe: 5,
      startingSalary: 0,
      startingSkills: [],
      outcomes: {
        endRole: "",
        projectedSalary: {
          min: 0,
          max: 0,
          median: 0,
          percentile75: 0,
          percentile90: 0
        },
        acquiredSkills: [],
        marketAlignment: 0,
        satisfactionProjection: 0,
        employmentSecurity: 0,
        growthPotential: 0,
        comparableRoles: []
      }
    },
  });

  const onSubmit = (data: z.infer<typeof insertCareerScenarioSchema>) => {
    createScenario({
      ...data,
      // Inisialisasi startingSkills dengan struktur yang benar
      startingSkills: [
        {
          skills: [
            {
              id: 1,
              name: "Keterampilan Dasar",
              level: 0.5,
              relevance: 0.8,
              trending: false
            }
          ],
          category: "Keterampilan Umum",
          overallLevel: 0.5
        }
      ]
    });
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Skenario</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Karir sebagai Developer" {...field} />
              </FormControl>
              <FormDescription>
                Beri nama yang jelas untuk skenario karir Anda
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi singkat tentang skenario ini"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
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
            control={form.control}
            name="targetRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posisi Target</FormLabel>
                <FormControl>
                  <Input placeholder="Contoh: Senior Developer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="timeframe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jangka Waktu (tahun)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="startingSalary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gaji Awal (Rp)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={1000000}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isCreatingScenario}>
            {isCreatingScenario && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Buat Skenario
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

const ScenariosList = ({ onSelectScenario }: { onSelectScenario: (id: number) => void }) => {
  const { scenarios, isScenariosLoading, deleteScenario, isDeletingScenario } = useCareerSimulator();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isScenariosLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground mb-4">Belum ada skenario karir dibuat</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Skenario Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Buat Skenario Karir Baru</DialogTitle>
              <DialogDescription>
                Isi detail untuk skenario karir yang ingin Anda eksplorasi
              </DialogDescription>
            </DialogHeader>
            <NewScenarioForm onCancel={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Skenario Karir Anda</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Buat Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Buat Skenario Karir Baru</DialogTitle>
              <DialogDescription>
                Isi detail untuk skenario karir yang ingin Anda eksplorasi
              </DialogDescription>
            </DialogHeader>
            <NewScenarioForm onCancel={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-3 pr-4">
          {scenarios.map((scenario: any) => (
            <Card key={scenario.id} className="hover:bg-accent/50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {scenario.description || "Tidak ada deskripsi"}
                    </CardDescription>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => deleteScenario(scenario.id)}
                    disabled={isDeletingScenario}
                  >
                    {isDeletingScenario ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Posisi Saat Ini</p>
                    <p className="font-medium">{scenario.currentRole}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Posisi Target</p>
                    <p className="font-medium">{scenario.targetRole}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gaji Awal</p>
                    <p className="font-medium">{scenario.startingSalary.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jangka Waktu</p>
                    <p className="font-medium">{scenario.timeframe} tahun</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Badge variant="outline">{new Date(scenario.updatedAt).toLocaleDateString('id-ID')}</Badge>
                <Button onClick={() => onSelectScenario(scenario.id)} size="sm">
                  Detail
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const ComparisonsTab = () => {
  return (
    <div className="pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Skenario Karir</CardTitle>
          <CardDescription>
            Bandingkan beberapa skenario karir untuk memahami pilihan terbaik
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p>Fitur perbandingan skenario akan tersedia pada rilis berikutnya.</p>
            <p className="text-muted-foreground text-sm mt-2">
              Anda akan dapat membandingkan hasil dari berbagai skenario karir secara berdampingan untuk membuat keputusan yang lebih baik.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const PreferencesTab = () => {
  const { preferences, isPreferencesLoading, updatePreferences, isUpdatingPreferences } = useCareerSimulator();

  const form = useForm({
    defaultValues: {
      salaryPriority: 3,
      workLifeBalancePriority: 3,
      growthPotentialPriority: 3,
      jobSecurityPriority: 3,
    },
  });

  // Update form values when preferences are loaded
  useEffect(() => {
    if (preferences) {
      form.reset({
        salaryPriority: preferences.salaryPriority,
        workLifeBalancePriority: preferences.workLifeBalancePriority,
        growthPotentialPriority: preferences.growthPotentialPriority,
        jobSecurityPriority: preferences.jobSecurityPriority,
      });
    }
  }, [preferences, form]);

  const onSubmit = (data: any) => {
    updatePreferences(data);
  };

  if (isPreferencesLoading) {
    return (
      <div className="pt-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  return (
    <div className="pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Preferensi Karir</CardTitle>
          <CardDescription>
            Sesuaikan preferensi Anda untuk membuat simulasi yang lebih personal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="salaryPriority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioritas Gaji</FormLabel>
                    <FormControl>
                      <Input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Rendah (1)</span>
                      <span>Sedang (3)</span>
                      <span>Tinggi (5)</span>
                    </div>
                    <FormDescription>
                      Seberapa penting gaji dalam keputusan karir Anda?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="workLifeBalancePriority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioritas Keseimbangan Hidup-Kerja</FormLabel>
                    <FormControl>
                      <Input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Rendah (1)</span>
                      <span>Sedang (3)</span>
                      <span>Tinggi (5)</span>
                    </div>
                    <FormDescription>
                      Seberapa penting keseimbangan hidup-kerja dalam keputusan karir Anda?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="growthPotentialPriority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioritas Potensi Pertumbuhan</FormLabel>
                    <FormControl>
                      <Input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Rendah (1)</span>
                      <span>Sedang (3)</span>
                      <span>Tinggi (5)</span>
                    </div>
                    <FormDescription>
                      Seberapa penting potensi pertumbuhan karir dalam keputusan Anda?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jobSecurityPriority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioritas Keamanan Kerja</FormLabel>
                    <FormControl>
                      <Input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Rendah (1)</span>
                      <span>Sedang (3)</span>
                      <span>Tinggi (5)</span>
                    </div>
                    <FormDescription>
                      Seberapa penting keamanan kerja dalam keputusan karir Anda?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isUpdatingPreferences}>
                {isUpdatingPreferences && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Preferensi
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

const CareerSimulatorPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("skenario");
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | null>(null);

  if (!user) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Maaf, Anda harus login terlebih dahulu</h2>
          <p className="text-muted-foreground mb-6">
            Untuk mengakses Simulator Jalur Karir, silakan login atau daftar terlebih dahulu.
          </p>
          <Button asChild>
            <a href="/auth">Login / Daftar</a>
          </Button>
        </div>
      </div>
    );
  }

  const handleSelectScenario = (id: number) => {
    setSelectedScenarioId(id);
  };

  const handleBackToList = () => {
    setSelectedScenarioId(null);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dynamic Career Path Simulator</h1>
          <p className="text-muted-foreground mt-1">
            Simulasikan dan bandingkan berbagai jalur karir untuk membuat keputusan yang lebih baik
          </p>
        </div>
      </div>

      {selectedScenarioId ? (
        <ScenarioDetailPage scenarioId={selectedScenarioId} onBack={handleBackToList} />
      ) : (
        <Tabs
          defaultValue="skenario"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="skenario">Skenario</TabsTrigger>
            <TabsTrigger value="perbandingan">Perbandingan</TabsTrigger>
            <TabsTrigger value="preferensi">Preferensi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="skenario" className="space-y-4">
            <ScenariosList onSelectScenario={handleSelectScenario} />
          </TabsContent>
          
          <TabsContent value="perbandingan">
            <ComparisonsTab />
          </TabsContent>
          
          <TabsContent value="preferensi">
            <PreferencesTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default CareerSimulatorPage;