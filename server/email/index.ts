import { Express } from 'express';
import { NotificationService } from './notification-service';
import { setupNotificationRoutes } from './notification-routes';
import { storage } from '../storage';

/**
 * Inisialisasi layanan email dan notifikasi
 * 
 * @param app Express application
 */
export function setupNotificationServices(app: Express) {
  // Buat instance notification service
  const notificationService = new NotificationService({
    fromEmail: 'noreply@infopekerjaan.id',
    storage
  });
  
  // Setup routes untuk notifikasi
  setupNotificationRoutes(app, notificationService);
  
  // Registrasi background jobs (bisa ditambahkan nanti)
  // setupNotificationJobs(notificationService);
  
  // Expose notification service untuk bisa digunakan di module lain
  return notificationService;
}