import Redis from 'ioredis';
import { promisify } from 'util';

export class RedisService {
  private redis: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  // Cache operations
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    if (ttl) {
      await this.redis.setex(key, ttl, serializedValue);
    } else {
      await this.redis.set(key, serializedValue);
    }
  }

  async get(key: string): Promise<any> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Pub/sub operations
  async publish(channel: string, message: any): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (channel, message) => {
      callback(JSON.parse(message));
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  // Rate limiting
  async isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, windowMs / 1000);
    }
    return current > limit;
  }

  // Session management
  async setSession(sessionId: string, data: any): Promise<void> {
    await this.set(`session:${sessionId}`, data, 24 * 60 * 60); // 24 hours
  }

  async getSession(sessionId: string): Promise<any> {
    return await this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Analytics caching
  async cacheAnalytics(key: string, data: any, ttl: number = 300): Promise<void> {
    await this.set(`analytics:${key}`, data, ttl);
  }

  async getCachedAnalytics(key: string): Promise<any> {
    return await this.get(`analytics:${key}`);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.redis.quit();
    await this.subscriber.quit();
    await this.publisher.quit();
  }
} 