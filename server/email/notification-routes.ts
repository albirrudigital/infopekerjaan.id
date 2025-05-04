import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import * as notificationStorage from '../storage_notification';
import { NotificationService } from './notification-service';

/**
 * Menyiapkan rute API untuk pengelolaan notifikasi
 * 
 * @param app Express app
 * @param notificationService Layanan notifikasi
 */
export function setupNotificationRoutes(app: Express, notificationService: NotificationService) {
  // Middleware untuk memastikan pengguna sudah login
  function isAuthenticated(req: Request, res: Response, next: Function) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  }

  // GET /api/notifications - mendapatkan notifikasi untuk pengguna saat ini
  app.get('/api/notifications', isAuthenticated, async (req, res) => {
    try {
      const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        unreadOnly: req.query.unreadOnly === 'true'
      };
      
      const notifications = await notificationStorage.getNotifications(req.user!.id, options);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Error fetching notifications' });
    }
  });

  // GET /api/notifications/unread-count - mendapatkan jumlah notifikasi yang belum dibaca
  app.get('/api/notifications/unread-count', isAuthenticated, async (req, res) => {
    try {
      const notifications = await notificationStorage.getNotifications(req.user!.id, { unreadOnly: true });
      res.json({ count: notifications.length });
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
      res.status(500).json({ message: 'Error fetching unread notifications count' });
    }
  });

  // PATCH /api/notifications/:id/read - menandai notifikasi sebagai sudah dibaca
  app.patch('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: 'Invalid notification ID' });
      }
      
      // Pastikan notifikasi milik pengguna saat ini
      const notification = await notificationStorage.getNotification(notificationId);
      if (!notification || notification.userId !== req.user!.id) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      const updatedNotification = await notificationStorage.markNotificationAsRead(notificationId);
      res.json(updatedNotification);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: 'Error marking notification as read' });
    }
  });

  // PATCH /api/notifications/read-all - menandai semua notifikasi sebagai sudah dibaca
  app.patch('/api/notifications/read-all', isAuthenticated, async (req, res) => {
    try {
      const success = await notificationStorage.markAllNotificationsAsRead(req.user!.id);
      if (success) {
        res.json({ message: 'All notifications marked as read' });
      } else {
        res.status(500).json({ message: 'Error marking all notifications as read' });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ message: 'Error marking all notifications as read' });
    }
  });

  // GET /api/notifications/preferences - mendapatkan preferensi notifikasi
  app.get('/api/notifications/preferences', isAuthenticated, async (req, res) => {
    try {
      const preferences = await notificationStorage.getNotificationPreferences(req.user!.id);
      if (!preferences) {
        // Jika belum ada, buat preferensi default
        const newPreferences = await notificationStorage.createNotificationPreferences({
          userId: req.user!.id,
          emailNotifications: true,
          inAppNotifications: true,
          jobAlerts: true,
          marketingEmails: false,
          weeklyJobDigest: true
        });
        return res.json(newPreferences);
      }
      res.json(preferences);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({ message: 'Error fetching notification preferences' });
    }
  });

  // PATCH /api/notifications/preferences - mengubah preferensi notifikasi
  app.patch('/api/notifications/preferences', isAuthenticated, async (req, res) => {
    try {
      const preferencesSchema = z.object({
        emailNotifications: z.boolean().optional(),
        inAppNotifications: z.boolean().optional(),
        jobAlerts: z.boolean().optional(),
        marketingEmails: z.boolean().optional(),
        weeklyJobDigest: z.boolean().optional()
      });
      
      const validatedData = preferencesSchema.parse(req.body);
      
      // Cek apakah preferensi sudah ada
      let preferences = await notificationStorage.getNotificationPreferences(req.user!.id);
      
      if (!preferences) {
        // Jika belum ada, buat preferensi baru dengan data dari request
        preferences = await notificationStorage.createNotificationPreferences({
          userId: req.user!.id,
          emailNotifications: validatedData.emailNotifications ?? true,
          inAppNotifications: validatedData.inAppNotifications ?? true,
          jobAlerts: validatedData.jobAlerts ?? true,
          marketingEmails: validatedData.marketingEmails ?? false,
          weeklyJobDigest: validatedData.weeklyJobDigest ?? true
        });
      } else {
        // Jika sudah ada, update preferensi
        preferences = await notificationStorage.updateNotificationPreferences(req.user!.id, validatedData);
      }
      
      res.json(preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error updating notification preferences' });
    }
  });

  // POST /api/notifications/test-email - mengirim email test (hanya untuk admin)
  app.post('/api/notifications/test-email', isAuthenticated, async (req, res) => {
    try {
      if (req.user!.type !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      
      const schema = z.object({
        email: z.string().email(),
        type: z.string().optional(),
        data: z.record(z.any()).optional()
      });
      
      const validatedData = schema.parse(req.body);
      
      // Dapatkan user untuk mengirim email test
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Kirim email test
      const success = await notificationService.sendTestEmail(
        user.id, 
        validatedData.type || 'welcome',
        validatedData.data || {}
      );
      
      if (success) {
        res.json({ message: 'Test email sent successfully' });
      } else {
        res.status(500).json({ message: 'Failed to send test email' });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid data', errors: error.errors });
      }
      res.status(500).json({ message: 'Error sending test email' });
    }
  });
}