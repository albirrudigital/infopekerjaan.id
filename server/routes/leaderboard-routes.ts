import { Express, Request, Response } from 'express';
import { leaderboardService } from '../leaderboard-service';
import { z } from 'zod';
import { insertLeaderboardSchema, insertLeaderboardEntrySchema } from '@shared/schema';

export function setupLeaderboardRoutes(app: Express) {
  // Middleware untuk memastikan user sudah login
  function isAuthenticated(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ error: 'Anda harus login terlebih dahulu' });
  }

  // Middleware untuk memastikan user adalah admin
  function isAdmin(req: Request, res: Response, next: Function) {
    if (req.isAuthenticated() && req.user?.type === 'admin') {
      return next();
    }
    return res.status(403).json({ error: 'Akses ditolak' });
  }

  // GET all leaderboards
  app.get('/api/leaderboards', async (req, res) => {
    try {
      const { type, category, level, timeframe, isActive } = req.query;
      
      const leaderboards = await leaderboardService.getLeaderboards({
        type: type as string | undefined,
        category: category as string | undefined,
        level: level as string | undefined,
        timeframe: timeframe as string | undefined,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
      });
      
      res.json(leaderboards);
    } catch (error) {
      console.error('Error getting leaderboards:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data leaderboard' });
    }
  });

  // GET leaderboard by ID
  app.get('/api/leaderboards/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID leaderboard tidak valid' });
      }
      
      const leaderboard = await leaderboardService.getLeaderboard(id);
      
      if (!leaderboard) {
        return res.status(404).json({ error: 'Leaderboard tidak ditemukan' });
      }
      
      res.json(leaderboard);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data leaderboard' });
    }
  });

  // GET leaderboard entries
  app.get('/api/leaderboards/:id/entries', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID leaderboard tidak valid' });
      }
      
      const { limit, offset } = req.query;
      
      const entries = await leaderboardService.getLeaderboardEntries(id, {
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });
      
      res.json(entries);
    } catch (error) {
      console.error('Error getting leaderboard entries:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data leaderboard entries' });
    }
  });

  // GET user's leaderboard entry
  app.get('/api/leaderboards/:id/users/:userId', async (req, res) => {
    try {
      const leaderboardId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      
      if (isNaN(leaderboardId) || isNaN(userId)) {
        return res.status(400).json({ error: 'ID tidak valid' });
      }
      
      const entry = await leaderboardService.getUserLeaderboardEntry(leaderboardId, userId);
      
      if (!entry) {
        return res.status(404).json({ error: 'Entry tidak ditemukan' });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error getting user leaderboard entry:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data user entry' });
    }
  });

  // GET current user's leaderboard entry
  app.get('/api/leaderboards/:id/me', isAuthenticated, async (req, res) => {
    try {
      const leaderboardId = parseInt(req.params.id);
      
      if (isNaN(leaderboardId)) {
        return res.status(400).json({ error: 'ID leaderboard tidak valid' });
      }
      
      const userId = req.user!.id;
      
      const entry = await leaderboardService.getUserLeaderboardEntry(leaderboardId, userId);
      
      if (!entry) {
        return res.status(404).json({ error: 'Entry tidak ditemukan' });
      }
      
      res.json(entry);
    } catch (error) {
      console.error('Error getting current user leaderboard entry:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data user entry' });
    }
  });

  // CREATE new leaderboard (admin only)
  app.post('/api/leaderboards', isAdmin, async (req, res) => {
    try {
      const validationResult = insertLeaderboardSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error });
      }
      
      const newLeaderboard = await leaderboardService.createLeaderboard(validationResult.data);
      
      res.status(201).json(newLeaderboard);
    } catch (error) {
      console.error('Error creating leaderboard:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat membuat leaderboard' });
    }
  });

  // UPDATE leaderboard (admin only)
  app.patch('/api/leaderboards/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID leaderboard tidak valid' });
      }
      
      // Validate the fields that can be updated
      const updateSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional()
      });
      
      const validationResult = updateSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error });
      }
      
      const updatedLeaderboard = await leaderboardService.updateLeaderboard(id, validationResult.data);
      
      if (!updatedLeaderboard) {
        return res.status(404).json({ error: 'Leaderboard tidak ditemukan' });
      }
      
      res.json(updatedLeaderboard);
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate leaderboard' });
    }
  });

  // REFRESH leaderboard rankings (admin only)
  app.post('/api/leaderboards/:id/refresh', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID leaderboard tidak valid' });
      }
      
      const refreshed = await leaderboardService.refreshLeaderboard(id);
      
      if (!refreshed) {
        return res.status(404).json({ error: 'Leaderboard tidak ditemukan' });
      }
      
      res.json({ success: true, message: 'Leaderboard berhasil di-refresh' });
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat merefresh leaderboard' });
    }
  });

  // INITIALIZE default leaderboards (admin only)
  app.post('/api/leaderboards/initialize', isAdmin, async (req, res) => {
    try {
      await leaderboardService.initializeDefaultLeaderboards();
      
      res.status(201).json({ success: true, message: 'Leaderboard default berhasil diinisialisasi' });
    } catch (error) {
      console.error('Error initializing default leaderboards:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat menginisialisasi leaderboard default' });
    }
  });

  // UPDATE user's leaderboard entry from achievements
  app.post('/api/leaderboards/update-from-achievements/:userId', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID user tidak valid' });
      }
      
      await leaderboardService.updateLeaderboardFromAchievements(userId);
      
      res.json({ success: true, message: 'Leaderboard entry berhasil diupdate dari achievement' });
    } catch (error) {
      console.error('Error updating leaderboard from achievements:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate leaderboard dari achievement' });
    }
  });

  // UPDATE current user's leaderboard entry from achievements
  app.post('/api/leaderboards/update-from-achievements', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      await leaderboardService.updateLeaderboardFromAchievements(userId);
      
      res.json({ success: true, message: 'Leaderboard entry anda berhasil diupdate dari achievement' });
    } catch (error) {
      console.error('Error updating current user leaderboard from achievements:', error);
      res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate leaderboard dari achievement' });
    }
  });
}