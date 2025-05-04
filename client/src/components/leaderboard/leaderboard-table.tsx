import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLeaderboardEntries } from "@/hooks/use-leaderboards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  BadgeCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Share2 } from "lucide-react";

interface LeaderboardTableProps {
  leaderboardId: number;
  limit?: number;
  showDetailedStats?: boolean;
}

export function LeaderboardTable({
  leaderboardId,
  limit = 10,
  showDetailedStats = true,
}: LeaderboardTableProps) {
  const { user } = useAuth();
  const { 
    data: entries, 
    isLoading,
    isError,
  } = useLeaderboardEntries(leaderboardId, { limit });

  // Cari peringkat pengguna saat ini
  const currentUserEntry = entries?.find(entry => entry.userId === user?.id);
  const currentUserRank = currentUserEntry?.rank || 0;

  // Function to render rank badge with improved styling
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-md hover:shadow-lg transition-all duration-300 border-2 border-yellow-300">
              <Trophy className="h-5 w-5 text-yellow-800" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Juara 1 🏆</p>
          </TooltipContent>
        </Tooltip>
      );
    } else if (rank === 2) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full shadow-sm hover:shadow transition-all duration-300 border-2 border-gray-200">
              <Medal className="h-5 w-5 text-gray-700" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Juara 2 🥈</p>
          </TooltipContent>
        </Tooltip>
      );
    } else if (rank === 3) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-300 rounded-full shadow-sm hover:shadow transition-all duration-300 border-2 border-amber-200">
              <Medal className="h-5 w-5 text-amber-700" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Juara 3 🥉</p>
          </TooltipContent>
        </Tooltip>
      );
    } else if (rank <= 10) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full border-2 border-blue-200 hover:shadow-sm transition-all duration-300">
              <span className="text-sm font-bold text-blue-700">{rank}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Top 10 🌟</p>
          </TooltipContent>
        </Tooltip>
      );
    } else {
      return (
        <div className="flex items-center justify-center w-8 h-8 bg-background border-2 border-border rounded-full hover:bg-gray-50 transition-all duration-300">
          <span className="text-sm font-semibold">{rank}</span>
        </div>
      );
    }
  };

  // Function to get badge color based on achievement count
  const getBadgeColorForCount = (count: number, type: string) => {
    if (type === "bronze") {
      return "bg-amber-100 text-amber-700 hover:bg-amber-200";
    } else if (type === "silver") {
      return "bg-gray-200 text-gray-700 hover:bg-gray-300";
    } else if (type === "gold") {
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
    } else if (type === "platinum") {
      return "bg-violet-100 text-violet-700 hover:bg-violet-200";
    }
    
    // Default badges based on count
    if (count > 15) {
      return "bg-violet-100 text-violet-700 hover:bg-violet-200";
    } else if (count > 10) {
      return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200";
    } else if (count > 5) {
      return "bg-gray-200 text-gray-700 hover:bg-gray-300";
    } else {
      return "bg-amber-100 text-amber-700 hover:bg-amber-200";
    }
  };

  // Calculate position change indicators
  const getPositionChange = (prevRank: number | null, currentRank: number) => {
    if (!prevRank) return <Minus className="h-4 w-4 text-gray-400" />;
    
    const change = prevRank - currentRank;
    
    if (change > 0) {
      return (
        <div className="flex items-center text-emerald-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">+{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">{change}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-400">
          <Minus className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">0</span>
        </div>
      );
    }
  };

  // Function to share rank with basic social media
  const shareRank = (entry: LeaderboardEntry) => {
    const shareText = `Saya berada di peringkat #${entry.rank} di leaderboard Infopekerjaan.id dengan skor ${entry.score}! Bergabunglah dan raih peringkat teratas!`;
    const shareUrl = window.location.href;
    
    // Create the share URL for different platforms
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    
    return { whatsappUrl, twitterUrl, facebookUrl, shareText };
  };
  
  // Handle copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Disalin!",
        description: "Teks peringkat telah disalin ke clipboard.",
      });
    }).catch(() => {
      toast({
        title: "Gagal menyalin",
        description: "Tidak dapat menyalin teks ke clipboard.",
        variant: "destructive",
      });
    });
  };

  if (isError) {
    return (
      <div className="text-center py-10 text-red-500">
        Gagal memuat data leaderboard. Silakan coba lagi nanti.
      </div>
    );
  }

  // Define animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div>
      {/* Highlighted User Row (if logged in) */}
      {user && currentUserEntry && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-4 p-3 rounded-md bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getRankBadge(currentUserEntry.rank)}
              <div>
                <div className="font-medium">{currentUserEntry.userName}</div>
                <div className="text-sm text-muted-foreground">Peringkat Anda</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {showDetailedStats && (
                <>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Skor</div>
                    <div className="font-medium">{currentUserEntry.score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground">Perubahan</div>
                    <div className="font-medium">
                      {getPositionChange(currentUserEntry.previousRank, currentUserEntry.rank)}
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex flex-col gap-1 text-right">
                <div className="text-sm text-muted-foreground">Pencapaian</div>
                <div className="flex gap-1 justify-end">
                  {currentUserEntry.metadata?.achievements && (
                    <>
                      {currentUserEntry.metadata.achievements.platinum > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className={getBadgeColorForCount(0, "platinum")}>
                              <Shield className="h-3.5 w-3.5 mr-1 md:mr-1" />
                              <span className="hidden md:inline">{currentUserEntry.metadata.achievements.platinum}</span>
                              <span className="md:hidden">{currentUserEntry.metadata.achievements.platinum}</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Platinum: {currentUserEntry.metadata.achievements.platinum}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {currentUserEntry.metadata.achievements.gold > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className={getBadgeColorForCount(0, "gold")}>
                              <Trophy className="h-3.5 w-3.5 mr-1 md:mr-1" />
                              <span className="hidden md:inline">{currentUserEntry.metadata.achievements.gold}</span>
                              <span className="md:hidden">{currentUserEntry.metadata.achievements.gold}</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Emas: {currentUserEntry.metadata.achievements.gold}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {currentUserEntry.metadata.achievements.silver > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className={getBadgeColorForCount(0, "silver")}>
                              <BadgeCheck className="h-3.5 w-3.5 mr-1 md:mr-1" />
                              <span className="hidden md:inline">{currentUserEntry.metadata.achievements.silver}</span>
                              <span className="md:hidden">{currentUserEntry.metadata.achievements.silver}</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Perak: {currentUserEntry.metadata.achievements.silver}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                      {currentUserEntry.metadata.achievements.bronze > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className={getBadgeColorForCount(0, "bronze")}>
                              <Award className="h-3.5 w-3.5 mr-1 md:mr-1" />
                              <span className="hidden md:inline">{currentUserEntry.metadata.achievements.bronze}</span>
                              <span className="md:hidden">{currentUserEntry.metadata.achievements.bronze}</span>
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Perunggu: {currentUserEntry.metadata.achievements.bronze}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Share button */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Bagikan</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Bagikan Peringkat Anda</h4>
                      <p className="text-sm text-muted-foreground">
                        Bagikan posisi peringkat Anda dengan teman dan kolega
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(shareRank(currentUserEntry).whatsappUrl, '_blank')}
                      >
                        WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(shareRank(currentUserEntry).twitterUrl, '_blank')}
                      >
                        Twitter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(shareRank(currentUserEntry).facebookUrl, '_blank')}
                      >
                        Facebook
                      </Button>
                    </div>
                    
                    <div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => copyToClipboard(shareRank(currentUserEntry).shareText)}
                      >
                        Salin Teks
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Peringkat</TableHead>
              <TableHead>Pengguna</TableHead>
              {showDetailedStats && (
                <>
                  <TableHead className="text-right hidden md:table-cell">Skor</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Perubahan</TableHead>
                </>
              )}
              <TableHead className="text-right">Pencapaian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  {showDetailedStats && (
                    <>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Skeleton className="h-6 w-14" />
                      <Skeleton className="h-6 w-14" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : entries && entries.length > 0 ? (
              // Populated table with animations
              entries.map((entry) => (
                <TableRow
                  key={`${entry.userId}-${entry.leaderboardId}`}
                  className={cn(
                    entry.userId === user?.id && "bg-primary/5"
                  )}
                >
                  <TableCell>
                    {getRankBadge(entry.rank)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {entry.userName}
                      {entry.userType === "employer" && (
                        <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                          HRD
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {showDetailedStats && (
                    <>
                      <TableCell className="text-right font-medium hidden md:table-cell">
                        {entry.score}
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell">
                        {getPositionChange(entry.previousRank, entry.rank)}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {entry.metadata?.achievements && (
                        <>
                          {entry.metadata.achievements.platinum > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={getBadgeColorForCount(0, "platinum")}>
                                  <Shield className="h-3.5 w-3.5 mr-1 md:mr-1" />
                                  <span className="hidden md:inline">{entry.metadata.achievements.platinum}</span>
                                  <span className="md:hidden">{entry.metadata.achievements.platinum}</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Platinum: {entry.metadata.achievements.platinum}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {entry.metadata.achievements.gold > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={getBadgeColorForCount(0, "gold")}>
                                  <Trophy className="h-3.5 w-3.5 mr-1 md:mr-1" />
                                  <span className="hidden md:inline">{entry.metadata.achievements.gold}</span>
                                  <span className="md:hidden">{entry.metadata.achievements.gold}</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Emas: {entry.metadata.achievements.gold}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {entry.metadata.achievements.silver > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={getBadgeColorForCount(0, "silver")}>
                                  <BadgeCheck className="h-3.5 w-3.5 mr-1 md:mr-1" />
                                  <span className="hidden md:inline">{entry.metadata.achievements.silver}</span>
                                  <span className="md:hidden">{entry.metadata.achievements.silver}</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Perak: {entry.metadata.achievements.silver}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {entry.metadata.achievements.bronze > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={getBadgeColorForCount(0, "bronze")}>
                                  <Award className="h-3.5 w-3.5 mr-1 md:mr-1" />
                                  <span className="hidden md:inline">{entry.metadata.achievements.bronze}</span>
                                  <span className="md:hidden">{entry.metadata.achievements.bronze}</span>
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Perunggu: {entry.metadata.achievements.bronze}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Empty state
              <TableRow>
                <TableCell colSpan={showDetailedStats ? 5 : 3} className="h-24 text-center">
                  Belum ada data peringkat untuk ditampilkan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Load more button */}
      {entries && entries.length >= limit && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex justify-center"
        >
          <Button variant="outline">
            Lihat Lebih Banyak
          </Button>
        </motion.div>
      )}
    </div>
  );
}