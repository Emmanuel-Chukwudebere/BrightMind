// src/context/PreferencesContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../config/app.config';

interface UserPreferences {
  autoDownload: boolean;
  notificationsEnabled: boolean;
  downloadOverCellular: boolean;
  downloadQuality: 'high' | 'medium' | 'low';
  fontScale: number;
  hapticFeedback: boolean;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  autoDownload: false,
  notificationsEnabled: true,
  downloadOverCellular: false,
  downloadQuality: 'high',
  fontScale: 1,
  hapticFeedback: true,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedPreferences = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_PREFERENCES);
        if (savedPreferences) {
          setPreferences({
            ...defaultPreferences,
            ...JSON.parse(savedPreferences),
          });
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    try {
      const newPreferences = {
        ...preferences,
        [key]: value,
      };
      setPreferences(newPreferences);
      await AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(newPreferences)
      );
    } catch (error) {
      console.error('Failed to save preferences:', error);
      throw error;
    }
  };

  const resetPreferences = async () => {
    try {
      setPreferences(defaultPreferences);
      await AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(defaultPreferences)
      );
    } catch (error) {
      console.error('Failed to reset preferences:', error);
      throw error;
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        resetPreferences,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
