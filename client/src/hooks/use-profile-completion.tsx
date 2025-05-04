import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, getQueryFn, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Definisikan tipe untuk data profile completion
interface ProfileCompletionItem {
  id: number;
  name: string;
  description: string;
  pointValue: number;
  category: string;
  userType: string;
  iconName?: string;
  isRequired: boolean;
  displayOrder: number;
  completed: boolean;
  completedAt?: Date | null;
}

interface GroupedItems {
  [key: string]: ProfileCompletionItem[];
}

interface ProfileCompletionData {
  percentage: number;
  items: ProfileCompletionItem[];
  groupedItems: GroupedItems;
  totalItems: number;
  completedItems: number;
}

interface PercentageData {
  percentage: number;
}

/**
 * Hook untuk mengelola profile completion
 */
export function useProfileCompletion() {
  const { toast } = useToast();

  // Ambil data profile completion
  const {
    data: completionData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/profile-completion'],
    queryFn: getQueryFn(),
  });

  // Ambil persentase completion
  const {
    data: percentageData,
    isLoading: isLoadingPercentage,
  } = useQuery({
    queryKey: ['/api/profile-completion/percentage'],
    queryFn: getQueryFn(),
  });

  // Mutasi untuk memperbarui status completion item
  const updateCompletionMutation = useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: number; completed: boolean }) => {
      const res = await apiRequest('PATCH', `/api/profile-completion/${itemId}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries untuk mereload data
      queryClient.invalidateQueries({ queryKey: ['/api/profile-completion'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profile-completion/percentage'] });
      
      toast({
        title: 'Status berhasil diperbarui',
        description: 'Progres kelengkapan profil Anda telah diperbarui',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal memperbarui status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    completionData: completionData as ProfileCompletionData,
    percentageData: percentageData as PercentageData,
    percentage: (percentageData as PercentageData)?.percentage || 0,
    isLoading,
    isLoadingPercentage,
    error,
    updateCompletionMutation,
    updateCompletion: updateCompletionMutation.mutate,
    isUpdating: updateCompletionMutation.isPending,
  };
}