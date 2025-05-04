import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export type MoodLevel = "very_high" | "high" | "moderate" | "low" | "very_low";

export interface MoodEntry {
  id: number;
  userId: number;
  date: string;
  mood: MoodLevel;
  notes: string | null;
  activities: string[];
  createdAt: string;
}

interface MoodTrackerContextType {
  entries: MoodEntry[];
  isLoading: boolean;
  error: Error | null;
  addEntryMutation: ReturnType<typeof useMutation<MoodEntry, Error, AddMoodEntryData>>;
  deleteEntryMutation: ReturnType<typeof useMutation<void, Error, number>>;
}

interface AddMoodEntryData {
  mood: MoodLevel;
  notes: string;
  activities: string[];
}

interface MoodTrackerProviderProps {
  children: ReactNode;
}

const MoodTrackerContext = createContext<MoodTrackerContextType | null>(null);

export function MoodTrackerProvider({ children }: MoodTrackerProviderProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: entries = [],
    isLoading,
    error,
  } = useQuery<MoodEntry[], Error>({
    queryKey: ["/api/mood-entries"],
    enabled: !!user,
  });

  const addEntryMutation = useMutation<MoodEntry, Error, AddMoodEntryData>({
    mutationFn: async (data: AddMoodEntryData) => {
      const res = await apiRequest("POST", "/api/mood-entries", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menambahkan catatan mood");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
      toast({
        title: "Berhasil",
        description: "Catatan mood Anda telah disimpan",
      });
    },
    onError: (error) => {
      toast({
        title: "Gagal menyimpan catatan mood",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEntryMutation = useMutation<void, Error, number>({
    mutationFn: async (entryId: number) => {
      const res = await apiRequest("DELETE", `/api/mood-entries/${entryId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Gagal menghapus catatan mood");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood-entries"] });
    },
    onError: (error) => {
      toast({
        title: "Gagal menghapus catatan mood",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <MoodTrackerContext.Provider
      value={{
        entries,
        isLoading,
        error,
        addEntryMutation,
        deleteEntryMutation,
      }}
    >
      {children}
    </MoodTrackerContext.Provider>
  );
}

export function useMoodTracker() {
  const context = useContext(MoodTrackerContext);
  if (!context) {
    throw new Error("useMoodTracker must be used within a MoodTrackerProvider");
  }
  return context;
}