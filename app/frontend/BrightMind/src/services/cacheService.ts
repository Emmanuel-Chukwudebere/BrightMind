// src/services/cacheService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../config/app.config';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheService {
  private readonly prefix = 'cache_';
  private readonly defaultTTL = APP_CONFIG.CACHE.DEFAULT_TTL;

  async set<T>(
    key: string,
    data: T,
    ttl: number = this.defaultTTL
  ): Promise<void> {
    const cacheKey = this.getCacheKey(key);
    const timestamp = Date.now();
    const cacheItem: CacheItem<T> = {
      data,
      timestamp,
      expiresAt: timestamp + ttl,
    };

    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const cacheKey = this.getCacheKey(key);

    try {
      const value = await AsyncStorage.getItem(cacheKey);
      if (!value) return null;

      const cacheItem: CacheItem<T> = JSON.parse(value);
      if (Date.now() > cacheItem.expiresAt) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    const cacheKey = this.getCacheKey(key);
    try {
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Error removing cache:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async clearExpired(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.prefix));
      const now = Date.now();

      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          const cacheItem: CacheItem<any> = JSON.parse(value);
          if (now > cacheItem.expiresAt) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  private getCacheKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}

export const cacheService = new CacheService();
