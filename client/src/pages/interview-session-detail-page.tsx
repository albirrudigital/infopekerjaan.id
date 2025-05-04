import MainLayout from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useInterviewPreparation } from "@/hooks/use-interview-preparation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, Clock, ArrowLeft, CheckCircle2, XCircle, Loader2, PlayCircle, FileEdit, Trash } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

function InterviewSessionDetailPage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const {
    useMockInterview,
    useMockInterviewQuestions,
    useStartMockInterview,
    useUpdateMockInterview,
    useDeleteMockInterview
  } = useInterviewPreparation();
  
  const sessionId = parseInt(params.id);
  
  const {
    data: session,
    isLoading: isLoadingSession,
    error: sessionError
  } = useMockInterview(sessionId);
  
  const {
    data: questions,
    isLoading: isLoadingQuestions
  } = useMockInterviewQuestions(sessionId);
  
  const startInterview = useStartMockInterview();
  const deleteInterview = useDeleteMockInterview();
  const updateInterview = useUpdateMockInterview(sessionId);
  
  const handleStartInterview = async () => {
    try {
      await startInterview.mutateAsync(sessionId);
      navigate(`/interview-preparation/sessions/${sessionId}/start`);
    } catch (error) {
      console.error("Error starting interview:", error);
    }
  };
  
  const handleCancelInterview = async () => {
    try {
      await updateInterview.mutateAsync({
        status: "cancelled"
      });
    } catch (error) {
      console.error("Error cancelling interview:", error);
    }
  };
  
  const handleDeleteInterview = async () => {
    try {
      await deleteInterview.mutateAsync(sessionId);
      navigate("/interview-preparation");
    } catch (error) {
      console.error("Error deleting interview:", error);
    }
  };
  
  if (!user) {
    return null;
  }
  
  if (isLoadingSession) {
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
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
            
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (sessionError || !session) {
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
            <h1 className="text-3xl font-bold text-primary">Sesi Tidak Ditemukan</h1>
            <p className="text-muted-foreground mt-1">
              Maaf, sesi wawancara yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.
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
              <h1 className="text-3xl font-bold text-primary mb-1">{session.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={`${
                    session.status === "scheduled" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : 
                    session.status === "completed" ? "bg-green-100 text-green-700 hover:bg-green-200" : 
                    "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {session.status === "scheduled" ? "Terjadwal" : 
                   session.status === "completed" ? "Selesai" : 
                   "Dibatalkan"}
                </Badge>
                <Badge>{session.difficulty}</Badge>
                <Badge variant="outline">{session.questionCount} pertanyaan</Badge>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-2">
              {session.status === "scheduled" && (
                <>
                  <Button onClick={handleStartInterview} disabled={startInterview.isPending}>
                    {startInterview.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <PlayCircle className="mr-2 h-4 w-4" />
                    )}
                    Mulai Sesi
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/interview-preparation/sessions/${session.id}/edit`}>
                      <FileEdit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                </>
              )}
              
              {session.status === "completed" && (
                <Button asChild>
                  <Link href={`/interview-preparation/sessions/${session.id}/review`}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Lihat Hasil
                  </Link>
                </Button>
              )}
              
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Hapus
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Hapus Sesi Wawancara</DialogTitle>
                    <DialogDescription>
                      Apakah Anda yakin ingin menghapus sesi wawancara ini? Tindakan ini tidak dapat dibatalkan.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteInterview}
                      disabled={deleteInterview.isPending}
                    >
                      {deleteInterview.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Hapus Permanen
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Detail Sesi Wawancara</CardTitle>
                <CardDescription>
                  Informasi tentang sesi latihan wawancara Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                {session.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Deskripsi</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {session.description}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Informasi Umum</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Target Posisi:</span>
                        <span className="font-medium">{session.jobRoleTarget}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tingkat Kesulitan:</span>
                        <span className="font-medium capitalize">{session.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jumlah Pertanyaan:</span>
                        <span className="font-medium">{session.questionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Durasi:</span>
                        <span className="font-medium">{session.duration} menit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge
                          className={`${
                            session.status === "scheduled" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : 
                            session.status === "completed" ? "bg-green-100 text-green-700 hover:bg-green-200" : 
                            "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {session.status === "scheduled" ? "Terjadwal" : 
                          session.status === "completed" ? "Selesai" : 
                          "Dibatalkan"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Jadwal</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{formatDate(new Date(session.scheduledFor))}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(session.scheduledFor).toLocaleTimeString([], { 
                            hour: "2-digit", 
                            minute: "2-digit"
                          })}
                        </span>
                        <span className="text-muted-foreground">
                          ({session.duration} menit)
                        </span>
                      </div>
                      
                      {session.status === "scheduled" && (
                        <div className="mt-6">
                          <Button 
                            variant="outline" 
                            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={handleCancelInterview}
                            disabled={updateInterview.isPending}
                          >
                            {updateInterview.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="mr-2 h-4 w-4" />
                            )}
                            Batalkan Jadwal
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {session.settings && Object.keys(session.settings).length > 0 && (
                  <>
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Pengaturan Lanjutan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {session.settings.focusTechnical !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Distribusi Pertanyaan:</span>
                            <span className="font-medium">
                              {session.settings.focusTechnical}% Teknis, {100 - session.settings.focusTechnical}% Perilaku
                            </span>
                          </div>
                        )}
                        
                        {session.settings.includeCompanySpecific !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Termasuk Pertanyaan Spesifik Perusahaan:</span>
                            <span className="font-medium">
                              {session.settings.includeCompanySpecific ? "Ya" : "Tidak"}
                            </span>
                          </div>
                        )}
                        
                        {session.settings.allowReviewBeforeSubmit !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Izinkan Review Jawaban:</span>
                            <span className="font-medium">
                              {session.settings.allowReviewBeforeSubmit ? "Ya" : "Tidak"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Pertanyaan Wawancara</CardTitle>
                <CardDescription>
                  Daftar pertanyaan yang akan diajukan dalam sesi ini
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingQuestions ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : !questions || questions.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">
                      {session.status === "scheduled" ? (
                        "Pertanyaan wawancara akan dibuat ketika Anda memulai sesi. Klik tombol 'Mulai Sesi' untuk memulai."
                      ) : (
                        "Tidak ada pertanyaan yang tersedia untuk sesi ini."
                      )}
                    </p>
                    
                    {session.status === "scheduled" && (
                      <Button onClick={handleStartInterview} disabled={startInterview.isPending}>
                        {startInterview.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <PlayCircle className="mr-2 h-4 w-4" />
                        )}
                        Mulai Sesi Sekarang
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((item, index) => (
                      <div key={item.miq.id} className="border p-4 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline">Pertanyaan {index + 1}</Badge>
                              <Badge variant="outline">{item.q.category}</Badge>
                              <Badge variant="outline">{item.q.difficulty}</Badge>
                            </div>
                            <p className="font-medium">{item.q.question}</p>
                          </div>
                          
                          {item.miq.score !== null && (
                            <Badge 
                              className={
                                item.miq.score >= 80 ? "bg-green-100 text-green-700" : 
                                item.miq.score >= 60 ? "bg-amber-100 text-amber-700" : 
                                "bg-red-100 text-red-700"
                              }
                            >
                              Skor: {item.miq.score}
                            </Badge>
                          )}
                        </div>
                        
                        {item.miq.userResponse && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Respon Anda:</p>
                            <p className="text-sm">{item.miq.userResponse}</p>
                          </div>
                        )}
                        
                        {item.miq.feedback && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-muted-foreground mb-1">Umpan Balik:</p>
                            <p className="text-sm text-muted-foreground">{item.miq.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Tindakan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {session.status === "scheduled" && (
                  <>
                    <Button className="w-full" onClick={handleStartInterview} disabled={startInterview.isPending}>
                      {startInterview.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <PlayCircle className="mr-2 h-4 w-4" />
                      )}
                      Mulai Sekarang
                    </Button>
                    
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/interview-preparation/sessions/${session.id}/edit`}>
                        <FileEdit className="mr-2 h-4 w-4" />
                        Edit Sesi
                      </Link>
                    </Button>
                  </>
                )}
                
                {session.status === "completed" && (
                  <Button className="w-full" asChild>
                    <Link href={`/interview-preparation/sessions/${session.id}/review`}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Lihat Hasil
                    </Link>
                  </Button>
                )}
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Hapus Sesi
                </Button>
                
                <Separator />
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/interview-preparation">
                    Kembali ke Daftar
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Tips Persiapan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Persiapkan Diri Anda</h3>
                    <p className="text-sm text-muted-foreground">
                      Berada di lingkungan yang tenang dan bebas gangguan. Siapkan catatan, CV, dan dokumen lain yang mungkin Anda perlukan.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-1">Teknik STAR</h3>
                    <p className="text-sm text-muted-foreground">
                      Untuk pertanyaan perilaku, gunakan teknik STAR (Situation, Task, Action, Result) untuk memberikan jawaban terstruktur.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-1">Catat Umpan Balik</h3>
                    <p className="text-sm text-muted-foreground">
                      Perhatikan umpan balik yang diberikan dan gunakan untuk meningkatkan performa wawancara Anda di masa depan.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/interview-preparation/tips">
                    Lihat Tips Lainnya
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default InterviewSessionDetailPage;