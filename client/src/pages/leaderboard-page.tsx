import React from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { LeaderboardFilters } from "@/components/leaderboard/leaderboard-filters";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useInitializeDefaultLeaderboards, 
  useUpdateLeaderboardFromAchievements, 
  useLeaderboard 
} from "@/hooks/use-leaderboards";
import { Trophy, Medal, Award, Info, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.type === "admin";
  
  // Leaderboard filters state
  const [selectedType, setSelectedType] = React.useState("global");
  const [selectedTimeframe, setSelectedTimeframe] = React.useState("all_time");
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = React.useState<string | null>(null);
  const [selectedLeaderboardId, setSelectedLeaderboardId] = React.useState<number | null>(null);
  const [showDetailedStats, setShowDetailedStats] = React.useState(true);
  
  // Get selected leaderboard details
  const { 
    data: selectedLeaderboard, 
    isLoading: leaderboardLoading 
  } = useLeaderboard(selectedLeaderboardId || 0);
  
  // Admin mutations
  const initializeLeaderboardsMutation = useInitializeDefaultLeaderboards();
  const updateLeaderboardFromAchievementsMutation = useUpdateLeaderboardFromAchievements();
  
  // Handler for initialize leaderboards button
  const handleInitializeLeaderboards = () => {
    initializeLeaderboardsMutation.mutate();
  };
  
  // Handler for update from achievements button
  const handleUpdateFromAchievements = () => {
    updateLeaderboardFromAchievementsMutation.mutate();
  };
  
  // Handler for refresh data button
  const handleRefreshData = () => {
    toast({
      title: "Memperbarui Data",
      description: "Menyegarkan data peringkat...",
    });
    
    // Refresh by updating from achievements first
    updateLeaderboardFromAchievementsMutation.mutate();
  };
  
  return (
    <>
      <Helmet>
        <title>Leaderboard - InfoPekerjaan.id</title>
      </Helmet>
      
      <div className="container max-w-7xl py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Papan Peringkat</h1>
            <p className="text-gray-500 mt-1">
              Lihat peringkat pengguna berdasarkan achievement yang diperoleh
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={handleInitializeLeaderboards}
                disabled={initializeLeaderboardsMutation.isPending}
              >
                Inisialisasi Leaderboard
              </Button>
            )}
            
            <Button 
              onClick={handleRefreshData}
              disabled={updateLeaderboardFromAchievementsMutation.isPending}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Perbarui Data
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Filters */}
          <div className="col-span-12 md:col-span-4 lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Filter</CardTitle>
                <CardDescription>
                  Pilih jenis peringkat yang ingin ditampilkan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeaderboardFilters 
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedTimeframe={selectedTimeframe}
                  setSelectedTimeframe={setSelectedTimeframe}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  selectedLevel={selectedLevel}
                  setSelectedLevel={setSelectedLevel}
                  selectedLeaderboardId={selectedLeaderboardId}
                  setSelectedLeaderboardId={setSelectedLeaderboardId}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Leaderboard */}
          <div className="col-span-12 md:col-span-8 lg:col-span-9 space-y-6">
            {/* Leaderboard Info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    {leaderboardLoading ? (
                      <Skeleton className="h-6 w-44" />
                    ) : selectedLeaderboard ? (
                      <CardTitle>{selectedLeaderboard.name}</CardTitle>
                    ) : (
                      <CardTitle>Tidak ada leaderboard yang dipilih</CardTitle>
                    )}
                    
                    {leaderboardLoading ? (
                      <Skeleton className="h-4 w-64 mt-1" />
                    ) : selectedLeaderboard ? (
                      <CardDescription>{selectedLeaderboard.description}</CardDescription>
                    ) : null}
                  </div>
                  
                  <div>
                    <Tabs 
                      value={showDetailedStats ? "detailed" : "simple"}
                      onValueChange={(val) => setShowDetailedStats(val === "detailed")}
                    >
                      <TabsList>
                        <TabsTrigger value="simple">Sederhana</TabsTrigger>
                        <TabsTrigger value="detailed">Detail</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedLeaderboardId ? (
                  <LeaderboardTable 
                    leaderboardId={selectedLeaderboardId} 
                    limit={20}
                    showDetailedStats={showDetailedStats}
                  />
                ) : (
                  <div className="bg-blue-50 p-4 rounded-md text-blue-600 flex items-start gap-3">
                    <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Tidak ada peringkat yang tersedia</p>
                      <p className="text-sm text-blue-500 mt-1">
                        Silakan pilih filter yang berbeda atau coba perbarui data peringkat.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Achievement Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Tentang Sistem Peringkat</CardTitle>
                <CardDescription>
                  Informasi tentang cara kerja sistem peringkat InfoPekerjaan.id
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {/* Achievement Levels */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Level Achievement</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-amber-50 p-4 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Medal className="h-5 w-5 text-amber-600" />
                          <h4 className="font-semibold text-amber-700">Perunggu</h4>
                        </div>
                        <p className="text-sm text-amber-600">
                          Level dasar untuk achievement awal
                        </p>
                      </div>
                      
                      <div className="bg-gray-100 p-4 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Medal className="h-5 w-5 text-gray-500" />
                          <h4 className="font-semibold text-gray-700">Perak</h4>
                        </div>
                        <p className="text-sm text-gray-600">
                          Level menengah untuk achievement reguler
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-5 w-5 text-yellow-600" />
                          <h4 className="font-semibold text-yellow-700">Emas</h4>
                        </div>
                        <p className="text-sm text-yellow-600">
                          Level tinggi untuk achievement progresif
                        </p>
                      </div>
                      
                      <div className="bg-violet-50 p-4 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-violet-600" />
                          <h4 className="font-semibold text-violet-700">Platinum</h4>
                        </div>
                        <p className="text-sm text-violet-600">
                          Level tertinggi untuk achievement master
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* How Scoring Works */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Cara Perhitungan Skor</h3>
                    <p className="mb-3 text-gray-600">
                      Skor pada peringkat dihitung berdasarkan achievement yang diperoleh dengan bobot sebagai berikut:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 pl-5 list-disc">
                      <li>Setiap achievement Platinum bernilai 4 poin</li>
                      <li>Setiap achievement Emas bernilai 3 poin</li>
                      <li>Setiap achievement Perak bernilai 2 poin</li>
                      <li>Setiap achievement Perunggu bernilai 1 poin</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  {/* Period Information */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Periode Peringkat</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="border p-4 rounded-md">
                        <h4 className="font-semibold mb-2">Sepanjang Waktu</h4>
                        <p className="text-sm text-gray-600">
                          Peringkat berdasarkan semua achievement yang pernah diperoleh
                        </p>
                      </div>
                      
                      <div className="border p-4 rounded-md">
                        <h4 className="font-semibold mb-2">Bulanan</h4>
                        <p className="text-sm text-gray-600">
                          Peringkat berdasarkan achievement yang diperoleh dalam bulan ini
                        </p>
                      </div>
                      
                      <div className="border p-4 rounded-md">
                        <h4 className="font-semibold mb-2">Mingguan</h4>
                        <p className="text-sm text-gray-600">
                          Peringkat berdasarkan achievement yang diperoleh dalam minggu ini
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}