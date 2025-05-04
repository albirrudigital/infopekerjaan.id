import React, { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import MainLayout from "@/components/layout/main-layout";
import JobCard from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building, 
  MapPin, 
  Globe, 
  Users, 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Image, 
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const CompanyProfilePage = () => {
  const { id } = useParams<{ id: string }>();

  // Fetch company details and jobs
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/companies/${id}`],
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0] as string);
      if (!response.ok) {
        throw new Error("Failed to fetch company details");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="bg-secondary-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-start mb-6">
                  <Skeleton className="h-20 w-20 rounded" />
                  <div className="ml-4 flex-1">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-5 w-40 mb-4" />
                    <div className="flex gap-4">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-8 w-40 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <Skeleton className="h-8 w-40 mb-4" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="mb-4 pb-4 border-b border-secondary-200 last:border-0">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <div className="flex gap-2 mb-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
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
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-2xl font-bold text-secondary-900 mb-2">Perusahaan Tidak Ditemukan</h2>
                <p className="text-secondary-600 mb-6">
                  Perusahaan yang Anda cari tidak ditemukan atau telah dihapus.
                </p>
                <Button asChild>
                  <a href="/companies">Kembali ke Daftar Perusahaan</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { company, jobs } = data;

  // Get a default logo if none provided
  const companyLogo = company.logo || `https://logo.clearbit.com/${company.name.toLowerCase().replace(/\s/g, "")}.com`;
  
  // Sample company photos for gallery
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  
  // Mock gallery images based on company data
  const galleryImages = [
    `https://source.unsplash.com/random/800x600?office,${company.industry.toLowerCase().replace(/\s/g, "")}`,
    `https://source.unsplash.com/random/800x600?workspace,${company.industry.toLowerCase().replace(/\s/g, "")}`,
    `https://source.unsplash.com/random/800x600?team,${company.industry.toLowerCase().replace(/\s/g, "")}`,
    `https://source.unsplash.com/random/800x600?meeting,${company.industry.toLowerCase().replace(/\s/g, "")}`
  ];
  
  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % galleryImages.length);
  };
  
  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <MainLayout>
      <Helmet>
        <title>{`${company.name} - Profil Perusahaan | infopekerjaan.id`}</title>
        <meta 
          name="description" 
          content={`Profil perusahaan ${company.name}. ${company.description.substring(0, 140)}...`} 
        />
      </Helmet>

      <div className="bg-secondary-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Company Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6 mb-6">
                <div className="flex-shrink-0 h-20 w-20 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <img 
                    src={companyLogo} 
                    alt={company.name} 
                    className="h-16 w-16 object-contain"
                    onError={(e) => {
                      const element = e.target as HTMLImageElement;
                      element.style.display = 'none';
                      element.parentElement!.innerHTML = `<span class="text-3xl font-bold text-primary">${company.name.charAt(0).toUpperCase()}</span>`;
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-secondary-900 mb-1">{company.name}</h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-secondary-600 mb-4">
                    <span>{company.industry}</span>
                    <span>•</span>
                    <span>{company.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center text-secondary-600">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      <span>{company.location}</span>
                    </div>
                    {company.website && (
                      <div className="flex items-center text-secondary-600">
                        <Globe className="h-4 w-4 mr-1.5" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {company.website.replace(/(^\w+:|^)\/\//, '')}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center text-secondary-600">
                      <Briefcase className="h-4 w-4 mr-1.5" />
                      <span>{jobs.length} lowongan aktif</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Tentang Perusahaan</h2>
                <div className="text-secondary-700 whitespace-pre-line">
                  {company.description}
                </div>
              </div>

              {company.website && (
                <div className="mt-6">
                  <Button asChild>
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Kunjungi Website
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {/* Company Jobs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <Tabs defaultValue="jobs">
                <TabsList className="mb-6">
                  <TabsTrigger value="jobs" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Lowongan Kerja ({jobs.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="about" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>Tentang</span>
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    <span>Galeri</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="jobs">
                  <h2 className="text-xl font-semibold mb-6">Lowongan Tersedia</h2>
                  {jobs.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-secondary-600 mb-2">Belum ada lowongan yang tersedia</p>
                      <p className="text-secondary-500 text-sm">Kunjungi lagi nanti untuk melihat lowongan terbaru</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map((job: any) => (
                        <JobCard key={job.id} job={{ ...job, company }} />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="about">
                  <h2 className="text-xl font-semibold mb-6">Tentang {company.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        <span className="font-medium">Industri</span>
                      </div>
                      <p className="text-secondary-700 ml-7">{company.industry}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="font-medium">Lokasi</span>
                      </div>
                      <p className="text-secondary-700 ml-7">{company.location}</p>
                    </div>
                    {company.website && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-5 w-5 text-primary" />
                          <span className="font-medium">Website</span>
                        </div>
                        <p className="text-secondary-700 ml-7">
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {company.website}
                          </a>
                        </p>
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <span className="font-medium">Lowongan Aktif</span>
                      </div>
                      <p className="text-secondary-700 ml-7">{jobs.length} lowongan</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="font-medium">Deskripsi Perusahaan</span>
                    </div>
                    <div className="text-secondary-700 ml-7 whitespace-pre-line">
                      {company.description}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="gallery">
                  <h2 className="text-xl font-semibold mb-6">Galeri {company.name}</h2>
                  
                  <div className="mb-8">
                    <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
                      <DialogContent className="max-w-4xl p-0 overflow-hidden">
                        <div className="relative aspect-video bg-black">
                          <img 
                            src={galleryImages[selectedImage]} 
                            alt={`${company.name} workplace`} 
                            className="w-full h-full object-contain"
                          />
                          <button 
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </button>
                          <button 
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </button>
                          <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                            {selectedImage + 1} / {galleryImages.length}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {galleryImages.map((image, index) => (
                        <DialogTrigger key={index} asChild>
                          <div 
                            className="relative aspect-square cursor-pointer rounded-md overflow-hidden border border-secondary-200 hover:border-primary transition-colors"
                            onClick={() => {
                              setSelectedImage(index);
                              setGalleryOpen(true);
                            }}
                          >
                            <img 
                              src={image} 
                              alt={`${company.name} workspace ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </DialogTrigger>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      <h3 className="font-medium text-lg">Keunggulan Lingkungan Kerja</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-secondary-200 rounded-md p-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">Budaya kerja kolaboratif</span>
                        </div>
                        <p className="text-secondary-600 ml-6 text-sm">Mengutamakan kerja tim dan saling mendukung</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">Lingkungan kerja fleksibel</span>
                        </div>
                        <p className="text-secondary-600 ml-6 text-sm">Work-life balance sebagai prioritas</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">Pengembangan karir</span>
                        </div>
                        <p className="text-secondary-600 ml-6 text-sm">Kesempatan pembelajaran dan pelatihan berkelanjutan</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">Fasilitas modern</span>
                        </div>
                        <p className="text-secondary-600 ml-6 text-sm">Ruang kerja nyaman dan peralatan terkini</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CompanyProfilePage;
