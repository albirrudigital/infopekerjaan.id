import { storage } from './storage';
import { Leaderboard, InsertLeaderboard, LeaderboardEntry, InsertLeaderboardEntry } from '@shared/schema';
import { achievementService } from './achievement-service';

/**
 * Service untuk mengelola sistem leaderboard
 */
export class LeaderboardService {
  /**
   * Mendapatkan semua leaderboard berdasarkan filter
   */
  async getLeaderboards(options?: {
    type?: string,
    category?: string,
    level?: string,
    timeframe?: string,
    isActive?: boolean
  }): Promise<Leaderboard[]> {
    return storage.getLeaderboards(options);
  }

  /**
   * Mendapatkan leaderboard berdasarkan ID
   */
  async getLeaderboard(id: number): Promise<Leaderboard | undefined> {
    return storage.getLeaderboard(id);
  }

  /**
   * Membuat leaderboard baru
   */
  async createLeaderboard(leaderboard: InsertLeaderboard): Promise<Leaderboard> {
    return storage.createLeaderboard(leaderboard);
  }

  /**
   * Mengupdate leaderboard
   */
  async updateLeaderboard(id: number, data: Partial<Leaderboard>): Promise<Leaderboard | undefined> {
    return storage.updateLeaderboard(id, data);
  }

  /**
   * Mendapatkan entri leaderboard berdasarkan leaderboard ID
   */
  async getLeaderboardEntries(leaderboardId: number, options?: {
    limit?: number,
    offset?: number
  }): Promise<LeaderboardEntry[]> {
    return storage.getLeaderboardEntries(leaderboardId, options);
  }

  /**
   * Mendapatkan entri leaderboard untuk user tertentu
   */
  async getUserLeaderboardEntry(leaderboardId: number, userId: number): Promise<LeaderboardEntry | undefined> {
    return storage.getUserLeaderboardEntry(leaderboardId, userId);
  }

  /**
   * Membuat entri leaderboard baru
   */
  async createLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    return storage.createLeaderboardEntry(entry);
  }

  /**
   * Mengupdate entri leaderboard
   */
  async updateLeaderboardEntry(leaderboardId: number, userId: number, data: Partial<LeaderboardEntry>): Promise<LeaderboardEntry | undefined> {
    return storage.updateLeaderboardEntry(leaderboardId, userId, data);
  }

  /**
   * Menghitung peringkat user dalam leaderboard
   */
  async calculateUserRank(leaderboardId: number, userId: number): Promise<number> {
    return storage.calculateUserRank(leaderboardId, userId);
  }

  /**
   * Memperbarui peringkat semua user dalam leaderboard
   */
  async refreshLeaderboard(leaderboardId: number): Promise<boolean> {
    return storage.refreshLeaderboard(leaderboardId);
  }

  /**
   * Mengupdate leaderboard entry berdasarkan achievement terbaru
   */
  async updateLeaderboardFromAchievements(userId: number): Promise<void> {
    // Dapatkan semua achievement user
    const achievements = await achievementService.getUserAchievements(userId);
    
    // Dapatkan achievement counts berdasarkan level
    const achievementCounts = await achievementService.getUserAchievementCounts(userId);
    
    // Hitung total score berdasarkan level (platinum = 4, gold = 3, silver = 2, bronze = 1)
    const levelWeights = {
      platinum: 4,
      gold: 3,
      silver: 2,
      bronze: 1
    };
    
    let totalScore = 0;
    let totalCount = 0;
    
    for (const [level, count] of Object.entries(achievementCounts)) {
      totalCount += count;
      totalScore += count * levelWeights[level as keyof typeof levelWeights];
    }
    
    // Dapatkan kategori scores
    const categoryScores: Record<string, number> = {};
    
    // Kelompokkan achievement berdasarkan kategori
    achievements.forEach(achievement => {
      if (!categoryScores[achievement.achievementType]) {
        categoryScores[achievement.achievementType] = 0;
      }
      
      // Tambahkan bobot berdasarkan level
      const weight = levelWeights[achievement.achievementLevel as keyof typeof levelWeights];
      categoryScores[achievement.achievementType] += weight;
    });
    
    // Update atau buat entri di semua active leaderboards
    const activeLeaderboards = await this.getLeaderboards({ isActive: true });
    
    for (const leaderboard of activeLeaderboards) {
      const existingEntry = await this.getUserLeaderboardEntry(leaderboard.id, userId);
      
      const entryData = {
        leaderboardId: leaderboard.id,
        userId,
        score: totalScore,
        achievementCount: totalCount,
        categoryScores,
        levelCounts: achievementCounts
      };
      
      if (existingEntry) {
        // Update existing entry
        await this.updateLeaderboardEntry(leaderboard.id, userId, entryData);
      } else {
        // Create new entry
        await this.createLeaderboardEntry(entryData as InsertLeaderboardEntry);
      }
      
      // Refresh leaderboard untuk memperbarui peringkat
      await this.refreshLeaderboard(leaderboard.id);
    }
  }

  /**
   * Inisialisasi leaderboard default
   */
  async initializeDefaultLeaderboards(): Promise<void> {
    // Cek apakah leaderboard global sudah ada
    const existingLeaderboards = await this.getLeaderboards();
    
    if (existingLeaderboards.length === 0) {
      // Buat leaderboard global untuk semua achievement
      await this.createLeaderboard({
        name: "Peringkat Global",
        description: "Peringkat semua pengguna berdasarkan total achievement",
        type: "global",
        timeframe: "all_time",
        isActive: true
      });
      
      // Buat leaderboard untuk setiap kategori achievement
      const achievementTypes = [
        "profile_completion",
        "application_milestone",
        "job_posting_milestone",
        "platform_engagement",
        "response_rate",
        "application_quality",
        "interview_success",
        "networking_champion",
        "skill_builder",
        "mentor_badge"
      ];
      
      for (const type of achievementTypes) {
        await this.createLeaderboard({
          name: `Peringkat ${this.getAchievementCategoryName(type)}`,
          description: `Peringkat pengguna berdasarkan achievement ${this.getAchievementCategoryName(type)}`,
          type: "achievement_category",
          category: type,
          timeframe: "all_time",
          isActive: true
        });
      }
      
      // Buat leaderboard untuk setiap level achievement
      const achievementLevels = ["bronze", "silver", "gold", "platinum"];
      
      for (const level of achievementLevels) {
        await this.createLeaderboard({
          name: `Peringkat Level ${this.getAchievementLevelName(level)}`,
          description: `Peringkat pengguna berdasarkan jumlah achievement level ${this.getAchievementLevelName(level)}`,
          type: "achievement_level",
          level,
          timeframe: "all_time",
          isActive: true
        });
      }
      
      // Buat leaderboard bulanan global
      await this.createLeaderboard({
        name: "Peringkat Bulanan",
        description: "Peringkat bulanan berdasarkan achievement baru",
        type: "global",
        timeframe: "monthly",
        startDate: new Date(), // Bulan saat ini
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Bulan depan
        isActive: true
      });
    }
  }

  /**
   * Helper untuk mendapatkan nama kategori achievement
   */
  private getAchievementCategoryName(category: string): string {
    const categoryNames: Record<string, string> = {
      profile_completion: "Kelengkapan Profil",
      application_milestone: "Milestone Lamaran",
      job_posting_milestone: "Milestone Lowongan",
      platform_engagement: "Keterlibatan Platform",
      response_rate: "Tingkat Respons",
      application_quality: "Kualitas Lamaran",
      interview_success: "Sukses Wawancara",
      networking_champion: "Juara Networking",
      skill_builder: "Pengembang Skill",
      mentor_badge: "Lencana Mentor"
    };
    
    return categoryNames[category] || category;
  }

  /**
   * Helper untuk mendapatkan nama level achievement
   */
  private getAchievementLevelName(level: string): string {
    const levelNames: Record<string, string> = {
      bronze: "Perunggu",
      silver: "Perak",
      gold: "Emas",
      platinum: "Platinum"
    };
    
    return levelNames[level] || level;
  }
}

export const leaderboardService = new LeaderboardService();