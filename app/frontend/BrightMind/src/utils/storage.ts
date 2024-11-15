// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../config/app.config';

export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_PROFILE: 'user_profile',
  THEME_PREFERENCE: 'theme_preference',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  DOWNLOAD_PREFERENCES: 'download_preferences',
  LEARNING_PROGRESS: 'learning_progress',
  STREAK_DATA: 'streak_data',
  LAST_SYNC: 'last_sync',
  OFFLINE_CONTENT: 'offline_content',
  SEARCH_HISTORY: 'search_history',
} as const;

export const clearStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      StorageKeys.AUTH_TOKEN,
      StorageKeys.USER_PROFILE,
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const getStorageSize = async (): Promise<number> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;
    
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
};

export const pruneStorage = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const now = Date.now();
    
    for (const key of keys) {
      if (key.startsWith('temp_') || key.startsWith('cache_')) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          const data = JSON.parse(value);
          if (data.expiresAt && data.expiresAt < now) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error pruning storage:', error);
  }
};
