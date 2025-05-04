import { eq, and, desc } from 'drizzle-orm';
import { db } from './db';
import {
  notifications, notificationPreferences, achievementEvents, users,
  type User, type Notification, type InsertNotification,
  type NotificationPreferences, type InsertNotificationPreferences,
  type AchievementEvent, type InsertAchievementEvent
} from '@shared/schema';

// Notification operations
export async function getNotifications(userId: number, options: {
  limit?: number,
  offset?: number,
  unreadOnly?: boolean
} = {}): Promise<Notification[]> {
  let query = db.select().from(notifications).where(eq(notifications.userId, userId));
  
  if (options.unreadOnly) {
    query = query.where(eq(notifications.isRead, false));
  }
  
  query = query.orderBy(desc(notifications.createdAt));
  
  if (options.limit !== undefined) {
    query = query.limit(options.limit);
  }
  
  if (options.offset !== undefined) {
    query = query.offset(options.offset);
  }
  
  return await query;
}

export async function getNotification(id: number): Promise<Notification | undefined> {
  const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
  return notification;
}

export async function createNotification(insertNotification: InsertNotification): Promise<Notification> {
  const [notification] = await db
    .insert(notifications)
    .values(insertNotification)
    .returning();
  return notification;
}

export async function markNotificationAsRead(id: number): Promise<Notification | undefined> {
  const [notification] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id))
    .returning();
  return notification;
}

export async function markAllNotificationsAsRead(userId: number): Promise<boolean> {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

// Notification Preferences operations
export async function getNotificationPreferences(userId: number): Promise<NotificationPreferences | undefined> {
  const [preferences] = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));
  return preferences;
}

export async function createNotificationPreferences(insertPreferences: InsertNotificationPreferences): Promise<NotificationPreferences> {
  const [preferences] = await db
    .insert(notificationPreferences)
    .values(insertPreferences)
    .returning();
  return preferences;
}

export async function updateNotificationPreferences(userId: number, updateData: Partial<NotificationPreferences>): Promise<NotificationPreferences | undefined> {
  const [preferences] = await db
    .update(notificationPreferences)
    .set(updateData)
    .where(eq(notificationPreferences.userId, userId))
    .returning();
  return preferences;
}

// Achievement operations
export async function getAchievementEvents(userId: number): Promise<AchievementEvent[]> {
  return await db
    .select()
    .from(achievementEvents)
    .where(eq(achievementEvents.userId, userId))
    .orderBy(desc(achievementEvents.unlockedAt));
}

export async function createAchievementEvent(insertEvent: InsertAchievementEvent): Promise<AchievementEvent> {
  const [event] = await db
    .insert(achievementEvents)
    .values(insertEvent)
    .returning();
  return event;
}

// Get all users with filtering options
export async function getAllUsers(options: { type?: string } = {}): Promise<User[]> {
  let query = db.select().from(users);
  
  if (options.type) {
    // @ts-ignore - type issue with schema
    query = query.where(eq(users.type, options.type));
  }
  
  return await query;
}

// User by Company operations
export async function getUsersByCompany(userId: number, companyId: number): Promise<User[]> {
  // Saat ini, kita mengembalikan array berisi hanya pengguna yang mengirim permintaan
  // Ini sederhana untuk MVP; implementasi lebih lanjut akan mengembalikan semua karyawan
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user ? [user] : [];
}