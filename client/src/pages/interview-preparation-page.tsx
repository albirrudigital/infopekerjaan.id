import MainLayout from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useInterviewPreparation } from "@/hooks/use-interview-preparation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, Clock, BookOpen, Award, BookOpenCheck, Brain, CheckCircle2, CircleX, BadgeHelp } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";

function InterviewPreparationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  const {
    useInterviewPerformance,
    useMockInterviews,
    useInterviewTips,
    useRecommendedTips
  } = useInterviewPreparation();
  
  const {
    data: performance,
    isLoading: isLoadingPerformance
  } = useInterviewPerformance();
  
  const {
    data: mockInterviews,
    isLoading: isLoadingInterviews
  } = useMockInterviews();
  
  const {
    data: recommendedTips,
    isLoading: isLoadingRecommendedTips
  } = useRecommendedTips(5);
  
  const {
    data: interviewTips,
    isLoading: isLoadingTips
  } = useInterviewTips({ limit: 10 });
  
  if (!user) {
    return null;
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Persiapan Wawancara Cerdas</h1>
            <p className="text-muted-foreground mt-1">
              Latih kemampuan wawancara dan tingkatkan peluang kesuksesan karir Anda
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button asChild>
              <Link href="/interview-preparation/create-session">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Buat Sesi Latihan Baru
              </Link>
            </Button>
          </div>
        </div>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="sessions">Sesi Latihan</TabsTrigger>
            <TabsTrigger value="tips">Tips & Saran</TabsTrigger>
            <TabsTrigger value="questions">Bank Pertanyaan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    Performa Wawancara
                  </CardTitle>
                  <CardDescription>
                    Ringkasan kemampuan wawancara Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPerformance ? (
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : !performance ? (
                    <div className="text-center py-6">
                      <BadgeHelp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Belum ada data performa wawancara. Selesaikan sesi latihan wawancara untuk melihat statistik performa Anda.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Total Wawancara</span>
                          <span className="font-bold">{performance.totalInterviews}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Skor Rata-rata</span>
                          <span className="font-bold">{performance.averageScore ? `${Math.round(performance.averageScore)}%` : "Belum ada"}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Skor Teknis</span>
                          <span className="font-bold">{performance.technicalScore ? `${Math.round(performance.technicalScore)}%` : "Belum ada"}</span>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">Skor Perilaku</span>
                          <span className="font-bold">{performance.behavioralScore ? `${Math.round(performance.behavioralScore)}%` : "Belum ada"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Skor Komunikasi</span>
                          <span className="font-bold">{performance.communicationScore ? `${Math.round(performance.communicationScore)}%` : "Belum ada"}</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Kekuatan Utama</h4>
                        {performance.strengthCategories && Object.keys(performance.strengthCategories).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(performance.strengthCategories).slice(0, 3).map(([category, _]) => (
                              <Badge key={category} variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Belum teridentifikasi</p>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Area Pengembangan</h4>
                        {performance.improvementCategories && Object.keys(performance.improvementCategories).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(performance.improvementCategories).slice(0, 3).map(([category, _]) => (
                              <Badge key={category} variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">Belum teridentifikasi</p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/interview-preparation/performance">
                      Lihat Analisis Lengkap
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Sesi Mendatang
                  </CardTitle>
                  <CardDescription>
                    Jadwal sesi latihan wawancara berikutnya
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingInterviews ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : !mockInterviews || mockInterviews.length === 0 ? (
                    <div className="text-center py-6">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Belum ada sesi latihan wawancara. Buat sesi baru untuk mulai berlatih.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mockInterviews
                        .filter(interview => interview.status === "scheduled")
                        .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
                        .slice(0, 3)
                        .map(interview => (
                          <Card key={interview.id} className="border-l-4 border-l-primary">
                            <CardContent className="p-4">
                              <div className="mb-1 flex items-center">
                                <h3 className="font-medium">{interview.title}</h3>
                                <Badge className="ml-2" variant="outline">
                                  {interview.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {interview.jobRoleTarget}
                              </p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                <span>{formatDate(new Date(interview.scheduledFor))}</span>
                                <span className="mx-2">•</span>
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>{interview.duration} menit</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      
                      {mockInterviews.filter(interview => interview.status === "scheduled").length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">
                            Tidak ada sesi wawancara terjadwal
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/interview-preparation/sessions">
                      Lihat Semua Sesi
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-primary" />
                    Tips untuk Anda
                  </CardTitle>
                  <CardDescription>
                    Rekomendasi berdasarkan performa wawancara Anda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingRecommendedTips ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : !recommendedTips || recommendedTips.length === 0 ? (
                    <div className="text-center py-6">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        Belum ada rekomendasi tips. Selesaikan beberapa sesi latihan wawancara untuk mendapatkan rekomendasi yang disesuaikan.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendedTips.map(tip => (
                        <div key={tip.id} className="border rounded-lg p-3 hover:border-primary transition-colors">
                          <Link href={`/interview-preparation/tips/${tip.id}`} className="block">
                            <h3 className="font-medium text-primary mb-1">{tip.title}</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline">{tip.category}</Badge>
                              <Badge variant="outline">{tip.difficultyLevel}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {tip.content.substring(0, 120)}
                              {tip.content.length > 120 ? '...' : ''}
                            </p>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/interview-preparation/tips">
                      Jelajahi Semua Tips
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Kemajuan Persiapan Wawancara</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                        <BookOpenCheck className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {isLoadingInterviews ? (
                          <Skeleton className="h-6 w-12 mx-auto" />
                        ) : (
                          mockInterviews?.filter(i => i.status === "completed").length || 0
                        )}
                      </h3>
                      <p className="text-muted-foreground">Wawancara Selesai</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                        <Brain className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {isLoadingPerformance ? (
                          <Skeleton className="h-6 w-12 mx-auto" />
                        ) : (
                          performance?.totalInterviews && performance.averageScore
                            ? `${Math.round(performance.averageScore)}%`
                            : "N/A"
                        )}
                      </h3>
                      <p className="text-muted-foreground">Skor Rata-rata</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {isLoadingPerformance ? (
                          <Skeleton className="h-6 w-12 mx-auto" />
                        ) : (
                          performance?.strengthCategories
                            ? Object.keys(performance.strengthCategories).length
                            : "0"
                        )}
                      </h3>
                      <p className="text-muted-foreground">Kekuatan Teridentifikasi</p>
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-3">
                        <CircleX className="h-8 w-8 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold">
                        {isLoadingPerformance ? (
                          <Skeleton className="h-6 w-12 mx-auto" />
                        ) : (
                          performance?.improvementCategories
                            ? Object.keys(performance.improvementCategories).length
                            : "0"
                        )}
                      </h3>
                      <p className="text-muted-foreground">Area Pengembangan</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sessions">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">Sesi Latihan Wawancara</CardTitle>
                    <CardDescription>
                      Kelola dan lihat semua sesi latihan wawancara Anda
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/interview-preparation/create-session">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Buat Sesi Baru
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingInterviews ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : !mockInterviews || mockInterviews.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">Belum Ada Sesi Latihan</h3>
                    <p className="text-muted-foreground mb-4">
                      Anda belum membuat sesi latihan wawancara apa pun. Buat sesi baru untuk mulai berlatih.
                    </p>
                    <Button asChild>
                      <Link href="/interview-preparation/create-session">
                        Buat Sesi Latihan Sekarang
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      <Button
                        variant="outline"
                        className={`${activeTab === "all" ? "bg-primary/10" : ""}`}
                        onClick={() => setActiveTab("all")}
                      >
                        Semua ({mockInterviews.length})
                      </Button>
                      <Button
                        variant="outline"
                        className={`${activeTab === "scheduled" ? "bg-primary/10" : ""}`}
                        onClick={() => setActiveTab("scheduled")}
                      >
                        Terjadwal ({mockInterviews.filter(i => i.status === "scheduled").length})
                      </Button>
                      <Button
                        variant="outline"
                        className={`${activeTab === "completed" ? "bg-primary/10" : ""}`}
                        onClick={() => setActiveTab("completed")}
                      >
                        Selesai ({mockInterviews.filter(i => i.status === "completed").length})
                      </Button>
                      <Button
                        variant="outline"
                        className={`${activeTab === "cancelled" ? "bg-primary/10" : ""}`}
                        onClick={() => setActiveTab("cancelled")}
                      >
                        Dibatalkan ({mockInterviews.filter(i => i.status === "cancelled").length})
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {(activeTab === "all" ? mockInterviews : 
                        mockInterviews.filter(i => i.status === activeTab))
                        .sort((a, b) => new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime())
                        .map(interview => (
                          <Card key={interview.id} className={`
                            border-l-4 
                            ${interview.status === "scheduled" ? "border-l-blue-500" : 
                              interview.status === "completed" ? "border-l-green-500" : 
                                "border-l-gray-400"}
                          `}>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                                <div>
                                  <Link href={`/interview-preparation/sessions/${interview.id}`}>
                                    <h3 className="font-medium text-lg hover:text-primary transition-colors">
                                      {interview.title}
                                    </h3>
                                  </Link>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {interview.jobRoleTarget}
                                  </p>
                                  <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <Badge variant={
                                      interview.status === "scheduled" ? "secondary" : 
                                      interview.status === "completed" ? "success" : 
                                      "outline"
                                    }>
                                      {interview.status === "scheduled" ? "Terjadwal" : 
                                       interview.status === "completed" ? "Selesai" : 
                                       "Dibatalkan"}
                                    </Badge>
                                    <span className="flex items-center text-muted-foreground">
                                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                      {formatDate(new Date(interview.scheduledFor))}
                                    </span>
                                    <span className="flex items-center text-muted-foreground">
                                      <Clock className="h-3.5 w-3.5 mr-1" />
                                      {interview.duration} menit
                                    </span>
                                    <Badge variant="outline">
                                      {interview.difficulty}
                                    </Badge>
                                    <Badge variant="outline">
                                      {interview.questionCount} pertanyaan
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="mt-4 md:mt-0 flex gap-2">
                                  {interview.status === "scheduled" && (
                                    <Button size="sm" asChild>
                                      <Link href={`/interview-preparation/sessions/${interview.id}/start`}>
                                        Mulai Sekarang
                                      </Link>
                                    </Button>
                                  )}
                                  
                                  {interview.status === "completed" && (
                                    <Button size="sm" variant="outline" asChild>
                                      <Link href={`/interview-preparation/sessions/${interview.id}/review`}>
                                        Lihat Hasil
                                      </Link>
                                    </Button>
                                  )}
                                  
                                  <Button size="sm" variant="outline" asChild>
                                    <Link href={`/interview-preparation/sessions/${interview.id}`}>
                                      Detail
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                      {(activeTab === "all" ? mockInterviews.length === 0 : 
                        mockInterviews.filter(i => i.status === activeTab).length === 0) && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            Tidak ada sesi wawancara {
                              activeTab === "scheduled" ? "terjadwal" : 
                              activeTab === "completed" ? "selesai" : 
                              activeTab === "cancelled" ? "dibatalkan" : ""
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tips">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Tips & Saran Wawancara</CardTitle>
                <CardDescription>
                  Pelajari cara meningkatkan keterampilan wawancara Anda dari para ahli
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTips ? (
                  <div className="space-y-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                  </div>
                ) : !interviewTips || interviewTips.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">Belum Ada Tips</h3>
                    <p className="text-muted-foreground">
                      Tidak ada tips wawancara yang tersedia saat ini. Silakan cek kembali nanti.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {interviewTips.map(tip => (
                      <Card key={tip.id} className="overflow-hidden hover:border-primary transition-colors">
                        <Link href={`/interview-preparation/tips/${tip.id}`}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <Badge className="mb-2">{tip.category}</Badge>
                              <Badge variant="outline">{tip.difficultyLevel}</Badge>
                            </div>
                            <CardTitle>{tip.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground line-clamp-3">
                              {tip.content.substring(0, 180)}
                              {tip.content.length > 180 ? '...' : ''}
                            </p>
                          </CardContent>
                          <CardFooter className="pt-0 flex justify-between text-sm text-muted-foreground">
                            <div className="flex flex-wrap gap-1">
                              {tip.targetIndustries && tip.targetIndustries.slice(0, 2).map((industry, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{industry}</Badge>
                              ))}
                            </div>
                            <Button variant="link" size="sm" className="p-0">
                              Baca Selengkapnya
                            </Button>
                          </CardFooter>
                        </Link>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/interview-preparation/tips">
                    Lihat Semua Tips
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Bank Pertanyaan Wawancara</CardTitle>
                <CardDescription>
                  Jelajahi pertanyaan wawancara umum dan berlatih jawaban Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpenCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium mb-1">Segera Hadir</h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    Fitur bank pertanyaan wawancara masih dalam pengembangan. Anda akan segera dapat mengakses 
                    berbagai pertanyaan wawancara untuk latihan individu.
                  </p>
                  <Button asChild>
                    <Link href="/interview-preparation/create-session">
                      Buat Sesi Latihan Sementara
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default InterviewPreparationPage;