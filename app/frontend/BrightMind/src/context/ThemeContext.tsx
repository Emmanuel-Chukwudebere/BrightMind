// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, lightTheme, darkTheme } from '../constants/Colors';
import { APP_CONFIG } from '../config/app.config';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: typeof lightTheme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  useEffect(() => {
    // Load saved theme preference
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_PREFERENCES);
        if (savedThemeMode) {
          setThemeMode(JSON.parse(savedThemeMode).themeMode || 'system');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  const handleThemeModeChange = async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify({ themeMode: mode })
      );
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const isDark = 
    themeMode === 'system' 
      ? systemColorScheme === 'dark'
      : themeMode === 'dark';

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        setThemeMode: handleThemeModeChange,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
