import React from 'react';
import { 
  Award, 
  Trophy, 
  Medal, 
  Crown, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { 
  HoverCard, 
  HoverCardContent, 
  HoverCardTrigger 
} from '@/components/ui/hover-card';
import { AchievementBadge, AchievementBadgeProps } from './achievement-badge';
import { AchievementLevel } from '@/hooks/use-achievements';

export interface AchievementCountsProps {
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
  total: number;
}

interface AchievementSummaryProps {
  badges: AchievementBadgeProps[];
  counts: AchievementCountsProps;
  onCheckAchievements: () => void;
  isLoading: boolean;
  isChecking: boolean;
}

interface AchievementLevelInfoProps {
  level: AchievementLevel;
  count: number;
  icon: React.ReactNode;
  total: number;
}

const AchievementLevelInfo: React.FC<AchievementLevelInfoProps> = ({
  level,
  count,
  icon,
  total
}) => {
  const levelLabels: Record<AchievementLevel, string> = {
    bronze: 'Perunggu',
    silver: 'Perak',
    gold: 'Emas',
    platinum: 'Platinum'
  };
  
  const levelColors: Record<AchievementLevel, string> = {
    bronze: 'text-amber-500 dark:text-amber-400',
    silver: 'text-slate-400 dark:text-slate-300',
    gold: 'text-yellow-500 dark:text-yellow-300',
    platinum: 'text-indigo-500 dark:text-indigo-300'
  };
  
  const progressColors: Record<AchievementLevel, string> = {
    bronze: 'bg-amber-500 dark:bg-amber-400',
    silver: 'bg-slate-400 dark:bg-slate-300',
    gold: 'bg-yellow-500 dark:bg-yellow-300',
    platinum: 'bg-indigo-500 dark:bg-indigo-300'
  };
  
  const progress = total > 0 ? Math.floor((count / total) * 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className={`${levelColors[level]}`}>
            {icon}
          </span>
          <span className="text-sm font-medium">{levelLabels[level]}</span>
        </div>
        <span className="text-sm text-muted-foreground">{count}/{total}</span>
      </div>
      <Progress 
        value={progress} 
        className={`h-1.5 ${progressColors[level]}`} 
      />
    </div>
  );
};

export const AchievementSummary: React.FC<AchievementSummaryProps> = ({
  badges = [],
  counts,
  onCheckAchievements,
  isLoading,
  isChecking
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-3 space-y-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-1 flex flex-col gap-4">
            <Skeleton className="h-8 w-full" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const totalAchievements = counts?.total || 0;
  const collectedAchievements = (counts?.bronze || 0) + (counts?.silver || 0) + (counts?.gold || 0) + (counts?.platinum || 0);
  const collectionPercent = totalAchievements > 0 ? Math.floor((collectedAchievements / totalAchievements) * 100) : 0;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Ringkasan Pencapaian
        </CardTitle>
        <CardDescription>
          Kumpulkan pencapaian untuk menunjukkan progres dan keahlian Anda di InfoPekerjaan
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-3 space-y-6">
          <div className="space-y-4">
            <AchievementLevelInfo 
              level="bronze" 
              count={counts?.bronze || 0} 
              total={totalAchievements} 
              icon={<Medal className="h-4 w-4" />} 
            />
            
            <AchievementLevelInfo 
              level="silver" 
              count={counts?.silver || 0} 
              total={totalAchievements} 
              icon={<Medal className="h-4 w-4" />} 
            />
            
            <AchievementLevelInfo 
              level="gold" 
              count={counts?.gold || 0} 
              total={totalAchievements} 
              icon={<Trophy className="h-4 w-4" />} 
            />
            
            <AchievementLevelInfo 
              level="platinum" 
              count={counts?.platinum || 0} 
              total={totalAchievements} 
              icon={<Crown className="h-4 w-4" />} 
            />
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Progres Koleksi</span>
              <span className="text-sm text-muted-foreground">{collectedAchievements}/{totalAchievements} ({collectionPercent}%)</span>
            </div>
            <Progress value={collectionPercent} className="h-2" />
          </div>
        </div>
        
        <div className="col-span-1 flex flex-col gap-4">
          <Button 
            className="w-full gap-2" 
            onClick={onCheckAchievements}
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Memeriksa...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Periksa Pencapaian</span>
              </>
            )}
          </Button>
          
          {badges.length > 0 ? (
            <div>
              <h4 className="text-sm font-medium mb-2">Badge Profil</h4>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <HoverCard key={`${badge.type}-${badge.level}-${index}`}>
                    <HoverCardTrigger asChild>
                      <div>
                        <AchievementBadge
                          type={badge.type}
                          level={badge.level}
                          name={badge.name}
                          description={badge.description}
                          icon={badge.icon}
                          size="md"
                          unlocked={true}
                        />
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex justify-between">
                        <div>
                          <h4 className="text-sm font-semibold">{badge.name}</h4>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Belum ada badge profil. Kumpulkan lebih banyak pencapaian untuk mendapatkan badge.
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Terus tingkatkan aktivitas di InfoPekerjaan untuk memperoleh lebih banyak pencapaian
        </p>
      </CardFooter>
    </Card>
  );
};