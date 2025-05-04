import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  MapPin,
  BriefcaseBusiness,
  DollarSign,
  Building,
  GraduationCap,
  Calendar,
  Upload,
  FileText,
  ExternalLink
} from "lucide-react";

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("description");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Fetch job details
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/jobs/${id}`],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0] as string);
      if (!response.ok) {
        throw new Error("Failed to fetch job details");
      }
      return response.json();
    },
  });

  // Check if user has already applied for this job
  const { data: applications } = useQuery({
    queryKey: ["/api/my-applications"],
    queryFn: async () => {
      if (!user || user.type !== "jobseeker") return null;
      
      const response = await fetch("/api/my-applications");
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      return response.json();
    },
    enabled: !!user && user.type === "jobseeker",
  });

  const hasApplied = applications?.some((app: any) => app.jobId === parseInt(id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check if file is PDF
      if (file.type !== "application/pdf") {
        toast({
          title: "Format file tidak valid",
          description: "Harap unggah file dalam format PDF",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Ukuran file terlalu besar",
          description: "Ukuran maksimum file adalah 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setCvFile(file);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Harap login terlebih dahulu",
        description: "Anda perlu login untuk melamar pekerjaan ini",
        variant: "destructive",
      });
      return;
    }
    
    if (!cvFile) {
      toast({
        title: "CV diperlukan",
        description: "Harap unggah CV Anda dalam format PDF",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("jobId", id);
      formData.append("cv", cvFile);
      formData.append("coverLetter", coverLetter);
      
      const response = await fetch("/api/applications", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit application");
      }
      
      toast({
        title: "Lamaran berhasil dikirim",
        description: "Perusahaan akan meninjau lamaran Anda",
      });
      
      setIsDialogOpen(false);
      setCoverLetter("");
      setCvFile(null);
    } catch (error) {
      toast({
        title: "Gagal mengirim lamaran",
        description: error instanceof Error ? error.message : "Silakan coba lagi nanti",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="bg-secondary-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start mb-6">
                  <Skeleton className="h-16 w-16 rounded" />
                  <div className="ml-4 flex-1">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <div className="flex items-center">
                      <Skeleton className="h-5 w-40" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-8 w-40 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout>
        <div className="bg-secondary-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h2 className="text-2xl font-bold text-secondary-900 mb-2">Lowongan Tidak Ditemukan</h2>
                <p className="text-secondary-600 mb-6">
                  Lowongan yang Anda cari tidak ditemukan atau telah dihapus.
                </p>
                <Button asChild>
                  <a href="/search">Kembali ke Pencarian</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { job, company } = data;

  return (
    <MainLayout>
      <Helmet>
        <title>{`${job.title} di ${company.name} - infopekerjaan.id`}</title>
        <meta 
          name="description" 
          content={`Lowongan kerja ${job.title} di ${company.name}. ${job.description.substring(0, 140)}...`} 
        />
      </Helmet>

      <div className="bg-secondary-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Job Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-secondary-100 rounded flex items-center justify-center">
                    {company.logo ? (
                      <img 
                        src={company.logo} 
                        alt={company.name} 
                        className="h-12 w-12 object-contain"
                        onError={(e) => {
                          const element = e.target as HTMLImageElement;
                          element.style.display = 'none';
                          element.parentElement!.innerText = company.name.charAt(0).toUpperCase();
                        }}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">
                        {company.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-secondary-900 mb-1">{job.title}</h1>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-secondary-600 mb-4">
                      <span className="font-medium text-primary">{company.name}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center text-secondary-600">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        <span>
                          Diposting {format(new Date(job.createdAt), "d MMMM yyyy", { locale: id })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 md:mt-0">
                    {user?.type === "jobseeker" && (
                      hasApplied ? (
                        <Button variant="outline" disabled>
                          Sudah Dilamar
                        </Button>
                      ) : (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>Lamar Sekarang</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleApply}>
                              <DialogHeader>
                                <DialogTitle>Lamar Pekerjaan</DialogTitle>
                                <DialogDescription>
                                  Lengkapi informasi berikut untuk melamar posisi {job.title} di {company.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="cv" className="font-medium">
                                    Upload CV (PDF, maks. 5MB)
                                  </Label>
                                  <div className="border border-dashed border-secondary-300 rounded-md p-4 text-center">
                                    <Input
                                      id="cv"
                                      type="file"
                                      accept=".pdf"
                                      onChange={handleFileChange}
                                      className="hidden"
                                    />
                                    <Label
                                      htmlFor="cv"
                                      className="flex flex-col items-center justify-center cursor-pointer"
                                    >
                                      {cvFile ? (
                                        <>
                                          <FileText className="w-10 h-10 text-primary mb-2" />
                                          <span className="text-sm font-medium text-secondary-900">
                                            {cvFile.name}
                                          </span>
                                          <span className="text-xs text-secondary-500 mt-1">
                                            {(cvFile.size / (1024 * 1024)).toFixed(2)} MB
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <Upload className="w-10 h-10 text-secondary-400 mb-2" />
                                          <span className="text-sm font-medium">Klik untuk unggah CV</span>
                                          <span className="text-xs text-secondary-500 mt-1">Format PDF, maks. 5MB</span>
                                        </>
                                      )}
                                    </Label>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="coverLetter" className="font-medium">
                                    Surat Lamaran (opsional)
                                  </Label>
                                  <Textarea
                                    id="coverLetter"
                                    placeholder="Ceritakan mengapa Anda tertarik dengan posisi ini dan mengapa Anda cocok..."
                                    value={coverLetter}
                                    onChange={(e) => setCoverLetter(e.target.value)}
                                    rows={5}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" disabled={isSubmitting || !cvFile}>
                                  {isSubmitting ? "Mengirim..." : "Kirim Lamaran"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )
                    )}
                    {!user && (
                      <Button asChild>
                        <a href="/auth?tab=login">Login untuk Melamar</a>
                      </Button>
                    )}
                    <Button variant="outline" asChild>
                      <a href={`/companies/${company.id}`}>Lihat Perusahaan</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardContent className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="description">Deskripsi</TabsTrigger>
                        <TabsTrigger value="requirements">Kualifikasi</TabsTrigger>
                      </TabsList>
                      <TabsContent value="description">
                        <div className="prose max-w-none prose-headings:text-secondary-900 prose-p:text-secondary-700">
                          <h2 className="text-xl font-semibold mb-4">Deskripsi Pekerjaan</h2>
                          {job.description.split('\n').map((paragraph: string, index: number) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="requirements">
                        <div className="prose max-w-none prose-headings:text-secondary-900 prose-p:text-secondary-700">
                          <h2 className="text-xl font-semibold mb-4">Persyaratan</h2>
                          {job.requirements.split('\n').map((paragraph: string, index: number) => (
                            <p key={index}>{paragraph}</p>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Detail Pekerjaan</h2>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-secondary-500 mt-0.5" />
                        <div>
                          <span className="block text-secondary-600 font-medium">Lokasi</span>
                          <span className="text-secondary-900">{job.location}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <BriefcaseBusiness className="w-5 h-5 text-secondary-500 mt-0.5" />
                        <div>
                          <span className="block text-secondary-600 font-medium">Tipe Pekerjaan</span>
                          <span className="text-secondary-900">
                            {job.type === "full-time" ? "Penuh Waktu" : 
                             job.type === "part-time" ? "Paruh Waktu" : 
                             job.type === "contract" ? "Kontrak" : 
                             job.type === "remote" ? "Remote" : job.type}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-secondary-500 mt-0.5" />
                        <div>
                          <span className="block text-secondary-600 font-medium">Gaji</span>
                          <span className="text-secondary-900">{job.salary}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Building className="w-5 h-5 text-secondary-500 mt-0.5" />
                        <div>
                          <span className="block text-secondary-600 font-medium">Industri</span>
                          <span className="text-secondary-900">{job.industry}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <GraduationCap className="w-5 h-5 text-secondary-500 mt-0.5" />
                        <div>
                          <span className="block text-secondary-600 font-medium">Jenjang Karir</span>
                          <span className="text-secondary-900">{job.careerLevel}</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-semibold mb-4">Tentang Perusahaan</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-shrink-0 h-10 w-10 bg-secondary-100 rounded flex items-center justify-center">
                        {company.logo ? (
                          <img 
                            src={company.logo} 
                            alt={company.name} 
                            className="h-8 w-8 object-contain"
                            onError={(e) => {
                              const element = e.target as HTMLImageElement;
                              element.style.display = 'none';
                              element.parentElement!.innerText = company.name.charAt(0).toUpperCase();
                            }}
                          />
                        ) : (
                          <span className="text-lg font-bold text-primary">
                            {company.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-secondary-900">{company.name}</h4>
                        <p className="text-sm text-secondary-600">{company.industry}</p>
                      </div>
                    </div>
                    <p className="text-secondary-700 text-sm line-clamp-4 mb-3">
                      {company.description}
                    </p>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={`/companies/${company.id}`}>
                        <Building className="mr-2 h-4 w-4" />
                        Lihat Profil Perusahaan
                      </a>
                    </Button>
                    {company.website && (
                      <Button variant="ghost" size="sm" asChild className="w-full mt-2">
                        <a href={company.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Kunjungi Website
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetailPage;
