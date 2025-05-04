import React from 'react';
import { ProfileCompletionProgressBar } from './progress-bar';
import { ProfileCompletionList } from './profile-completion-list';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Sparkles, Star, Shield } from 'lucide-react';
import { useProfileCompletion } from '@/hooks/use-profile-completion';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProfileCompletionDashboardProps {
  className?: string;
}

/**
 * Dashboard Lengkap untuk fitur Gamified Profile Completion
 */
export function ProfileCompletionDashboard({ className }: ProfileCompletionDashboardProps) {
  const {
    completionData,
    percentageData,
    isLoading,
    updateCompletionMutation
  } = useProfileCompletion();

  // Handler untuk memperbarui status item profil
  const handleToggleItem = (itemId: number, completed: boolean) => {
    updateCompletionMutation.mutate({ itemId, completed });
  };

  // Render skeleton saat loading
  if (isLoading || !completionData || !percentageData) {
    return <ProfileCompletionDashboardSkeleton />;
  }

  const { 
    percentage,
    items,
    groupedItems,
    totalItems,
    completedItems
  } = completionData;

  // Perhitungan untuk efek gamifikasi
  const earnedPoints = items
    .filter(item => item.completed)
    .reduce((sum, item) => sum + item.pointValue, 0);
  
  const totalPoints = items.reduce((sum, item) => sum + item.pointValue, 0);
  const nextMilestone = Math.ceil(percentage / 25) * 25;
  const pointsToNextMilestone = Math.ceil((nextMilestone * totalPoints / 100) - earnedPoints);

  // Tentukan badge yang akan ditampilkan berdasarkan persentase
  const getBadgeInfo = () => {
    if (percentage === 100) {
      return {
        icon: <Trophy className="h-8 w-8 text-yellow-500" />,
        title: "PROFIL MASTER",
        colorClass: "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white"
      };
    } else if (percentage >= 75) {
      return {
        icon: <Shield className="h-8 w-8 text-purple-500" />,
        title: "PROFIL PRO",
        colorClass: "bg-gradient-to-br from-purple-400 to-purple-600 text-white"
      };
    } else if (percentage >= 50) {
      return {
        icon: <Medal className="h-8 w-8 text-blue-500" />,
        title: "PROFIL STAR",
        colorClass: "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
      };
    } else if (percentage >= 25) {
      return {
        icon: <Sparkles className="h-8 w-8 text-green-500" />,
        title: "PROFIL STARTER",
        colorClass: "bg-gradient-to-br from-green-400 to-green-600 text-white"
      };
    } else {
      return {
        icon: <Star className="h-8 w-8 text-gray-500" />,
        title: "PROFIL BARU",
        colorClass: "bg-gradient-to-br from-gray-400 to-gray-600 text-white"
      };
    }
  };

  const { icon, title, colorClass } = getBadgeInfo();

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Bar */}
      <ProfileCompletionProgressBar percentage={percentage} />
      
      {/* Gamification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Badge */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Level Profil</CardTitle>
            <CardDescription>Tingkat kelengkapan profil Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className={cn("p-3 rounded-full mb-2", colorClass)}>
                {icon}
              </div>
              <Badge className={cn("py-1 px-3 text-xs font-bold", colorClass)}>
                {title}
              </Badge>
              <p className="text-xs mt-2 text-center text-muted-foreground">
                {percentage < 100 ? 
                  `Lengkapi ${nextMilestone - percentage}% lagi untuk naik level berikutnya` : 
                  "Selamat! Anda telah mencapai level tertinggi"
                }
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Points */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Poin Profil</CardTitle>
            <CardDescription>Poin yang telah Anda kumpulkan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">
                {earnedPoints}
                <span className="text-sm text-muted-foreground font-normal">/{totalPoints}</span>
              </div>
              <p className="text-xs mt-2 text-center text-muted-foreground">
                {percentage < 100 ? 
                  `${pointsToNextMilestone} poin lagi untuk mencapai milestone berikutnya` : 
                  "Anda telah mengumpulkan semua poin"
                }
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Progress Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Progres Profil</CardTitle>
            <CardDescription>Item yang telah dilengkapi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-primary">
                {completedItems}
                <span className="text-sm text-muted-foreground font-normal">/{totalItems}</span>
              </div>
              <p className="text-xs mt-2 text-center text-muted-foreground">
                {completedItems === totalItems ? 
                  "Semua item telah dilengkapi" : 
                  `${totalItems - completedItems} item belum dilengkapi`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Item List */}
      <ProfileCompletionList 
        items={items} 
        groupedItems={groupedItems} 
        onToggle={handleToggleItem} 
      />
    </div>
  );
}

/**
 * Skeleton loader untuk ProfileCompletionDashboard
 */
function ProfileCompletionDashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Progress Bar Skeleton */}
      <div className="w-full p-4 rounded-lg border bg-card shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-3 w-full mb-1" />
        <div className="flex justify-between items-center mt-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <Skeleton className="h-12 w-12 rounded-full mb-2" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40 mt-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Item List Skeleton */}
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="bg-muted/30 p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <div className="p-3 space-y-3">
              {[1, 2, 3].map(j => (
                <div key={j} className="flex items-start p-3 rounded-lg border">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-grow">
                    <div className="flex items-center mb-1">
                      <Skeleton className="h-4 w-40 mr-auto" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-3 w-full mb-2" />
                    <div className="flex items-center justify-between mt-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}