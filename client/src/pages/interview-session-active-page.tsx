import MainLayout from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useInterviewPreparation } from "@/hooks/use-interview-preparation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Clock, Loader2, MicIcon, Pause, PlayCircle, Send, StopCircle, XCircle } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { formatDate, formatDuration } from "@/lib/utils";
import { useEffect, useState } from "react";

function InterviewSessionActivePage() {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const sessionId = parseInt(params.id);
  
  // State untuk mengelola sesi aktif
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [confirmFinishOpen, setConfirmFinishOpen] = useState(false);
  
  // Get interview data
  const {
    useMockInterview,
    useMockInterviewQuestions,
    useUpdateMockInterviewQuestion,
    useCompleteMockInterview
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
  
  const updateQuestionMutation = useUpdateMockInterviewQuestion();
  const completeInterviewMutation = useCompleteMockInterview();
  
  // Set initial timer based on session duration
  useEffect(() => {
    if (session && !timeRemaining) {
      // Convert minutes to seconds
      setTimeRemaining(session.duration * 60);
      // Auto-start timer when session loads
      setIsTimerActive(true);
    }
  }, [session, timeRemaining]);
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          }
          return 0;
        });
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsTimerActive(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeRemaining]);
  
  // Handlers
  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleNextQuestion = async () => {
    if (!questions) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    
    // Save current question answer
    if (currentQuestion && userAnswers[currentQuestion.id]) {
      try {
        await updateQuestionMutation.mutateAsync({
          mockInterviewId: sessionId,
          questionId: currentQuestion.id,
          userResponse: userAnswers[currentQuestion.id]
        });
      } catch (error) {
        console.error("Error saving answer:", error);
      }
    }
    
    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const toggleTimer = () => {
    setIsTimerActive(prev => !prev);
  };
  
  const handleFinishInterview = async () => {
    // Save any remaining unsaved answers
    if (questions) {
      for (const questionId in userAnswers) {
        try {
          await updateQuestionMutation.mutateAsync({
            mockInterviewId: sessionId,
            questionId: parseInt(questionId),
            userResponse: userAnswers[parseInt(questionId)]
          });
        } catch (error) {
          console.error(`Error saving answer for question ${questionId}:`, error);
        }
      }
    }
    
    // Complete the interview
    try {
      await completeInterviewMutation.mutateAsync(sessionId);
      navigate(`/interview-preparation/sessions/${sessionId}/review`);
    } catch (error) {
      console.error("Error completing interview:", error);
    }
  };
  
  if (!user) {
    return null;
  }
  
  if (isLoadingSession || isLoadingQuestions) {
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
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
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
            <h1 className="text-3xl font-bold text-primary">Sesi Tidak Dapat Dimulai</h1>
            <p className="text-muted-foreground mt-1">
              Maaf, sesi wawancara tidak dapat dimulai karena data tidak ditemukan atau belum tersedia pertanyaan.
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
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex + 1) / questions.length * 100;
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Button variant="ghost" className="pl-0 mb-2" asChild>
            <Link href={`/interview-preparation/sessions/${sessionId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Detail Sesi
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-primary">{session.title}</h1>
          <p className="text-muted-foreground mt-1">
            Target Posisi: {session.jobRoleTarget} • Tingkat Kesulitan: {session.difficulty}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main content area */}
          <div className="md:col-span-3">
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle>Pertanyaan {currentQuestionIndex + 1} dari {questions.length}</CardTitle>
                  <Badge>{currentQuestion.category}</Badge>
                </div>
                <Progress value={progress} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">{currentQuestion.questionText}</h3>
                  {currentQuestion.description && (
                    <p className="text-muted-foreground mb-4">{currentQuestion.description}</p>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Jawaban Anda:</label>
                    <Textarea
                      placeholder="Ketik jawaban Anda di sini..."
                      value={userAnswers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Sebelumnya
                </Button>
                
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button onClick={handleNextQuestion}>
                    Selanjutnya
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => setConfirmFinishOpen(true)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Selesaikan Wawancara
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
          
          {/* Sidebar with timer and controls */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Waktu Tersisa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold mb-2">
                    {formatDuration(timeRemaining || 0)}
                  </div>
                  
                  <div className="flex justify-center gap-2 mb-4">
                    <Button 
                      size="sm" 
                      variant={isTimerActive ? "destructive" : "default"}
                      onClick={toggleTimer}
                    >
                      {isTimerActive ? (
                        <>
                          <Pause className="mr-1 h-4 w-4" />
                          Jeda
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-1 h-4 w-4" />
                          Lanjutkan
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pertanyaan Dijawab:</span>
                    <span className="font-medium">
                      {Object.keys(userAnswers).length} / {questions.length}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Alert variant="default" className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-700" />
                    <AlertTitle className="text-blue-800">Tips</AlertTitle>
                    <AlertDescription className="text-blue-800">
                      Berikan jawaban yang jelas dan terstruktur. Ingat untuk menyertakan contoh konkret dari pengalaman Anda.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setConfirmFinishOpen(true)}
                >
                  <StopCircle className="mr-2 h-4 w-4" />
                  Akhiri Sesi
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmFinishOpen} onOpenChange={setConfirmFinishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Akhiri Sesi Wawancara?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin mengakhiri sesi wawancara ini? Semua jawaban Anda akan disimpan dan dievaluasi.
            </DialogDescription>
          </DialogHeader>
          
          {Object.keys(userAnswers).length < questions.length && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Peringatan</AlertTitle>
              <AlertDescription>
                Anda belum menjawab semua pertanyaan ({Object.keys(userAnswers).length} dari {questions.length} dijawab).
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmFinishOpen(false)}>
              Kembali ke Sesi
            </Button>
            <Button
              onClick={handleFinishInterview}
              disabled={completeInterviewMutation.isPending}
            >
              {completeInterviewMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Akhiri dan Evaluasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}

export default InterviewSessionActivePage;