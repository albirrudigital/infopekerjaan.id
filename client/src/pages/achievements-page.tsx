import React, { useState, useEffect } from 'react';
import { Award, Search, Volume2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'wouter';
import { AchievementGroup } from '@/components/achievements/achievement-group';
import { AchievementSummary } from '@/components/achievements/achievement-summary';
import { AchievementBadge, getAchievementIcon } from '@/components/achievements/achievement-badge';
import { AchievementAnimation } from '@/components/achievements/achievement-animation';
import { useAchievements, AchievementEvent } from '@/hooks/use-achievements';

/**
 * Halaman pencapaian (achievements) yang menampilkan semua pencapaian yang telah
 * dibuka pengguna, dikelompokkan berdasarkan jenis dan level pencapaian.
 */
const AchievementsPage = () => {
  const {
    achievements,
    badges,
    achievementCounts,
    achievementInfo,
    isLoading,
    checkAchievements,
    isCheckingAchievements,
    seedAchievements,
    // State dan fungsi untuk animasi achievement
    newAchievement,
    showAchievementAnimation,
    closeAchievementAnimation
  } = useAchievements();
  
  const [profileCompletionPercent, setProfileCompletionPercent] = useState(80);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementEvent | null>(null);
  
  // Filter achievements by category and search query
  const filterAchievementsByType = (type: string) => {
    if (!achievements) return [];
    
    const filteredAchievements = achievements.filter(achievement => {
      const matchesType = achievement.achievementType === type;
      const matchesSearch = searchQuery === "" || 
        achievement.achievementName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (achievement.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesSearch;
    });
    
    // Convert AchievementEvent to AchievementBadgeProps
    return filteredAchievements.map(achievement => ({
      type: achievement.achievementType,
      level: achievement.achievementLevel,
      name: achievement.achievementName,
      description: achievement.description || "",
      icon: achievement.icon || "award",
      unlocked: true,
      unlockedAt: achievement.unlockedAt
    }));
  };
  
  // Trigger achievement check
  const handleCheckAchievements = () => {
    checkAchievements({ profileCompletionPercent });
  };
  
  // Helper to get icon for achievement type
  const getIconForType = (type: string) => {
    if (!achievementInfo) return "award";
    
    for (const [key, metadata] of Object.entries(achievementInfo.metadata || {})) {
      if (key === type) {
        return metadata.icon;
      }
    }
    
    return "award";
  };

  // For development only - will be removed in production
  const devTools = (
    <div className="fixed bottom-4 right-4 flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => seedAchievements()}
      >
        Seed Achievements
      </Button>
      <div className="flex items-center gap-2 p-2 bg-background border rounded-md">
        <span className="text-xs text-muted-foreground">Profile Completion:</span>
        <Input
          type="number"
          min="0"
          max="100"
          value={profileCompletionPercent}
          onChange={(e) => setProfileCompletionPercent(Number(e.target.value))}
          className="w-16 h-8"
        />
        <span className="text-xs">%</span>
      </div>
    </div>
  );

  return (
    <div className="container py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Pencapaian
          </h1>
          <p className="text-muted-foreground">
            Lihat dan koleksi pencapaian Anda di InfoPekerjaan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/sound-settings">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Volume2 className="h-4 w-4" />
              <span className="hidden sm:inline">Efek Suara</span>
            </Button>
          </Link>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pencapaian..."
              className="pl-9 w-[200px] md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-3">
          <AchievementSummary
            badges={badges || []}
            counts={achievementCounts || { bronze: 0, silver: 0, gold: 0, platinum: 0, total: 0 }}
            onCheckAchievements={handleCheckAchievements}
            isLoading={isLoading}
            isChecking={isCheckingAchievements}
          />
        </div>
        
        <div className="md:col-span-3">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start mb-4 overflow-auto">
              <TabsTrigger value="all">Semua</TabsTrigger>
              <TabsTrigger value="profile_completion">Kelengkapan Profil</TabsTrigger>
              <TabsTrigger value="application_milestone">Pencari Kerja</TabsTrigger>
              <TabsTrigger value="job_posting_milestone">Perekrut</TabsTrigger>
              <TabsTrigger value="platform_engagement">Keterlibatan Platform</TabsTrigger>
              <TabsTrigger value="response_rate">Tingkat Respons</TabsTrigger>
              <TabsTrigger value="application_quality">Kualitas Lamaran</TabsTrigger>
              <TabsTrigger value="interview_success">Keberhasilan Interview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-28" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AchievementGroup
                    title="Kelengkapan Profil"
                    description="Pencapaian dari melengkapi profil Anda"
                    achievements={filterAchievementsByType("profile_completion")}
                    isLoading={isLoading}
                  />
                  
                  <AchievementGroup
                    title="Pencari Kerja"
                    description="Pencapaian dari aktivitas aplikasi lamaran"
                    achievements={filterAchievementsByType("application_milestone")}
                    isLoading={isLoading}
                  />
                  
                  <AchievementGroup
                    title="Perekrut"
                    description="Pencapaian dari posting lowongan kerja"
                    achievements={filterAchievementsByType("job_posting_milestone")}
                    isLoading={isLoading}
                  />
                  
                  <AchievementGroup
                    title="Keterlibatan Platform"
                    description="Pencapaian dari keterlibatan di platform"
                    achievements={filterAchievementsByType("platform_engagement")}
                    isLoading={isLoading}
                  />
                  
                  <AchievementGroup
                    title="Tingkat Respons"
                    description="Pencapaian dari kecepatan respons"
                    achievements={filterAchievementsByType("response_rate")}
                    isLoading={isLoading}
                  />
                  
                  <AchievementGroup
                    title="Kualitas Lamaran"
                    description="Pencapaian dari kualitas lamaran"
                    achievements={filterAchievementsByType("application_quality")}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="profile_completion">
              <AchievementGroup
                title="Kelengkapan Profil"
                description="Pencapaian dari melengkapi profil Anda"
                achievements={filterAchievementsByType("profile_completion")}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="application_milestone">
              <AchievementGroup
                title="Pencari Kerja"
                description="Pencapaian dari aktivitas aplikasi lamaran"
                achievements={filterAchievementsByType("application_milestone")}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="job_posting_milestone">
              <AchievementGroup
                title="Perekrut"
                description="Pencapaian dari posting lowongan kerja"
                achievements={filterAchievementsByType("job_posting_milestone")}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="platform_engagement">
              <AchievementGroup
                title="Keterlibatan Platform"
                description="Pencapaian dari keterlibatan di platform"
                achievements={filterAchievementsByType("platform_engagement")}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="response_rate">
              <AchievementGroup
                title="Tingkat Respons"
                description="Pencapaian dari kecepatan respons"
                achievements={filterAchievementsByType("response_rate")}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="application_quality">
              <AchievementGroup
                title="Kualitas Lamaran"
                description="Pencapaian dari kualitas lamaran"
                achievements={filterAchievementsByType("application_quality")}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="interview_success">
              <AchievementGroup
                title="Keberhasilan Interview"
                description="Pencapaian dari keberhasilan interview"
                achievements={filterAchievementsByType("interview_success")}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {selectedAchievement && (
        <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedAchievement.achievementName}</DialogTitle>
              <DialogDescription>
                {selectedAchievement.description}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-6">
              <div className="text-6xl mb-4">
                {getAchievementIcon(selectedAchievement.icon || getIconForType(selectedAchievement.achievementType))}
              </div>
              <div className="text-center">
                <AchievementBadge
                  type={selectedAchievement.achievementType}
                  level={selectedAchievement.achievementLevel}
                  name={selectedAchievement.achievementName}
                  description={selectedAchievement.description || ""}
                  icon={selectedAchievement.icon}
                  unlocked={true}
                  size="lg"
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  Diperoleh pada {new Date(selectedAchievement.unlockedAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Animasi pencapaian baru */}
      {newAchievement && (
        <AchievementAnimation 
          achievement={newAchievement}
          isOpen={showAchievementAnimation}
          onClose={closeAchievementAnimation}
        />
      )}
      
      {/* Development tools - remove in production */}
      {devTools}
    </div>
  );
};

export default AchievementsPage;