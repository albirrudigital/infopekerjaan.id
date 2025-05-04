import MainLayout from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useInterviewPreparation } from "@/hooks/use-interview-preparation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, ArrowRight, CheckCircle2, XCircle, AlertCircle, Star, Clock, CalendarIcon, BarChart, BookText, MessageSquare, Lightbulb } from "lucide-react";
import { Link, useParams } from "wouter";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

function InterviewSessionReviewPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const sessionId = parseInt(params.id);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get interview data
  const {
    useMockInterview,
    useMockInterviewQuestions,
    useInterviewPerformance
  } = useInterviewPreparation();
  
  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError
  } = useMockInterview(sessionId);
  
  const {
    data: questions,
    isLoading: isLoadingQuestions
  } = useMockInterviewQuestions(sessionId);
  
  const {
    data: performance,
    isLoading: isLoadingPerformance
  } = useInterviewPerformance(user?.id);
  
  if (!user) {
    return null;
  }
  
  if (isLoadingSession || isLoadingQuestions || isLoadingPerformance) {
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
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-1/3 mb-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  if (sessionError || !session || !questions || questions.length === 0) {
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
            <h1 className="text-3xl font-bold text-primary">Hasil Tidak Ditemukan</h1>
            <p className="text-muted-foreground mt-1">
              Maaf, hasil sesi wawancara yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.
            </p>
          </div>
          
          <Button asChild>
            <Link href="/interview-preparation">
              Kembali ke Persiapan Wawancara
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  if (session.status !== "completed") {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <Button variant="ghost" className="pl-0 mb-2" asChild>
              <Link href={`/interview-preparation/sessions/${sessionId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-primary">Sesi Belum Selesai</h1>
            <p className="text-muted-foreground mt-1">
              Sesi wawancara ini belum selesai. Hasil evaluasi hanya tersedia setelah sesi selesai.
            </p>
          </div>
          
          <Button asChild>
            <Link href={`/interview-preparation/sessions/${sessionId}`}>
              Kembali ke Detail Sesi
            </Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  const answeredQuestions = questions.filter(q => q.userResponse);
  const answeredPercentage = (answeredQuestions.length / questions.length) * 100;
  
  // Calculate scores
  const technicalQuestions = questions.filter(q => q.category === "technical");
  const behavioralQuestions = questions.filter(q => q.category === "behavioral");
  
  const technicalAnswered = technicalQuestions.filter(q => q.userResponse && q.score !== null);
  const behavioralAnswered = behavioralQuestions.filter(q => q.userResponse && q.score !== null);
  
  const technicalScore = technicalAnswered.length > 0
    ? Math.round(technicalAnswered.reduce((acc, q) => acc + (q.score || 0), 0) / technicalAnswered.length * 100)
    : 0;
    
  const behavioralScore = behavioralAnswered.length > 0
    ? Math.round(behavioralAnswered.reduce((acc, q) => acc + (q.score || 0), 0) / behavioralAnswered.length * 100)
    : 0;
    
  const overallScore = answeredQuestions.length > 0
    ? Math.round(answeredQuestions.reduce((acc, q) => acc + (q.score || 0), 0) / answeredQuestions.length * 100)
    : 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };
  
  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Sangat Baik</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Cukup Baik</Badge>;
    return <Badge className="bg-red-100 text-red-800">Perlu Ditingkatkan</Badge>;
  };
  
  const getStarRating = (score: number) => {
    const stars = [];
    const fullStars = Math.floor(score / 20); // 0-100 to 0-5 stars
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-5 w-5 text-gray-300" />);
      }
    }
    
    return <div className="flex">{stars}</div>;
  };
  
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-1">Hasil Wawancara</h1>
              <p className="text-xl text-muted-foreground">{session.title}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge>{session.difficulty}</Badge>
                <Badge variant="outline">{questions.length} pertanyaan</Badge>
                <Badge className="bg-green-100 text-green-700">Selesai</Badge>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Unduh Hasil
              </Button>
              <Button asChild>
                <Link href="/interview-preparation/new">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Buat Sesi Baru
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="answers">Jawaban & Evaluasi</TabsTrigger>
            <TabsTrigger value="tips">Rekomendasi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Ringkasan Hasil</CardTitle>
                    <CardDescription>
                      Evaluasi performa Anda pada sesi wawancara untuk posisi {session.jobRoleTarget}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Skor Keseluruhan</h3>
                        <div className={`text-4xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
                          {overallScore}%
                        </div>
                        {getStarRating(overallScore)}
                      </div>
                      
                      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Skor Teknis</h3>
                        <div className={`text-4xl font-bold mb-2 ${getScoreColor(technicalScore)}`}>
                          {technicalScore}%
                        </div>
                        {getScoreBadge(technicalScore)}
                      </div>
                      
                      <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Skor Perilaku</h3>
                        <div className={`text-4xl font-bold mb-2 ${getScoreColor(behavioralScore)}`}>
                          {behavioralScore}%
                        </div>
                        {getScoreBadge(behavioralScore)}
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-3">Analisis Performa</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Kelengkapan Jawaban</span>
                              <span className="text-sm font-medium">{answeredQuestions.length}/{questions.length} ({Math.round(answeredPercentage)}%)</span>
                            </div>
                            <Progress value={answeredPercentage} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Kejelasan Jawaban</span>
                              <span className="text-sm font-medium">{answeredQuestions.filter(q => q.evaluation?.includes("clear")).length}/{answeredQuestions.length}</span>
                            </div>
                            <Progress 
                              value={answeredQuestions.length > 0 ? 
                                (answeredQuestions.filter(q => q.evaluation?.includes("clear")).length / answeredQuestions.length) * 100 : 0
                              } 
                              className="h-2" 
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Jawaban dengan Contoh Konkret</span>
                              <span className="text-sm font-medium">{answeredQuestions.filter(q => q.evaluation?.includes("example")).length}/{answeredQuestions.length}</span>
                            </div>
                            <Progress 
                              value={answeredQuestions.length > 0 ? 
                                (answeredQuestions.filter(q => q.evaluation?.includes("example")).length / answeredQuestions.length) * 100 : 0
                              } 
                              className="h-2" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-3">Ringkasan Temuan Utama</h3>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Kekuatan</p>
                              <p className="text-muted-foreground">
                                {behavioralScore > technicalScore ? 
                                  "Anda menunjukkan kekuatan di pertanyaan perilaku, ini menunjukkan keterampilan interpersonal yang baik." :
                                  "Anda menunjukkan kekuatan di pertanyaan teknis, ini menunjukkan kompetensi teknis yang baik."}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Area Pengembangan</p>
                              <p className="text-muted-foreground">
                                {behavioralScore < technicalScore ? 
                                  "Anda perlu meningkatkan jawaban perilaku dengan menggunakan metode STAR (Situation, Task, Action, Result)." :
                                  "Anda perlu meningkatkan jawaban teknis dengan contoh pengalaman dan implementasi konkret."}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            <div>
                              <p className="font-medium">Saran Perbaikan</p>
                              <p className="text-muted-foreground">
                                Latih kemampuan {behavioralScore < technicalScore ? "perilaku" : "teknis"} Anda dengan mengikuti sesi wawancara bertarget dan mempelajari tips yang direkomendasikan.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Perkembangan Performa</CardTitle>
                    <CardDescription>
                      Perkembangan kemampuan wawancara Anda dari waktu ke waktu
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Grafik perkembangan akan muncul setelah Anda menyelesaikan beberapa sesi wawancara
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Detail Sesi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tanggal Sesi</p>
                          <p className="font-medium">{formatDate(new Date(session.completedAt || session.scheduledFor))}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Durasi Sesi</p>
                          <p className="font-medium">{session.duration} menit</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <BookText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Pertanyaan Dijawab</p>
                          <p className="font-medium">{answeredQuestions.length} dari {questions.length}</p>
                        </div>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div>
                        <h3 className="font-medium mb-2">Distribusi Pertanyaan</h3>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Teknis</span>
                              <span className="text-sm">{technicalQuestions.length}</span>
                            </div>
                            <Progress 
                              value={(technicalQuestions.length / questions.length) * 100} 
                              className="h-2 bg-blue-100" 
                            />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Perilaku</span>
                              <span className="text-sm">{behavioralQuestions.length}</span>
                            </div>
                            <Progress 
                              value={(behavioralQuestions.length / questions.length) * 100} 
                              className="h-2 bg-purple-100" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Saran Langkah Selanjutnya</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/interview-preparation/tips">
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Pelajari Tips Wawancara
                        </Link>
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/interview-preparation/new">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Buat Sesi Wawancara Baru
                        </Link>
                      </Button>
                      
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link href="/profile">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Perbarui Profil Karir
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="answers">
            <Card>
              <CardHeader>
                <CardTitle>Jawaban & Evaluasi</CardTitle>
                <CardDescription>
                  Detail jawaban Anda dan evaluasi untuk setiap pertanyaan wawancara
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {questions.map((question, index) => (
                    <div key={question.id} className="pb-6 border-b border-border last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            {index + 1}. {question.questionText}
                          </h3>
                          {question.description && (
                            <p className="text-muted-foreground mt-1">{question.description}</p>
                          )}
                        </div>
                        <Badge>{question.category}</Badge>
                      </div>
                      
                      {question.userResponse ? (
                        <>
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Jawaban Anda:</h4>
                            <div className="bg-slate-50 p-4 rounded-md">
                              <p className="whitespace-pre-line">{question.userResponse}</p>
                            </div>
                          </div>
                          
                          {question.evaluation && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">Evaluasi:</h4>
                              <div className="bg-blue-50 p-4 rounded-md">
                                <p className="whitespace-pre-line text-blue-800">{question.evaluation}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium text-muted-foreground mr-3">Skor:</h4>
                            <div className="flex items-center">
                              {getStarRating(question.score ? question.score * 100 : 0)}
                              <span className="ml-2 font-medium">
                                {question.score ? (question.score * 100).toFixed(0) : 0}%
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="text-muted-foreground italic">Tidak ada jawaban yang diberikan</p>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Panduan Jawaban Ideal:</h4>
                        <div className="bg-green-50 p-4 rounded-md">
                          <p className="whitespace-pre-line text-green-800">{question.answerGuidelines}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tips">
            <Card>
              <CardHeader>
                <CardTitle>Rekomendasi untuk Meningkatkan Performa</CardTitle>
                <CardDescription>
                  Tips dan saran khusus berdasarkan hasil evaluasi wawancara Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <h3 className="text-lg font-medium text-blue-800 mb-3">Kekuatan & Area Peningkatan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                          <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                          Kekuatan Anda
                        </h4>
                        <ul className="space-y-2 text-blue-800">
                          {behavioralScore > technicalScore ? (
                            <>
                              <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Kemampuan komunikasi dan jawaban perilaku yang baik</span>
                              </li>
                              <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Mampu menyampaikan pengalaman dengan jelas</span>
                              </li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Pengetahuan teknis yang solid</span>
                              </li>
                              <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Jawaban teknis yang terstruktur</span>
                              </li>
                            </>
                          )}
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Kemampuan untuk menyelesaikan {Math.round(answeredPercentage)}% pertanyaan</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                          Area Peningkatan
                        </h4>
                        <ul className="space-y-2 text-blue-800">
                          {behavioralScore < technicalScore ? (
                            <>
                              <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Tingkatkan kemampuan menjawab pertanyaan perilaku</span>
                              </li>
                              <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Perlu lebih banyak contoh konkret dalam jawaban</span>
                              </li>
                            </>
                          ) : (
                            <>
                              <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Tingkatkan pengetahuan teknis tentang {session.jobRoleTarget}</span>
                              </li>
                              <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Perkuat jawaban dengan contoh implementasi</span>
                              </li>
                            </>
                          )}
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>Perlu meningkatkan kedalaman jawaban</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-medium mb-4">Tips Utama untuk Diterapkan</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-white border border-border rounded-lg p-6">
                      <h4 className="font-medium text-lg mb-3">Teknik Menjawab dengan Struktur STAR</h4>
                      <p className="text-muted-foreground mb-4">
                        Gunakan teknik STAR (Situation, Task, Action, Result) untuk memberikan jawaban terstruktur dan komprehensif.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium">Situation:</h5>
                          <p className="text-muted-foreground">Jelaskan konteks atau situasi yang Anda hadapi.</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Task:</h5>
                          <p className="text-muted-foreground">Deskripsikan tugas atau tanggung jawab Anda dalam situasi tersebut.</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Action:</h5>
                          <p className="text-muted-foreground">Uraikan tindakan spesifik yang Anda ambil untuk menyelesaikan tugas.</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Result:</h5>
                          <p className="text-muted-foreground">Jelaskan hasil positif dan pembelajaran dari pengalaman tersebut.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-border rounded-lg p-6">
                      <h4 className="font-medium text-lg mb-3">Peningkatan untuk {behavioralScore < technicalScore ? "Pertanyaan Perilaku" : "Pertanyaan Teknis"}</h4>
                      {behavioralScore < technicalScore ? (
                        <div className="space-y-3">
                          <p className="text-muted-foreground">
                            Pertanyaan perilaku dirancang untuk memahami bagaimana Anda bereaksi dalam situasi tertentu berdasarkan pengalaman masa lalu.
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                              <span>Siapkan 5-7 contoh pengalaman yang dapat disesuaikan dengan berbagai pertanyaan</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                              <span>Pilih cerita yang menunjukkan keterampilan relevan dengan posisi {session.jobRoleTarget}</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                              <span>Fokus pada tindakan yang Anda ambil secara pribadi, bukan tim secara keseluruhan</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                              <span>Latih bercerita dengan jelas dan ringkas, hindari detail yang tidak relevan</span>
                            </li>
                          </ul>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-muted-foreground">
                            Pertanyaan teknis menilai pengetahuan spesifik dan keterampilan yang dibutuhkan untuk peran {session.jobRoleTarget}.
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                              <span>Tinjau konsep dasar dan terminologi untuk peran {session.jobRoleTarget}</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                              <span>Praktikkan memecahkan masalah secara bersuara, tunjukkan proses berpikir Anda</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                              <span>Kaitkan konsep teoritis dengan pengalaman praktis atau proyek Anda</span>
                            </li>
                            <li className="flex items-start">
                              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 shrink-0 mt-0.5" />
                              <span>Jujur tentang area yang kurang Anda kuasai, tapi tunjukkan kemauan untuk belajar</span>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-white border border-border rounded-lg p-6">
                      <h4 className="font-medium text-lg mb-3">Rencana Persiapan Selanjutnya</h4>
                      <ol className="space-y-3 ml-5 list-decimal">
                        <li className="pl-2">
                          <span className="font-medium">Jadwalkan sesi latihan mingguan</span>
                          <p className="text-muted-foreground">Tetapkan jadwal rutin untuk berlatih pertanyaan wawancara baru setiap minggu.</p>
                        </li>
                        <li className="pl-2">
                          <span className="font-medium">Pelajari dasar-dasar industri</span>
                          <p className="text-muted-foreground">Riset tren dan perkembangan terbaru di bidang {session.jobRoleTarget}.</p>
                        </li>
                        <li className="pl-2">
                          <span className="font-medium">Rekam dan tinjau jawaban Anda</span>
                          <p className="text-muted-foreground">Merekam jawaban dan meninjau kembali dapat membantu meningkatkan penyampaian dan konten.</p>
                        </li>
                        <li className="pl-2">
                          <span className="font-medium">Lakukan mock interview dengan profesional</span>
                          <p className="text-muted-foreground">Cari umpan balik dari seseorang yang berpengalaman di bidang yang Anda targetkan.</p>
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <Button asChild className="w-full">
                      <Link href="/interview-preparation/tips">
                        Lihat Semua Tips Wawancara
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default InterviewSessionReviewPage;