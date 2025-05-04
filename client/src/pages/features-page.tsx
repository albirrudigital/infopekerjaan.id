import React from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/layout/main-layout';
import FeatureChips from '@/components/ui/feature-chips';
import SalaryComparisonTool from '@/components/features/salary-comparison-tool';
import JobSharing from '@/components/features/job-sharing';
import { AccessibilityToggle } from '@/components/ui/accessibility-toggle';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import QuickApplyButton from '@/components/ui/quick-apply-button';
import JobCardSkeleton from '@/components/ui/job-card-skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Percent, 
  BarChart2, 
  Share2, 
  LayoutDashboard, 
  Building2, 
  Search, 
  Mail, 
  Database,
  Moon,
  Upload,
  Loader2,
} from 'lucide-react';

export default function FeaturesPage() {
  return (
    <MainLayout>
      <Helmet>
        <title>Fitur-fitur | InfoPekerjaan.id</title>
        <meta name="description" content="Jelajahi semua fitur yang tersedia di InfoPekerjaan.id, platform rekrutmen kerja terpercaya di Indonesia." />
      </Helmet>

      <section className="py-10 md:py-16 bg-muted">
        <div className="container px-4 mx-auto text-center">
          <Badge variant="outline" className="mb-4">Fitur-fitur</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Semua Fitur <span className="text-primary">InfoPekerjaan.id</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Nikmati berbagai fitur unggulan yang dirancang untuk mempermudah proses rekrutmen dan pencarian kerja Anda.
          </p>
          
          <div className="flex justify-center mb-12">
            <div className="max-w-3xl w-full">
              <FeatureChips />
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container px-4 mx-auto">
          <Tabs defaultValue="accessibility" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8">
              <TabsTrigger value="accessibility">Aksesibilitas</TabsTrigger>
              <TabsTrigger value="ui">Antarmuka</TabsTrigger>
              <TabsTrigger value="job-tools">Tools Pencari Kerja</TabsTrigger>
              <TabsTrigger value="employer-tools">Tools Employer</TabsTrigger>
              <TabsTrigger value="mobile">Kompatibilitas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="accessibility" className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Fitur Aksesibilitas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Eye className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Mode Aksesibilitas</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Mode aksesibilitas menyesuaikan tampilan untuk pengguna dengan keterbatasan penglihatan atau pembaca layar.
                    </p>
                    <div className="flex items-center gap-4">
                      <AccessibilityToggle />
                      <span className="text-sm text-muted-foreground">
                        ← Klik untuk mengaktifkan mode aksesibilitas
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Percent className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Kesesuaian Keahlian</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Algoritma kami secara otomatis mencocokkan keahlian Anda dengan kebutuhan lowongan dan menampilkan persentase kesesuaian.
                    </p>
                    <div className="flex items-center justify-between bg-muted p-3 rounded-md">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Frontend Developer</div>
                        <div className="text-xs text-muted-foreground">PT. Teknologi Maju</div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        85% Match
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="ui" className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Antarmuka Pengguna</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Moon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Mode Gelap/Terang</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Beralih antara mode gelap dan terang sesuai preferensi Anda untuk kenyamanan membaca.
                    </p>
                    <div className="flex items-center gap-4">
                      <ThemeToggle />
                      <span className="text-sm text-muted-foreground">
                        ← Klik untuk mengganti tema
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Loader2 className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Loading Animasi</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Loading skeleton yang teranimasi untuk memberi pengalaman yang lebih baik saat memuat konten.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <JobCardSkeleton />
                      <div className="hidden sm:block">
                        <JobCardSkeleton />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="job-tools" className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Tools untuk Pencari Kerja</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Apply Cepat</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Melamar pekerjaan dengan cepat dan mudah dengan fitur "Apply Cepat" kami.
                    </p>
                    <div className="mt-2">
                      <QuickApplyButton 
                        jobId={1} 
                        jobTitle="Frontend Developer" 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Share2 className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Berbagi Lowongan</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Berbagi lowongan pekerjaan dengan mudah ke berbagai platform media sosial.
                    </p>
                    <div className="mt-2">
                      <JobSharing 
                        jobId={1} 
                        jobTitle="Frontend Developer" 
                        companyName="PT. Teknologi Maju" 
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <BarChart2 className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Perbandingan Gaji</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Bandingkan gaji untuk berbagai posisi dan lokasi untuk mendapatkan referensi pasar yang akurat.
                    </p>
                    <div className="mt-2">
                      <SalaryComparisonTool />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="employer-tools" className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Tools untuk Employer</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Dashboard Analytics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Dashboard analitik yang komprehensif untuk memantau performa lowongan pekerjaan Anda.
                    </p>
                    <div className="bg-muted p-3 rounded-md grid grid-cols-3 gap-2 text-center">
                      <div className="p-2">
                        <div className="text-xl font-bold">245</div>
                        <div className="text-xs text-muted-foreground">Total Views</div>
                      </div>
                      <div className="p-2">
                        <div className="text-xl font-bold">36</div>
                        <div className="text-xs text-muted-foreground">Aplikasi</div>
                      </div>
                      <div className="p-2">
                        <div className="text-xl font-bold">14.7%</div>
                        <div className="text-xs text-muted-foreground">Conversion</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle>Multi-perusahaan</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Kelola beberapa perusahaan dari satu akun employer untuk memudahkan manajemen lowongan.
                    </p>
                    <div className="bg-muted p-3 rounded-md space-y-2">
                      <div className="flex items-center justify-between p-2 bg-background rounded-md">
                        <div className="font-medium">PT. Teknologi Maju</div>
                        <Badge variant="outline">3 Lowongan</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background rounded-md">
                        <div className="font-medium">CV Media Digital</div>
                        <Badge variant="outline">2 Lowongan</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            

            
            <TabsContent value="mobile" className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Kompatibilitas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                          <path d="M12 18h.01" />
                        </svg>
                      </div>
                      <CardTitle>Responsif Mobile</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Tampilan yang sepenuhnya responsif dan dioptimalkan untuk penggunaan mobile
                    </p>
                    <div className="flex justify-center">
                      <div className="border rounded-xl p-1 w-40 h-60 mx-auto flex flex-col">
                        <div className="bg-muted h-6 w-20 mx-auto rounded-full mb-2"></div>
                        <div className="bg-muted h-24 rounded-md mb-2 flex-none"></div>
                        <div className="space-y-1 flex-1">
                          <div className="bg-muted h-2 w-full rounded-md"></div>
                          <div className="bg-muted h-2 w-full rounded-md"></div>
                          <div className="bg-muted h-2 w-3/4 rounded-md"></div>
                        </div>
                        <div className="bg-muted h-6 w-full rounded-md mt-2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
                          <line x1="2" x2="22" y1="20" y2="20" />
                        </svg>
                      </div>
                      <CardTitle>Lintas Platform</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Platform kami berfungsi di semua perangkat dan browser modern.
                    </p>
                    <div className="flex justify-center gap-6">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                          <path d="M12 18h.01" />
                        </svg>
                        <span className="text-xs mt-1">Mobile</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
                          <line x1="2" x2="22" y1="20" y2="20" />
                        </svg>
                        <span className="text-xs mt-1">Desktop</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                          <line x1="12" x2="12" y1="18" y2="18" />
                        </svg>
                        <span className="text-xs mt-1">Tablet</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </MainLayout>
  );
}