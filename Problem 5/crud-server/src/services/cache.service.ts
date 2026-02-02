import Redis from 'ioredis';
import config from '../config';
import logger from '../utils/logger';
import { ICacheService } from '../types';

/**
 * Redis Cache Service
 * Handles caching, sessions, rate limiting, and leaderboard data
 */
class CacheService implements ICacheService {
  private client: Redis | null = null;
  private connected = false;

  async connect(): Promise<void> {
    try {
      this.client = new Redis({
        host: config.redisHost,
        port: config.redisPort,
        password: config.redisPassword || undefined,
        retryStrategy: (times) => {
          if (times > 3) {
            logger.warn('Redis connection failed, continuing without cache');
            return null;
          }
          return Math.min(times * 200, 2000);
        },
        lazyConnect: true,
      });

      this.client.on('connect', () => {
        this.connected = true;
        logger.info('Redis connected');
      });

      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
        this.connected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.warn('Redis unavailable, continuing without cache');
      this.connected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.connected = false;
    }
  }

  isAvailable(): boolean {
    return this.connected && this.client !== null;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable()) return null;
    try {
      const value = await this.client!.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Cache GET error: ${key}`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl = config.cacheTtl): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      await this.client!.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error(`Cache SET error: ${key}`, error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      await this.client!.del(key);
    } catch (error) {
      logger.error(`Cache DELETE error: ${key}`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(...keys);
      }
    } catch (error) {
      logger.error(`Cache DELETE PATTERN error: ${pattern}`, error);
    }
  }

  async increment(key: string, ttl?: number): Promise<number> {
    if (!this.isAvailable()) return 0;
    try {
      const result = await this.client!.incr(key);
      if (ttl && result === 1) {
        await this.client!.expire(key, ttl);
      }
      return result;
    } catch (error) {
      logger.error(`Cache INCREMENT error: ${key}`, error);
      return 0;
    }
  }

  async getTtl(key: string): Promise<number> {
    if (!this.isAvailable()) return -1;
    try {
      return await this.client!.ttl(key);
    } catch (error) {
      return -1;
    }
  }

  // Leaderboard operations using sorted sets
  async zadd(key: string, score: number, member: string): Promise<void> {
    if (!this.isAvailable()) return;
    try {
      await this.client!.zadd(key, score, member);
    } catch (error) {
      logger.error(`Cache ZADD error: ${key}`, error);
    }
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.isAvailable()) return [];
    try {
      return await this.client!.zrange(key, start, stop);
    } catch (error) {
      logger.error(`Cache ZRANGE error: ${key}`, error);
      return [];
    }
  }
}

export const cacheService = new CacheService();
export default cacheService;
