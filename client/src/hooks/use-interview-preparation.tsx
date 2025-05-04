import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  InterviewQuestion,
  MockInterview,
  MockInterviewQuestion,
  InterviewPerformance,
  InterviewTip
} from "@shared/schema";
import { useToast } from "./use-toast";

export function useInterviewPreparation() {
  const { toast } = useToast();
  
  /**
   * === PERTANYAAN WAWANCARA ===
   */
  
  // Mendapatkan daftar pertanyaan wawancara dengan filter
  const useInterviewQuestions = (filters?: {
    category?: string;
    difficulty?: string;
    industry?: string;
    jobRole?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (filters?.category) queryParams.append("category", filters.category);
    if (filters?.difficulty) queryParams.append("difficulty", filters.difficulty);
    if (filters?.industry) queryParams.append("industry", filters.industry);
    if (filters?.jobRole) queryParams.append("jobRole", filters.jobRole);
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());
    if (filters?.offset) queryParams.append("offset", filters.offset.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    return useQuery<InterviewQuestion[]>({
      queryKey: ["/api/interview-preparation/questions", filters],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/interview-preparation/questions${queryString}`);
        return await res.json();
      }
    });
  };
  
  // Mendapatkan pertanyaan wawancara berdasarkan ID
  const useInterviewQuestion = (id: number) => {
    return useQuery<InterviewQuestion>({
      queryKey: ["/api/interview-preparation/questions", id],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/interview-preparation/questions/${id}`);
        return await res.json();
      },
      enabled: !!id
    });
  };
  
  // Membuat pertanyaan wawancara baru (hanya admin)
  const useCreateInterviewQuestion = () => {
    return useMutation({
      mutationFn: async (data: Omit<InterviewQuestion, "id" | "createdBy" | "isVerified" | "createdAt" | "updatedAt">) => {
        const res = await apiRequest("POST", "/api/interview-preparation/questions", data);
        return await res.json();
      },
      onSuccess: () => {
        toast({
          title: "Berhasil",
          description: "Pertanyaan wawancara baru berhasil ditambahkan",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/questions"] });
      },
      onError: (error) => {
        toast({
          title: "Gagal menambahkan pertanyaan",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  // Mengupdate pertanyaan wawancara (hanya admin)
  const useUpdateInterviewQuestion = (id: number) => {
    return useMutation({
      mutationFn: async (data: Partial<InterviewQuestion>) => {
        const res = await apiRequest("PUT", `/api/interview-preparation/questions/${id}`, data);
        return await res.json();
      },
      onSuccess: () => {
        toast({
          title: "Berhasil",
          description: "Pertanyaan wawancara berhasil diupdate",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/questions", id] });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/questions"] });
      },
      onError: (error) => {
        toast({
          title: "Gagal mengupdate pertanyaan",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  // Menghapus pertanyaan wawancara (hanya admin)
  const useDeleteInterviewQuestion = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        await apiRequest("DELETE", `/api/interview-preparation/questions/${id}`);
        return id;
      },
      onSuccess: (id) => {
        toast({
          title: "Berhasil",
          description: "Pertanyaan wawancara berhasil dihapus",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/questions"] });
        queryClient.removeQueries({ queryKey: ["/api/interview-preparation/questions", id] });
      },
      onError: (error) => {
        toast({
          title: "Gagal menghapus pertanyaan",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  // Memverifikasi pertanyaan wawancara (hanya admin)
  const useVerifyInterviewQuestion = () => {
    return useMutation({
      mutationFn: async ({ id, verify }: { id: number, verify: boolean }) => {
        const res = await apiRequest("PATCH", `/api/interview-preparation/questions/${id}/verify`, { verify });
        return await res.json();
      },
      onSuccess: (_, variables) => {
        toast({
          title: "Berhasil",
          description: `Pertanyaan wawancara berhasil ${variables.verify ? "diverifikasi" : "dibatalkan verifikasinya"}`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/questions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/questions", variables.id] });
      },
      onError: (error) => {
        toast({
          title: "Gagal memverifikasi pertanyaan",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  /**
   * === MOCK INTERVIEW SESSION ===
   */
  
  // Mendapatkan daftar mock interview untuk pengguna yang terotentikasi
  const useMockInterviews = () => {
    return useQuery<MockInterview[]>({
      queryKey: ["/api/interview-preparation/mock-interviews"],
      queryFn: async () => {
        const res = await apiRequest("GET", "/api/interview-preparation/mock-interviews");
        return await res.json();
      }
    });
  };
  
  // Mendapatkan mock interview berdasarkan ID
  const useMockInterview = (id: number) => {
    return useQuery<MockInterview>({
      queryKey: ["/api/interview-preparation/mock-interviews", id],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/interview-preparation/mock-interviews/${id}`);
        return await res.json();
      },
      enabled: !!id
    });
  };
  
  // Membuat mock interview baru
  const useCreateMockInterview = () => {
    return useMutation({
      mutationFn: async (data: Omit<MockInterview, "id" | "userId" | "status" | "createdAt" | "updatedAt">) => {
        const res = await apiRequest("POST", "/api/interview-preparation/mock-interviews", data);
        return await res.json();
      },
      onSuccess: () => {
        toast({
          title: "Berhasil",
          description: "Sesi wawancara latihan berhasil dibuat",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/mock-interviews"] });
      },
      onError: (error) => {
        toast({
          title: "Gagal membuat sesi wawancara latihan",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  // Mengupdate mock interview
  const useUpdateMockInterview = (id: number) => {
    return useMutation({
      mutationFn: async (data: Partial<MockInterview>) => {
        const res = await apiRequest("PUT", `/api/interview-preparation/mock-interviews/${id}`, data);
        return await res.json();
      },
      onSuccess: () => {
        toast({
          title: "Berhasil",
          description: "Sesi wawancara latihan berhasil diupdate",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/mock-interviews", id] });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/mock-interviews"] });
      },
      onError: (error) => {
        toast({
          title: "Gagal mengupdate sesi wawancara latihan",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  // Menghapus mock interview
  const useDeleteMockInterview = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        await apiRequest("DELETE", `/api/interview-preparation/mock-interviews/${id}`);
        return id;
      },
      onSuccess: (id) => {
        toast({
          title: "Berhasil",
          description: "Sesi wawancara latihan berhasil dihapus",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/mock-interviews"] });
        queryClient.removeQueries({ queryKey: ["/api/interview-preparation/mock-interviews", id] });
      },
      onError: (error) => {
        toast({
          title: "Gagal menghapus sesi wawancara latihan",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  // Memulai sesi mock interview
  const useStartMockInterview = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const res = await apiRequest("POST", `/api/interview-preparation/mock-interviews/${id}/start`);
        return await res.json();
      },
      onSuccess: (_, id) => {
        toast({
          title: "Berhasil",
          description: "Sesi wawancara latihan berhasil dimulai",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/mock-interviews", id] });
      },
      onError: (error) => {
        toast({
          title: "Gagal memulai sesi wawancara latihan",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  // Mendapatkan pertanyaan untuk mock interview tertentu
  const useMockInterviewQuestions = (mockInterviewId: number) => {
    return useQuery<{ miq: MockInterviewQuestion, q: InterviewQuestion }[]>({
      queryKey: ["/api/interview-preparation/mock-interviews", mockInterviewId, "questions"],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/interview-preparation/mock-interviews/${mockInterviewId}/questions`);
        return await res.json();
      },
      enabled: !!mockInterviewId
    });
  };
  
  // Memperbarui respons pengguna dan evaluasi untuk pertanyaan
  const useUpdateMockInterviewQuestion = () => {
    return useMutation({
      mutationFn: async ({ mockInterviewId, questionId, userResponse }: { 
        mockInterviewId: number; 
        questionId: number; 
        userResponse: string;
        evaluation?: string;
        score?: number;
      }) => {
        const res = await apiRequest(
          "PUT", 
          `/api/interview-preparation/mock-interviews/${mockInterviewId}/questions/${questionId}`, 
          { userResponse, evaluation: undefined, score: undefined }
        );
        return await res.json();
      },
      onSuccess: (_, variables) => {
        toast({
          title: "Berhasil",
          description: "Respons wawancara berhasil disimpan",
        });
        queryClient.invalidateQueries({ 
          queryKey: ["/api/interview-preparation/mock-interviews", variables.mockInterviewId, "questions"] 
        });
      },
      onError: (error) => {
        toast({
          title: "Gagal menyimpan respons wawancara",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  // Menyelesaikan sesi mock interview dan menghitung skor
  const useCompleteMockInterview = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        const res = await apiRequest("POST", `/api/interview-preparation/mock-interviews/${id}/complete`);
        return await res.json();
      },
      onSuccess: (_, id) => {
        toast({
          title: "Berhasil",
          description: "Sesi wawancara latihan berhasil diselesaikan",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/mock-interviews", id] });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/performance"] });
      },
      onError: (error) => {
        toast({
          title: "Gagal menyelesaikan sesi wawancara latihan",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  /**
   * === INTERVIEW PERFORMANCE ===
   */
  
  // Mendapatkan data performa wawancara pengguna
  const useInterviewPerformance = (userId?: number) => {
    return useQuery<InterviewPerformance>({
      queryKey: ["/api/interview-preparation/performance", userId],
      queryFn: async () => {
        const url = userId 
          ? `/api/interview-preparation/performance/${userId}` 
          : "/api/interview-preparation/performance";
        const res = await apiRequest("GET", url);
        return await res.json();
      },
      enabled: !!userId
    });
  };
  
  /**
   * === INTERVIEW TIPS ===
   */
  
  // Mendapatkan daftar tips wawancara dengan filter
  const useInterviewTips = (filters?: {
    category?: string;
    difficultyLevel?: string;
    targetIndustry?: string;
    targetRole?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (filters?.category) queryParams.append("category", filters.category);
    if (filters?.difficultyLevel) queryParams.append("difficultyLevel", filters.difficultyLevel);
    if (filters?.targetIndustry) queryParams.append("targetIndustry", filters.targetIndustry);
    if (filters?.targetRole) queryParams.append("targetRole", filters.targetRole);
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());
    if (filters?.offset) queryParams.append("offset", filters.offset.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    return useQuery<InterviewTip[]>({
      queryKey: ["/api/interview-preparation/tips", filters],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/interview-preparation/tips${queryString}`);
        return await res.json();
      }
    });
  };
  
  // Mendapatkan tip wawancara berdasarkan ID
  const useInterviewTip = (id: number) => {
    return useQuery<InterviewTip>({
      queryKey: ["/api/interview-preparation/tips", id],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/interview-preparation/tips/${id}`);
        return await res.json();
      },
      enabled: !!id
    });
  };
  
  // Membuat tip wawancara baru (hanya admin)
  const useCreateInterviewTip = () => {
    return useMutation({
      mutationFn: async (data: Omit<InterviewTip, "id" | "authorId" | "isActive" | "createdAt" | "updatedAt">) => {
        const res = await apiRequest("POST", "/api/interview-preparation/tips", data);
        return await res.json();
      },
      onSuccess: () => {
        toast({
          title: "Berhasil",
          description: "Tip wawancara baru berhasil ditambahkan",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/tips"] });
      },
      onError: (error) => {
        toast({
          title: "Gagal menambahkan tip wawancara",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  // Mengupdate tip wawancara (hanya admin)
  const useUpdateInterviewTip = (id: number) => {
    return useMutation({
      mutationFn: async (data: Partial<InterviewTip>) => {
        const res = await apiRequest("PUT", `/api/interview-preparation/tips/${id}`, data);
        return await res.json();
      },
      onSuccess: () => {
        toast({
          title: "Berhasil",
          description: "Tip wawancara berhasil diupdate",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/tips", id] });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/tips"] });
      },
      onError: (error) => {
        toast({
          title: "Gagal mengupdate tip wawancara",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  // Menghapus tip wawancara (hanya admin)
  const useDeleteInterviewTip = () => {
    return useMutation({
      mutationFn: async (id: number) => {
        await apiRequest("DELETE", `/api/interview-preparation/tips/${id}`);
        return id;
      },
      onSuccess: (id) => {
        toast({
          title: "Berhasil",
          description: "Tip wawancara berhasil dihapus",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/interview-preparation/tips"] });
        queryClient.removeQueries({ queryKey: ["/api/interview-preparation/tips", id] });
      },
      onError: (error) => {
        toast({
          title: "Gagal menghapus tip wawancara",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };
  
  // Mendapatkan rekomendasi tips wawancara berdasarkan performa pengguna
  const useRecommendedTips = (limit?: number) => {
    const queryParams = new URLSearchParams();
    
    if (limit) queryParams.append("limit", limit.toString());
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    return useQuery<InterviewTip[]>({
      queryKey: ["/api/interview-preparation/recommended-tips", { limit }],
      queryFn: async () => {
        const res = await apiRequest("GET", `/api/interview-preparation/recommended-tips${queryString}`);
        return await res.json();
      }
    });
  };
  
  return {
    // Interview Questions
    useInterviewQuestions,
    useInterviewQuestion,
    useCreateInterviewQuestion,
    useUpdateInterviewQuestion,
    useDeleteInterviewQuestion,
    useVerifyInterviewQuestion,
    
    // Mock Interviews
    useMockInterviews,
    useMockInterview,
    useCreateMockInterview,
    useUpdateMockInterview,
    useDeleteMockInterview,
    useStartMockInterview,
    useMockInterviewQuestions,
    useUpdateMockInterviewQuestion,
    useCompleteMockInterview,
    
    // Interview Performance
    useInterviewPerformance,
    
    // Interview Tips
    useInterviewTips,
    useInterviewTip,
    useCreateInterviewTip,
    useUpdateInterviewTip,
    useDeleteInterviewTip,
    useRecommendedTips
  };
}