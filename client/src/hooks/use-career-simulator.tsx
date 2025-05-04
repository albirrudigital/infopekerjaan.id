import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CareerScenario, 
  CareerDecision, 
  AlternativeDecision, 
  CareerComparison, 
  ScenarioPreference,
  InsertCareerScenario,
  InsertCareerDecision,
  InsertAlternativeDecision,
  InsertCareerComparison
} from "@shared/schema";

const API_PATH = "/api/career-simulator";

export function useCareerSimulator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- Scenarios Queries & Mutations ---

  const {
    data: scenarios,
    isLoading: isScenariosLoading,
    error: scenariosError,
  } = useQuery({
    queryKey: [API_PATH, "scenarios"],
    queryFn: () => apiRequest("GET", `${API_PATH}/scenarios`).then(res => res.json()),
  });

  const scenarioMutation = useMutation({
    mutationFn: async (data: InsertCareerScenario) => {
      const res = await apiRequest("POST", `${API_PATH}/scenarios`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_PATH, "scenarios"] });
      toast({
        title: "Skenario berhasil dibuat",
        description: "Skenario karir baru telah berhasil disimpan.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal membuat skenario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const scenarioUpdateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CareerScenario> }) => {
      const res = await apiRequest("PUT", `${API_PATH}/scenarios/${id}`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_PATH, "scenarios"] });
      queryClient.invalidateQueries({ queryKey: [API_PATH, "scenarios", variables.id] });
      toast({
        title: "Skenario diperbarui",
        description: "Perubahan pada skenario telah disimpan.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal memperbarui skenario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const scenarioDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `${API_PATH}/scenarios/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_PATH, "scenarios"] });
      toast({
        title: "Skenario dihapus",
        description: "Skenario karir telah berhasil dihapus.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menghapus skenario",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const useScenarioDetail = (id?: number) => {
    return useQuery({
      queryKey: [API_PATH, "scenarios", id],
      queryFn: () => apiRequest("GET", `${API_PATH}/scenarios/${id}`).then(res => res.json()),
      enabled: !!id,
    });
  };

  const calculateOutcomeMutation = useMutation({
    mutationFn: async (scenarioId: number) => {
      const res = await apiRequest("POST", `${API_PATH}/scenarios/${scenarioId}/calculate`);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_PATH, "scenarios", variables] });
      toast({
        title: "Hasil kalkulasi selesai",
        description: "Skenario karir telah dihitung dengan hasil terbaru.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menghitung hasil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // --- Decisions Queries & Mutations ---

  const useScenarioDecisions = (scenarioId?: number) => {
    return useQuery({
      queryKey: [API_PATH, "scenarios", scenarioId, "decisions"],
      queryFn: () => apiRequest("GET", `${API_PATH}/scenarios/${scenarioId}/decisions`).then(res => res.json()),
      enabled: !!scenarioId,
    });
  };

  const decisionMutation = useMutation({
    mutationFn: async ({ scenarioId, data }: { scenarioId: number; data: InsertCareerDecision }) => {
      const res = await apiRequest("POST", `${API_PATH}/scenarios/${scenarioId}/decisions`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_PATH, "scenarios", variables.scenarioId, "decisions"] });
      toast({
        title: "Keputusan ditambahkan",
        description: "Keputusan karir baru telah ditambahkan ke skenario Anda.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menambahkan keputusan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const decisionUpdateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CareerDecision> }) => {
      const res = await apiRequest("PUT", `${API_PATH}/decisions/${id}`, data);
      return await res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [API_PATH, "scenarios", result.scenarioId, "decisions"] });
      toast({
        title: "Keputusan diperbarui",
        description: "Perubahan pada keputusan karir telah disimpan.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal memperbarui keputusan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const decisionDeleteMutation = useMutation({
    mutationFn: async ({ id, scenarioId }: { id: number; scenarioId: number }) => {
      const res = await apiRequest("DELETE", `${API_PATH}/decisions/${id}`);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_PATH, "scenarios", variables.scenarioId, "decisions"] });
      toast({
        title: "Keputusan dihapus",
        description: "Keputusan karir telah dihapus dari skenario Anda.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menghapus keputusan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // --- Alternative Decisions Queries & Mutations ---

  const useDecisionAlternatives = (decisionId?: number) => {
    return useQuery({
      queryKey: [API_PATH, "decisions", decisionId, "alternatives"],
      queryFn: () => apiRequest("GET", `${API_PATH}/decisions/${decisionId}/alternatives`).then(res => res.json()),
      enabled: !!decisionId,
    });
  };

  const alternativeDecisionMutation = useMutation({
    mutationFn: async ({ decisionId, data }: { decisionId: number; data: InsertAlternativeDecision }) => {
      const res = await apiRequest("POST", `${API_PATH}/decisions/${decisionId}/alternatives`, data);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [API_PATH, "decisions", variables.decisionId, "alternatives"] });
      toast({
        title: "Alternatif ditambahkan",
        description: "Alternatif keputusan karir baru telah ditambahkan.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menambahkan alternatif",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // --- Comparisons Queries & Mutations ---

  const {
    data: comparisons,
    isLoading: isComparisonsLoading,
    error: comparisonsError,
  } = useQuery({
    queryKey: [API_PATH, "comparisons"],
    queryFn: () => apiRequest("GET", `${API_PATH}/comparisons`).then(res => res.json()),
  });

  const comparisonMutation = useMutation({
    mutationFn: async (data: InsertCareerComparison) => {
      const res = await apiRequest("POST", `${API_PATH}/comparisons`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_PATH, "comparisons"] });
      toast({
        title: "Perbandingan disimpan",
        description: "Perbandingan skenario telah berhasil disimpan.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menyimpan perbandingan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const comparisonDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `${API_PATH}/comparisons/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_PATH, "comparisons"] });
      toast({
        title: "Perbandingan dihapus",
        description: "Perbandingan skenario telah berhasil dihapus.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menghapus perbandingan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // --- Preferences Queries & Mutations ---

  const {
    data: preferences,
    isLoading: isPreferencesLoading,
    error: preferencesError,
  } = useQuery({
    queryKey: [API_PATH, "preferences"],
    queryFn: () => apiRequest("GET", `${API_PATH}/preferences`).then(res => res.json()),
  });

  const preferencesUpdateMutation = useMutation({
    mutationFn: async (data: Partial<ScenarioPreference>) => {
      const res = await apiRequest("PUT", `${API_PATH}/preferences`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API_PATH, "preferences"] });
      toast({
        title: "Preferensi diperbarui",
        description: "Preferensi simulator karir Anda telah diperbarui.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal memperbarui preferensi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Scenarios
    scenarios,
    isScenariosLoading,
    scenariosError,
    createScenario: scenarioMutation.mutate,
    isCreatingScenario: scenarioMutation.isPending,
    updateScenario: scenarioUpdateMutation.mutate,
    isUpdatingScenario: scenarioUpdateMutation.isPending,
    deleteScenario: scenarioDeleteMutation.mutate,
    isDeletingScenario: scenarioDeleteMutation.isPending,
    useScenarioDetail,
    calculateOutcome: calculateOutcomeMutation.mutate,
    isCalculatingOutcome: calculateOutcomeMutation.isPending,

    // Decisions
    useScenarioDecisions,
    createDecision: decisionMutation.mutate,
    isCreatingDecision: decisionMutation.isPending,
    updateDecision: decisionUpdateMutation.mutate,
    isUpdatingDecision: decisionUpdateMutation.isPending,
    deleteDecision: decisionDeleteMutation.mutate,
    isDeletingDecision: decisionDeleteMutation.isPending,

    // Alternative Decisions
    useDecisionAlternatives,
    createAlternative: alternativeDecisionMutation.mutate,
    isCreatingAlternative: alternativeDecisionMutation.isPending,

    // Comparisons
    comparisons,
    isComparisonsLoading,
    comparisonsError,
    createComparison: comparisonMutation.mutate,
    isCreatingComparison: comparisonMutation.isPending,
    deleteComparison: comparisonDeleteMutation.mutate,
    isDeletingComparison: comparisonDeleteMutation.isPending,

    // Preferences
    preferences,
    isPreferencesLoading,
    preferencesError,
    updatePreferences: preferencesUpdateMutation.mutate,
    isUpdatingPreferences: preferencesUpdateMutation.isPending,
  };
}