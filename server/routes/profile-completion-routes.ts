import { Express, Request, Response, NextFunction } from 'express';
import { profileCompletionService } from '../profile-completion-service';
import { insertProfileCompletionItemSchema } from '@shared/schema';

// Authentication middleware
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user!.type !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  next();
}

/**
 * Mendaftarkan route untuk Profile Completion
 */
export function registerProfileCompletionRoutes(app: Express) {
  // Rute untuk pengguna
  
  // Mendapatkan dashboard profile completion
  app.get('/api/profile-completion', authenticateUser, async (req, res) => {
    try {
      const dashboard = await profileCompletionService.getProfileCompletionDashboard(req.user!.id);
      res.json(dashboard);
    } catch (error: any) {
      console.error('Error fetching profile completion dashboard:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Mendapatkan persentase completion
  app.get('/api/profile-completion/percentage', authenticateUser, async (req, res) => {
    try {
      const percentage = await profileCompletionService.calculateCompletionPercentage(req.user!.id);
      res.json({ percentage });
    } catch (error: any) {
      console.error('Error calculating profile completion percentage:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update status completion untuk item tertentu
  app.patch('/api/profile-completion/:itemId', authenticateUser, async (req, res) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const { completed } = req.body;
      
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Completed status must be a boolean' });
      }
      
      const result = await profileCompletionService.checkAndUpdateCompletion(
        req.user!.id,
        itemId,
        completed
      );
      
      res.json(result);
    } catch (error: any) {
      console.error('Error updating profile completion item:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Rute Admin
  
  // Mendapatkan semua item profile completion
  app.get('/api/admin/profile-completion/items', authenticateAdmin, async (req, res) => {
    try {
      const items = await profileCompletionService.getCompletionItems();
      res.json(items);
    } catch (error: any) {
      console.error('Error fetching profile completion items:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Menambah item profile completion baru
  app.post('/api/admin/profile-completion/items', authenticateAdmin, async (req, res) => {
    try {
      const validatedData = insertProfileCompletionItemSchema.parse(req.body);
      const newItem = await profileCompletionService.createCompletionItem(validatedData);
      res.status(201).json(newItem);
    } catch (error: any) {
      console.error('Error creating profile completion item:', error);
      res.status(400).json({ error: error.message });
    }
  });
  
  // Mendapatkan status completion untuk user tertentu (admin only)
  app.get('/api/admin/profile-completion/users/:userId', authenticateAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const dashboard = await profileCompletionService.getProfileCompletionDashboard(userId);
      res.json(dashboard);
    } catch (error: any) {
      console.error('Error fetching user profile completion:', error);
      res.status(500).json({ error: error.message });
    }
  });
}