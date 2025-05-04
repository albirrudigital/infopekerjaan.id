import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface LeaderboardFilters {
  type?: string;
  timeframe?: string; 
  category?: string | null;
  level?: string | null;
}

interface LeaderboardEntryFilters {
  limit?: number;
  offset?: number;
}

// Hook untuk mendapatkan semua leaderboard berdasarkan filter
export function useLeaderboards(filters?: LeaderboardFilters) {
  const queryKey = ["/api/leaderboards", filters];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (filters?.type) queryParams.append("type", filters.type);
      if (filters?.timeframe) queryParams.append("timeframe", filters.timeframe);
      if (filters?.category) queryParams.append("category", filters.category);
      if (filters?.level) queryParams.append("level", filters.level);
      
      const queryString = queryParams.toString();
      const url = `/api/leaderboards${queryString ? `?${queryString}` : ""}`;
      
      const res = await apiRequest("GET", url);
      return await res.json();
    },
  });
}

// Hook untuk mendapatkan satu leaderboard berdasarkan ID
export function useLeaderboard(id: number) {
  return useQuery({
    queryKey: ["/api/leaderboards", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await apiRequest("GET", `/api/leaderboards/${id}`);
      return await res.json();
    },
    enabled: !!id,
  });
}

// Hook untuk mendapatkan entry leaderboard berdasarkan leaderboard ID
export function useLeaderboardEntries(leaderboardId: number, options?: LeaderboardEntryFilters) {
  return useQuery({
    queryKey: ["/api/leaderboards", leaderboardId, "entries", options],
    queryFn: async () => {
      if (!leaderboardId) return [];
      
      const queryParams = new URLSearchParams();
      
      if (options?.limit) queryParams.append("limit", options.limit.toString());
      if (options?.offset) queryParams.append("offset", options.offset.toString());
      
      const queryString = queryParams.toString();
      const url = `/api/leaderboards/${leaderboardId}/entries${queryString ? `?${queryString}` : ""}`;
      
      const res = await apiRequest("GET", url);
      return await res.json();
    },
    enabled: !!leaderboardId,
  });
}

// Hook untuk inisialisasi default leaderboards (admin only)
export function useInitializeDefaultLeaderboards() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/leaderboards/initialize-default");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Leaderboard default berhasil diinisialisasi",
      });
      
      // Invalidate leaderboards query
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboards"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: `Gagal menginisialisasi leaderboard default: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook untuk update leaderboard dari achievement (admin only)
export function useUpdateLeaderboardFromAchievements() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/leaderboards/update-from-achievements");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Sukses",
        description: "Leaderboard berhasil diperbarui dari achievement",
      });
      
      // Invalidate leaderboards & entries query
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboards"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal",
        description: `Gagal memperbarui leaderboard dari achievement: ${error.message}`,
        variant: "destructive",
      });
    },
  });
}

// Hook untuk mendapatkan peringkat user saat ini dalam leaderboard
export function useUserRank(leaderboardId: number) {
  return useQuery({
    queryKey: ["/api/leaderboards", leaderboardId, "user-rank"],
    queryFn: async () => {
      if (!leaderboardId) return null;
      const res = await apiRequest("GET", `/api/leaderboards/${leaderboardId}/user-rank`);
      return await res.json();
    },
    enabled: !!leaderboardId,
  });
}