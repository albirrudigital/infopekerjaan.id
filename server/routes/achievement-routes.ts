import { Router } from 'express';
import { achievementService } from '../achievement-service';
import type { Request, Response, Express } from 'express';

// Middleware untuk memeriksa apakah user sudah login
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Anda harus login terlebih dahulu' });
  }
  next();
}

export const achievementRouter = Router();

export function setupAchievementRoutes(app: Express) {
  app.use('/api', achievementRouter);
}

// Endpoint untuk mendapatkan semua achievements user
achievementRouter.get('/achievements', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const achievements = await achievementService.getUserAchievements(userId);
    res.json(achievements);
  } catch (error: any) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk mendapatkan jumlah achievements per level
achievementRouter.get('/achievements/counts', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const counts = await achievementService.getUserAchievementCounts(userId);
    res.json(counts);
  } catch (error: any) {
    console.error('Error getting achievement counts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk mendapatkan badges yang ditampilkan di profil
achievementRouter.get('/achievements/badges', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const badges = await achievementService.getProfileBadges(userId);
    res.json(badges);
  } catch (error: any) {
    console.error('Error getting profile badges:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk mendapatkan info metadata achievements dan level requirements
achievementRouter.get('/achievements/info', isAuthenticated, async (req, res) => {
  try {
    const achievementInfo = {
      metadata: achievementService.ACHIEVEMENT_METADATA,
      levels: achievementService.ACHIEVEMENT_LEVELS
    };
    res.json(achievementInfo);
  } catch (error: any) {
    console.error('Error getting achievement info:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk memeriksa dan memberikan achievements baru
achievementRouter.post('/achievements/check', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { profileCompletionPercent = 0 } = req.body;
    
    // Periksa dan dapatkan pencapaian baru
    const newAchievements = await achievementService.checkAllAchievements(userId, profileCompletionPercent);
    
    // Berikan metadata untuk setiap achievement
    const enrichedAchievements = newAchievements.map(achievement => {
      const metadata = achievementService.ACHIEVEMENT_METADATA[achievement.achievementType] || {};
      return {
        ...achievement,
        description: metadata.description || '',
        icon: metadata.icon || 'award'
      };
    });
    
    res.json({ 
      success: true, 
      message: 'Achievement checked successfully',
      newAchievements: enrichedAchievements 
    });
  } catch (error: any) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk memberikan sejumlah achievement untuk testing (hanya development)
achievementRouter.post('/achievements/seed', isAuthenticated, async (req, res) => {
  try {
    // Hanya aktif pada mode development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Endpoint hanya tersedia pada mode development' });
    }
    
    const userId = req.user!.id;
    const newAchievements = await achievementService.seedAchievements(userId);
    
    // Berikan metadata untuk setiap achievement
    const enrichedAchievements = newAchievements.map(achievement => {
      const metadata = achievementService.ACHIEVEMENT_METADATA[achievement.achievementType] || {};
      return {
        ...achievement,
        description: metadata.description || '',
        icon: metadata.icon || 'award',
        isNew: true
      };
    });
    
    res.json({ 
      success: true, 
      message: 'Achievements seeded successfully',
      newAchievements: enrichedAchievements
    });
  } catch (error: any) {
    console.error('Error seeding achievements:', error);
    res.status(500).json({ error: error.message });
  }
});