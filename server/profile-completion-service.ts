import { storage } from './storage';
import { 
  InsertProfileCompletionItem,
  InsertUserProfileCompletion
} from '@shared/schema';
import { achievementService } from './achievement-service';

/**
 * Service untuk mengelola fitur Profile Completion.
 */
export class ProfileCompletionService {
  /**
   * Mendapatkan semua item profil completion berdasarkan tipe pengguna
   */
  async getCompletionItems(userType?: string) {
    return storage.getProfileCompletionItems(userType);
  }
  
  /**
   * Mendapatkan item profil completion berdasarkan ID
   */
  async getCompletionItem(id: number) {
    return storage.getProfileCompletionItem(id);
  }
  
  /**
   * Membuat item profil completion baru
   */
  async createCompletionItem(item: InsertProfileCompletionItem) {
    return storage.createProfileCompletionItem(item);
  }
  
  /**
   * Mendapatkan semua status profil completion untuk pengguna
   */
  async getUserCompletions(userId: number) {
    return storage.getUserProfileCompletions(userId);
  }
  
  /**
   * Mendapatkan status profil completion tertentu
   */
  async getUserCompletion(userId: number, itemId: number) {
    return storage.getUserProfileCompletion(userId, itemId);
  }
  
  /**
   * Membuat status profil completion baru
   */
  async createUserCompletion(completion: InsertUserProfileCompletion) {
    const result = await storage.createUserProfileCompletion(completion);
    
    // Jika completion dibuat dan ditandai selesai, periksa achievement
    if (result && completion.completed) {
      try {
        const percentage = await this.calculateCompletionPercentage(completion.userId);
        // Check dan update achievement berdasarkan persentase
        await achievementService.checkProfileCompletion(completion.userId, percentage);
      } catch (error) {
        console.error("Error checking profile completion achievement:", error);
      }
    }
    
    return result;
  }
  
  /**
   * Mengupdate status profil completion
   */
  async updateUserCompletion(userId: number, itemId: number, completed: boolean) {
    const result = await storage.updateUserProfileCompletion(userId, itemId, completed);
    
    // Jika status completion diupdate, periksa persentase dan update achievement
    if (result) {
      try {
        const percentage = await this.calculateCompletionPercentage(userId);
        // Check dan update achievement berdasarkan persentase
        await achievementService.checkProfileCompletion(userId, percentage);
      } catch (error) {
        console.error("Error checking profile completion achievement:", error);
      }
    }
    
    return result;
  }
  
  /**
   * Menghitung persentase kelengkapan profil
   */
  async calculateCompletionPercentage(userId: number) {
    return storage.calculateProfileCompletionPercentage(userId);
  }
  
  /**
   * Menginisialisasi status profil completion untuk pengguna baru.
   * Dipanggil saat user baru mendaftar.
   */
  async initializeProfileCompletion(userId: number, userType: string) {
    // Admin tidak membutuhkan profile completion
    if (userType === 'admin') {
      console.log(`User ${userId} adalah admin, tidak memerlukan profile completion`);
      return [];
    }
    
    // Dapatkan semua item yang sesuai dengan tipe pengguna
    const items = await this.getCompletionItems(userType);
    
    // Jika tidak ada item yang sesuai, kembalikan array kosong
    if (items.length === 0) {
      console.log(`Tidak ada item profile completion untuk user type: ${userType}`);
      return [];
    }
    
    // Buat status completion kosong untuk setiap item
    const completions = await Promise.all(
      items.map(item => 
        this.createUserCompletion({
          userId,
          itemId: item.id,
          completed: false
        })
      )
    );
    
    // Inisialisasi achievement dengan persentase awal 0
    try {
      await achievementService.checkProfileCompletion(userId, 0);
    } catch (error) {
      console.error("Error initializing profile completion achievement:", error);
    }
    
    return completions;
  }
  
  /**
   * Memeriksa dan memperbarui status completion untuk item tertentu.
   * Metode ini akan dipanggil ketika pengguna memperbarui profilnya.
   */
  async checkAndUpdateCompletion(userId: number, itemId: number, isCompleted: boolean) {
    const existingCompletion = await this.getUserCompletion(userId, itemId);
    
    if (existingCompletion) {
      if (existingCompletion.completed !== isCompleted) {
        return this.updateUserCompletion(userId, itemId, isCompleted);
      }
      return existingCompletion;
    } else {
      return this.createUserCompletion({
        userId,
        itemId,
        completed: isCompleted
      });
    }
  }
  
  /**
   * Mendapatkan data lengkap untuk profile completion dashboard
   */
  async getProfileCompletionDashboard(userId: number) {
    // Dapatkan user untuk mengetahui tipenya
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Admin tidak memiliki profile completion, kembalikan data kosong
    if (user.type === 'admin') {
      return {
        percentage: 100, // Admin selalu dianggap 100% lengkap
        items: [],
        groupedItems: {},
        totalItems: 0,
        completedItems: 0,
        isAdmin: true
      };
    }
    
    // Dapatkan semua item yang relevan
    const items = await this.getCompletionItems(user.type);
    
    // Jika tidak ada item yang sesuai, kembalikan data kosong
    if (items.length === 0) {
      return {
        percentage: 0,
        items: [],
        groupedItems: {},
        totalItems: 0,
        completedItems: 0,
        noItems: true
      };
    }
    
    // Dapatkan status completion
    const completions = await this.getUserCompletions(userId);
    
    // Hitung persentase
    const percentage = await this.calculateCompletionPercentage(userId);
    
    // Gabungkan items dan completions
    const itemsWithStatus = items.map(item => {
      const completion = completions.find(c => c.itemId === item.id);
      return {
        ...item,
        completed: completion ? completion.completed : false,
        completedAt: completion ? completion.completedAt : null
      };
    });
    
    // Kelompokkan berdasarkan kategori
    const groupedItems: Record<string, any[]> = {};
    itemsWithStatus.forEach(item => {
      if (!groupedItems[item.category]) {
        groupedItems[item.category] = [];
      }
      groupedItems[item.category].push(item);
    });
    
    return {
      percentage,
      items: itemsWithStatus,
      groupedItems,
      totalItems: items.length,
      completedItems: completions.filter(c => c.completed).length
    };
  }
}

export const profileCompletionService = new ProfileCompletionService();