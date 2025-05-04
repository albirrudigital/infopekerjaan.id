import MainLayout from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useInterviewPreparation } from "@/hooks/use-interview-preparation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Clock, ArrowLeft } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { formatDate } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Judul sesi harus minimal 3 karakter",
  }),
  jobRoleTarget: z.string().min(2, {
    message: "Target posisi pekerjaan harus diisi",
  }),
  description: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"], {
    required_error: "Pilih tingkat kesulitan",
  }),
  questionCount: z.number().min(3).max(20),
  duration: z.number().min(15).max(120),
  scheduledFor: z.date({
    required_error: "Pilih tanggal dan waktu",
  }),
  settings: z.object({
    includeCompanySpecific: z.boolean().default(false),
    focusTechnical: z.number().default(50),
    focusBehavioral: z.number().default(50),
    allowReviewBeforeSubmit: z.boolean().default(true),
  }).optional(),
});

function InterviewSessionCreatePage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { useCreateMockInterview } = useInterviewPreparation();
  const createMockInterview = useCreateMockInterview();
  
  // Form definition
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      jobRoleTarget: "",
      description: "",
      questionCount: 5,
      duration: 30,
      settings: {
        includeCompanySpecific: false,
        focusTechnical: 50,
        focusBehavioral: 50,
        allowReviewBeforeSubmit: true,
      },
    },
  });
  
  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMockInterview.mutateAsync(values);
      navigate("/interview-preparation");
    } catch (error) {
      console.error("Error creating interview session:", error);
    }
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="ghost" className="pl-0 mb-2" asChild>
            <Link href="/interview-preparation">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">Buat Sesi Wawancara Baru</h1>
          <p className="text-muted-foreground mt-1">
            Sesuaikan sesi latihan wawancara dengan kebutuhan dan tujuan karir Anda
          </p>
        </div>
        
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Informasi Sesi Wawancara</CardTitle>
            <CardDescription>
              Sesuaikan sesi wawancara Anda dengan mengisi detail berikut
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Judul Sesi</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Persiapan Wawancara Software Engineer" {...field} />
                          </FormControl>
                          <FormDescription>
                            Berikan nama yang jelas untuk sesi wawancara Anda
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="jobRoleTarget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Posisi</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Frontend Developer" {...field} />
                          </FormControl>
                          <FormDescription>
                            Posisi atau peran pekerjaan yang menjadi target Anda
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
                          <FormLabel>Deskripsi (Opsional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Masukkan detail atau catatan tambahan tentang sesi ini..." 
                              {...field}
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tingkat Kesulitan</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih tingkat kesulitan" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Pemula (Dasar)</SelectItem>
                              <SelectItem value="intermediate">Menengah</SelectItem>
                              <SelectItem value="advanced">Mahir</SelectItem>
                              <SelectItem value="expert">Ahli (Lanjutan)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Sesuaikan dengan tingkat pengalaman dan persiapan Anda
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="questionCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah Pertanyaan: {field.value}</FormLabel>
                          <FormControl>
                            <Slider
                              min={3}
                              max={20}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Pilih antara 3-20 pertanyaan untuk sesi wawancara Anda
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Durasi: {field.value} menit</FormLabel>
                          <FormControl>
                            <Slider
                              min={15}
                              max={120}
                              step={5}
                              defaultValue={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                            />
                          </FormControl>
                          <FormDescription>
                            Perkiraan durasi sesi wawancara (15-120 menit)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="scheduledFor"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Tanggal dan Waktu</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP HH:mm")
                                  ) : (
                                    <span>Pilih tanggal dan waktu</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  // Set time to default of noon if no previous time
                                  if (date) {
                                    const newDate = new Date(date);
                                    if (!field.value) {
                                      newDate.setHours(12, 0, 0, 0);
                                    } else {
                                      newDate.setHours(
                                        field.value.getHours(),
                                        field.value.getMinutes(),
                                        0,
                                        0
                                      );
                                    }
                                    field.onChange(newDate);
                                  }
                                }}
                                fromDate={new Date()}
                                initialFocus
                              />
                              <div className="p-3 border-t border-border">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Waktu:</span>
                                  </div>
                                  <select
                                    className="border border-input rounded px-2 py-1"
                                    value={field.value ? `${field.value.getHours()}:${field.value.getMinutes().toString().padStart(2, '0')}` : '12:00'}
                                    onChange={(e) => {
                                      const [hours, minutes] = e.target.value.split(':').map(Number);
                                      const newDate = field.value ? new Date(field.value) : new Date();
                                      newDate.setHours(hours, minutes, 0, 0);
                                      field.onChange(newDate);
                                    }}
                                  >
                                    {Array.from({ length: 24 }).map((_, hour) => (
                                      Array.from({ length: 4 }).map((_, minuteIdx) => {
                                        const minute = minuteIdx * 15;
                                        return (
                                          <option 
                                            key={`${hour}:${minute}`}
                                            value={`${hour}:${minute.toString().padStart(2, '0')}`}
                                          >
                                            {`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`}
                                          </option>
                                        );
                                      })
                                    )).flat()}
                                  </select>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Pilih kapan Anda ingin melakukan sesi wawancara ini
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-lg font-medium mb-4">Pengaturan Lanjutan</h3>
                  
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="settings.focusTechnical"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Distribusi Jenis Pertanyaan</FormLabel>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                            <span>Teknis: {field.value}%</span>
                            <span>Perilaku: {100 - field.value}%</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={10}
                              defaultValue={[field.value]}
                              onValueChange={(vals) => {
                                field.onChange(vals[0]);
                                form.setValue("settings.focusBehavioral", 100 - vals[0]);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Sesuaikan keseimbangan antara pertanyaan teknis dan perilaku
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/interview-preparation")}
                    >
                      Batal
                    </Button>
                    <Button type="submit" disabled={createMockInterview.isPending}>
                      {createMockInterview.isPending ? "Menyimpan..." : "Buat Sesi Wawancara"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

export default InterviewSessionCreatePage;