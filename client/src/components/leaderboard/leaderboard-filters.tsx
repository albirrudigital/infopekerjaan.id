import React from "react";
import { useLeaderboards } from "@/hooks/use-leaderboards";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Loader2, 
  Trophy, 
  Medal, 
  Timer, 
  Calendar, 
  Clock, 
  LayoutList, 
  BarChart3,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LeaderboardFiltersProps {
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  selectedLevel: string | null;
  setSelectedLevel: (level: string | null) => void;
  selectedLeaderboardId: number | null;
  setSelectedLeaderboardId: (id: number | null) => void;
}

export function LeaderboardFilters({
  selectedType,
  setSelectedType,
  selectedTimeframe,
  setSelectedTimeframe,
  selectedCategory,
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  selectedLeaderboardId,
  setSelectedLeaderboardId,
}: LeaderboardFiltersProps) {
  // Fetch leaderboards data
  const { 
    data: leaderboards, 
    isLoading: leaderboardsLoading 
  } = useLeaderboards({
    type: selectedType,
    timeframe: selectedTimeframe,
    category: selectedCategory,
    level: selectedLevel,
  });

  // Set default leaderboard when data is loaded
  React.useEffect(() => {
    if (leaderboards && leaderboards.length > 0 && !selectedLeaderboardId) {
      setSelectedLeaderboardId(leaderboards[0].id);
    }
  }, [leaderboards, selectedLeaderboardId, setSelectedLeaderboardId]);

  // Handler for type selection
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setSelectedLeaderboardId(null);
  };

  // Handler for timeframe selection
  const handleTimeframeChange = (value: string) => {
    setSelectedTimeframe(value);
    setSelectedLeaderboardId(null);
  };

  // Handler for category selection
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : value);
    setSelectedLeaderboardId(null);
  };

  // Handler for level selection
  const handleLevelChange = (value: string) => {
    setSelectedLevel(value === "all" ? null : value);
    setSelectedLeaderboardId(null);
  };

  // Handler for leaderboard selection
  const handleLeaderboardChange = (value: string) => {
    setSelectedLeaderboardId(Number(value));
  };

  return (
    <div className="space-y-6">
      {/* Leaderboard Type Filter */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <Label className="text-base font-medium">Tipe Peringkat</Label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
          <div 
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
              selectedType === "global" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted"
            )}
            onClick={() => handleTypeChange("global")}
          >
            <Trophy className={cn(
              "h-6 w-6 mb-2",
              selectedType === "global" ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-sm font-medium",
              selectedType === "global" ? "text-primary" : "text-foreground"
            )}>
              Global
            </span>
            {selectedType === "global" && (
              <Badge variant="secondary" className="mt-2 text-xs">
                Aktif
              </Badge>
            )}
          </div>
          
          <div 
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
              selectedType === "category" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted"
            )}
            onClick={() => handleTypeChange("category")}
          >
            <LayoutList className={cn(
              "h-6 w-6 mb-2",
              selectedType === "category" ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-sm font-medium text-center",
              selectedType === "category" ? "text-primary" : "text-foreground"
            )}>
              Berdasarkan Kategori
            </span>
            {selectedType === "category" && (
              <Badge variant="secondary" className="mt-2 text-xs">
                Aktif
              </Badge>
            )}
          </div>
          
          <div 
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
              selectedType === "level" 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50 hover:bg-muted"
            )}
            onClick={() => handleTypeChange("level")}
          >
            <Medal className={cn(
              "h-6 w-6 mb-2",
              selectedType === "level" ? "text-primary" : "text-muted-foreground"
            )} />
            <span className={cn(
              "text-sm font-medium",
              selectedType === "level" ? "text-primary" : "text-foreground"
            )}>
              Berdasarkan Level
            </span>
            {selectedType === "level" && (
              <Badge variant="secondary" className="mt-2 text-xs">
                Aktif
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Timeframe Filter */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-primary" />
          <Label className="text-base font-medium">Periode Waktu</Label>
        </div>
        <Tabs 
          value={selectedTimeframe} 
          onValueChange={handleTimeframeChange}
          className="mt-2"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="all_time" className="text-xs sm:text-sm flex items-center gap-1">
              <Timer className="h-4 w-4 md:mr-1 hidden md:block" />
              <span>Sepanjang Waktu</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs sm:text-sm flex items-center gap-1">
              <Calendar className="h-4 w-4 md:mr-1 hidden md:block" />
              <span>Bulanan</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs sm:text-sm flex items-center gap-1">
              <Clock className="h-4 w-4 md:mr-1 hidden md:block" />
              <span>Mingguan</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Category Filter (Only shown if type is 'category') */}
      {selectedType === "category" && (
        <>
          <Separator />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LayoutList className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Kategori Achievement</Label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
              <div 
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                  !selectedCategory 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted"
                )}
                onClick={() => handleCategoryChange("all")}
              >
                <span className="text-sm font-medium">Semua Kategori</span>
                {!selectedCategory && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
              
              <div 
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                  selectedCategory === "networking_champion" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted"
                )}
                onClick={() => handleCategoryChange("networking_champion")}
              >
                <span className="text-sm font-medium">Juara Networking</span>
                {selectedCategory === "networking_champion" && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
              
              <div 
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                  selectedCategory === "skill_builder" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted"
                )}
                onClick={() => handleCategoryChange("skill_builder")}
              >
                <span className="text-sm font-medium">Pengembang Skill</span>
                {selectedCategory === "skill_builder" && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
            </div>
            
            <Select
              value={selectedCategory || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Pilih kategori lainnya" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profile_completion">Kelengkapan Profil</SelectItem>
                <SelectItem value="application_milestone">Milestone Lamaran</SelectItem>
                <SelectItem value="job_posting_milestone">Milestone Posting Lowongan</SelectItem>
                <SelectItem value="platform_engagement">Keterlibatan Platform</SelectItem>
                <SelectItem value="response_rate">Tingkat Respons</SelectItem>
                <SelectItem value="application_quality">Kualitas Lamaran</SelectItem>
                <SelectItem value="interview_success">Sukses Wawancara</SelectItem>
                <SelectItem value="mentor_badge">Badge Mentor</SelectItem>
                <SelectItem value="all">Semua Kategori</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      {/* Level Filter (Only shown if type is 'level') */}
      {selectedType === "level" && (
        <>
          <Separator />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Medal className="h-5 w-5 text-primary" />
              <Label className="text-base font-medium">Level Achievement</Label>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
              <div 
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                  !selectedLevel
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted"
                )}
                onClick={() => handleLevelChange("all")}
              >
                <span className="text-sm font-medium">Semua Level</span>
                {!selectedLevel && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
              
              <div 
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                  selectedLevel === "bronze" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted bg-amber-50/50"
                )}
                onClick={() => handleLevelChange("bronze")}
              >
                <Award className={cn(
                  "h-5 w-5 mb-1",
                  selectedLevel === "bronze" ? "text-amber-600" : "text-amber-600/70"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  selectedLevel === "bronze" ? "text-amber-700" : "text-amber-700/70"
                )}>Perunggu</span>
                {selectedLevel === "bronze" && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
              
              <div 
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                  selectedLevel === "silver" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted bg-gray-50/50"
                )}
                onClick={() => handleLevelChange("silver")}
              >
                <BadgeCheck className={cn(
                  "h-5 w-5 mb-1",
                  selectedLevel === "silver" ? "text-gray-600" : "text-gray-600/70"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  selectedLevel === "silver" ? "text-gray-700" : "text-gray-700/70"
                )}>Perak</span>
                {selectedLevel === "silver" && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
              
              <div 
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all",
                  selectedLevel === "gold" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted bg-yellow-50/50"
                )}
                onClick={() => handleLevelChange("gold")}
              >
                <Trophy className={cn(
                  "h-5 w-5 mb-1",
                  selectedLevel === "gold" ? "text-yellow-600" : "text-yellow-600/70"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  selectedLevel === "gold" ? "text-yellow-700" : "text-yellow-700/70"
                )}>Emas</span>
                {selectedLevel === "gold" && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
              
              <div 
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all col-span-2 sm:col-span-4",
                  selectedLevel === "platinum" 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted bg-violet-50/50"
                )}
                onClick={() => handleLevelChange("platinum")}
              >
                <Shield className={cn(
                  "h-5 w-5 mb-1",
                  selectedLevel === "platinum" ? "text-violet-600" : "text-violet-600/70"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  selectedLevel === "platinum" ? "text-violet-700" : "text-violet-700/70"
                )}>Platinum</span>
                {selectedLevel === "platinum" && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Aktif
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Leaderboard Selection */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-primary" />
          <Label className="text-base font-medium">Pilih Leaderboard</Label>
        </div>
        
        {leaderboardsLoading ? (
          <div className="mt-2 space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-2">
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Memuat data leaderboard...</span>
            </div>
          </div>
        ) : leaderboards && leaderboards.length > 0 ? (
          <>
            <Select
              value={selectedLeaderboardId?.toString() || ""}
              onValueChange={handleLeaderboardChange}
            >
              <SelectTrigger className="mt-2 h-12">
                <SelectValue placeholder="Pilih leaderboard" />
              </SelectTrigger>
              <SelectContent>
                {leaderboards.map((leaderboard) => (
                  <SelectItem 
                    key={leaderboard.id} 
                    value={leaderboard.id.toString()}
                  >
                    <div className="flex items-center gap-2">
                      {leaderboard.type === "global" && <Trophy className="h-4 w-4 text-yellow-600" />}
                      {leaderboard.type === "category" && <LayoutList className="h-4 w-4 text-blue-600" />}
                      {leaderboard.type === "level" && <Medal className="h-4 w-4 text-violet-600" />}
                      <span>{leaderboard.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedLeaderboardId && (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filter aktif: {selectedType === "global" ? "Global" : selectedType === "category" ? "Kategori" : "Level"}</span>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {selectedTimeframe === "all_time" 
                      ? "Sepanjang waktu" 
                      : selectedTimeframe === "monthly" 
                        ? "Bulanan" 
                        : "Mingguan"}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-2 border rounded-md p-4 text-sm text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-muted rounded-full">
                <Trophy className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <p className="text-muted-foreground">
              Tidak ada leaderboard yang tersedia dengan filter yang dipilih.
            </p>
            <p className="text-xs text-muted-foreground">
              Coba pilih filter lain untuk melihat leaderboard yang tersedia.
            </p>
          </div>
        )}
      </div>
      
      {/* Summary of active filters */}
      {selectedLeaderboardId && (
        <>
          <Separator />
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              className="gap-2 text-primary"
              onClick={() => {
                setSelectedType("global");
                setSelectedCategory(null);
                setSelectedLevel(null);
                setSelectedTimeframe("all_time");
                setSelectedLeaderboardId(null);
              }}
            >
              <Filter className="h-4 w-4" />
              <span>Reset Semua Filter</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}