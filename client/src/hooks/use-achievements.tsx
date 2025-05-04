import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AchievementBadgeProps } from '@/components/achievements/achievement-badge';

export type AchievementLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface AchievementEvent {
  id: number;
  userId: number;
  achievementType: string;
  achievementLevel: AchievementLevel;
  achievementName: string;
  description?: string;
  icon?: string;
  unlockedAt: string;
  isNew?: boolean; // Flag untuk menunjukkan bahwa achievement baru saja diperoleh
}

export interface AchievementCounts {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
  total: number;
}

export interface AchievementInfo {
  metadata: Record<string, any>;
  levels: Record<string, any>;
}

export function useAchievements() {
  const { toast } = useToast();
  const [isCheckingAchievements, setIsCheckingAchievements] = useState(false);
  const [newAchievement, setNewAchievement] = useState<AchievementBadgeProps | null>(null);
  const [showAchievementAnimation, setShowAchievementAnimation] = useState(false);
  
  // Get all user achievements
  const {
    data: achievements = [],
    isLoading: isLoadingAchievements,
    error: achievementsError
  } = useQuery<AchievementEvent[]>({
    queryKey: ['/api/achievements'],
    refetchOnWindowFocus: false
  });
  
  // Get user achievement counts by level
  const {
    data: achievementCounts,
    isLoading: isLoadingCounts,
    error: countsError
  } = useQuery<AchievementCounts>({
    queryKey: ['/api/achievements/counts'],
    refetchOnWindowFocus: false
  });
  
  // Get user profile badges
  const {
    data: badges = [],
    isLoading: isLoadingBadges,
    error: badgesError
  } = useQuery<AchievementBadgeProps[]>({
    queryKey: ['/api/achievements/badges'],
    refetchOnWindowFocus: false
  });
  
  // Get achievement info (metadata and level requirements)
  const {
    data: achievementInfo,
    isLoading: isLoadingInfo,
    error: infoError
  } = useQuery<AchievementInfo>({
    queryKey: ['/api/achievements/info'],
    refetchOnWindowFocus: false
  });
  
  // Check for new achievements
  const checkAchievementsMutation = useMutation({
    mutationFn: async ({ profileCompletionPercent = 0 }: { profileCompletionPercent?: number }) => {
      setIsCheckingAchievements(true);
      const response = await fetch('/api/achievements/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profileCompletionPercent })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memeriksa pencapaian');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to get updated data
      queryClient.invalidateQueries({queryKey: ['/api/achievements']});
      queryClient.invalidateQueries({queryKey: ['/api/achievements/counts']});
      queryClient.invalidateQueries({queryKey: ['/api/achievements/badges']});
      
      // Jika ada achievement baru yang didapatkan
      if (data.newAchievements && data.newAchievements.length > 0) {
        // Ambil achievement baru terakhir untuk ditampilkan di animasi
        const latestAchievement = data.newAchievements[data.newAchievements.length - 1];
        
        // Set achievement baru untuk ditampilkan di animasi
        setNewAchievement({
          type: latestAchievement.achievementType,
          level: latestAchievement.achievementLevel,
          name: latestAchievement.achievementName,
          description: latestAchievement.description || "",
          icon: latestAchievement.icon || "award",
          unlocked: true,
          unlockedAt: latestAchievement.unlockedAt
        });
        
        // Tampilkan animasi achievement
        setShowAchievementAnimation(true);
      } else {
        // Jika tidak ada achievement baru, tampilkan toast biasa
        toast({
          title: "Pencapaian diperbarui",
          description: "Pencapaian Anda telah berhasil diperbarui.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal memeriksa pencapaian",
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsCheckingAchievements(false);
    }
  });
  
  // Seed achievements (for development only)
  const seedAchievementsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/achievements/seed', {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal membuat contoh pencapaian');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      // Invalidate queries to get updated data
      queryClient.invalidateQueries({queryKey: ['/api/achievements']});
      queryClient.invalidateQueries({queryKey: ['/api/achievements/counts']});
      queryClient.invalidateQueries({queryKey: ['/api/achievements/badges']});
      
      // Jika ada achievement baru yang didapatkan
      if (data.newAchievements && data.newAchievements.length > 0) {
        // Ambil achievement baru terakhir untuk ditampilkan di animasi
        const latestAchievement = data.newAchievements[data.newAchievements.length - 1];
        
        // Set achievement baru untuk ditampilkan di animasi
        setNewAchievement({
          type: latestAchievement.achievementType,
          level: latestAchievement.achievementLevel,
          name: latestAchievement.achievementName,
          description: latestAchievement.description || "",
          icon: latestAchievement.icon || "award",
          unlocked: true,
          unlockedAt: latestAchievement.unlockedAt
        });
        
        // Tampilkan animasi achievement
        setShowAchievementAnimation(true);
      } else {
        // Jika tidak ada achievement baru, tampilkan toast biasa
        toast({
          title: "Contoh Pencapaian Ditambahkan",
          description: "Beberapa contoh pencapaian telah ditambahkan ke akun Anda untuk pengujian.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menambahkan contoh pencapaian",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Check for new achievements
  const checkAchievements = ({ profileCompletionPercent = 0 }: { profileCompletionPercent?: number }) => {
    checkAchievementsMutation.mutate({ profileCompletionPercent });
  };
  
  // Seed achievements for testing
  const seedAchievements = () => {
    seedAchievementsMutation.mutate();
  };
  
  // Tutup animasi achievement
  const closeAchievementAnimation = useCallback(() => {
    setShowAchievementAnimation(false);
    setNewAchievement(null);
  }, []);
  
  return {
    achievements,
    achievementCounts,
    badges,
    achievementInfo,
    isLoading: isLoadingAchievements || isLoadingCounts || isLoadingBadges || isLoadingInfo,
    isCheckingAchievements,
    error: achievementsError || countsError || badgesError || infoError,
    checkAchievements,
    seedAchievements,
    // State dan metode untuk animasi
    newAchievement,
    showAchievementAnimation,
    closeAchievementAnimation
  };
}