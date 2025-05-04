import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { MoodLevel } from "@/hooks/use-mood-tracker";

export interface MotivationTip {
  id: number;
  title: string;
  content: string;
  category: "career_development" | "mental_health" | "job_search" | "interview_preparation" | "networking";
  targetMotivation: MoodLevel;
  createdAt: Date;
}

interface MotivationTipsContextType {
  tips: MotivationTip[];
  isLoading: boolean;
  error: Error | null;
  getTipsForMood: (mood: MoodLevel) => MotivationTip[];
  getTipsByCategory: (category: MotivationTip["category"]) => MotivationTip[];
}

interface MotivationTipsProviderProps {
  children: ReactNode;
}

const MotivationTipsContext = createContext<MotivationTipsContextType | null>(null);

export function MotivationTipsProvider({ children }: MotivationTipsProviderProps) {
  const {
    data: tips = [],
    isLoading,
    error,
  } = useQuery<MotivationTip[], Error>({
    queryKey: ["/api/motivation-tips"],
  });

  const getTipsForMood = (mood: MoodLevel): MotivationTip[] => {
    return tips.filter((tip) => tip.targetMotivation === mood);
  };

  const getTipsByCategory = (category: MotivationTip["category"]): MotivationTip[] => {
    return tips.filter((tip) => tip.category === category);
  };

  return (
    <MotivationTipsContext.Provider
      value={{
        tips,
        isLoading,
        error,
        getTipsForMood,
        getTipsByCategory,
      }}
    >
      {children}
    </MotivationTipsContext.Provider>
  );
}

export function useMotivationTips() {
  const context = useContext(MotivationTipsContext);
  if (!context) {
    throw new Error("useMotivationTips must be used within a MotivationTipsProvider");
  }
  return context;
}