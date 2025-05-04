import React from 'react';
import { Helmet } from 'react-helmet';
import MainLayout from '@/components/layout/main-layout';
import { ProfileCompletionDashboard } from '@/components/profile-completion/profile-completion-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { useProfileCompletion } from '@/hooks/use-profile-completion';

export default function ProfileCompletionPage() {
  const { user } = useAuth();
  const { percentageData, isLoadingPercentage } = useProfileCompletion();
  
  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Akses Tidak Diizinkan</AlertTitle>
            <AlertDescription>
              Anda harus login terlebih dahulu untuk mengakses halaman ini.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-4">
            <Link href="/auth">
              <Button>Masuk ke Akun</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <Helmet>
        <title>Kelengkapan Profil | InfoPekerjaan.id</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Kelengkapan Profil
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Lengkapi profil Anda untuk meningkatkan peluang mendapatkan pekerjaan impian.
          </p>
          
          {/* Tips dan Penjelasan */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Mengapa Profil Lengkap Itu Penting?</CardTitle>
              <CardDescription>
                Profil yang lengkap meningkatkan peluang Anda untuk ditemukan oleh perusahaan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Terlihat oleh Rekruter</h4>
                    <p className="text-sm text-muted-foreground">
                      Profil lengkap memiliki peluang 70% lebih tinggi untuk dilihat oleh rekruter
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Lebih Banyak Tawaran</h4>
                    <p className="text-sm text-muted-foreground">
                      Pengguna dengan profil lengkap menerima 3x lebih banyak tawaran pekerjaan
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Lamaran Diperhatikan</h4>
                    <p className="text-sm text-muted-foreground">
                      Lamaran dari profil lengkap mendapat respon 40% lebih cepat
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="rounded-full bg-green-100 p-1 mr-2 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Pencarian Khusus</h4>
                    <p className="text-sm text-muted-foreground">
                      Alat pencarian dioptimalkan untuk menampilkan profil lengkap lebih dahulu
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Call to Action berdasarkan persentase profil */}
              {!isLoadingPercentage && percentageData && (
                <div className="mt-4 pt-4 border-t">
                  {percentageData.percentage < 100 ? (
                    <Alert className="bg-blue-50 border-blue-200">
                      <div className="flex">
                        <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
                        <div>
                          <AlertTitle className="text-blue-600">Profil Anda belum lengkap!</AlertTitle>
                          <AlertDescription className="text-blue-600">
                            Lengkapi profil Anda untuk meningkatkan peluang mendapatkan pekerjaan. 
                            Dengan menyelesaikan {Math.round(100 - percentageData.percentage)}% lagi, 
                            profil Anda akan sempurna!
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ) : (
                    <Alert className="bg-green-50 border-green-200">
                      <div className="flex">
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                        <div>
                          <AlertTitle className="text-green-600">Selamat! Profil Anda sudah lengkap!</AlertTitle>
                          <AlertDescription className="text-green-600">
                            Anda telah menyelesaikan seluruh item kelengkapan profil. 
                            Profil Anda sekarang memiliki peluang terbaik untuk ditemukan oleh rekruter.
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Gamified Dashboard */}
          <ProfileCompletionDashboard />
        </div>
      </div>
    </MainLayout>
  );
}