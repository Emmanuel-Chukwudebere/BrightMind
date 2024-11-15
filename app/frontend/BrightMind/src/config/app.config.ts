// src/config/app.config.ts

export const APP_CONFIG = {
  // API Configuration
  API: {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.brightmind.edu',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
  },

  // Content Configuration
  CONTENT: {
    MAX_DOWNLOAD_RETRIES: 3,
    DOWNLOAD_CHUNK_SIZE: 1024 * 1024, // 1MB
    CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    MAX_OFFLINE_STORAGE: 1024 * 1024 * 1024, // 1GB
  },

  // Authentication Configuration
  AUTH: {
    SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    REFRESH_TOKEN_BEFORE: 5 * 60 * 1000, // 5 minutes in milliseconds
  },

  // Learning Configuration
  LEARNING: {
    MIN_PASS_SCORE: 60,
    QUIZ_TIME_LIMIT: 30 * 60, // 30 minutes in seconds
    MAX_QUIZ_ATTEMPTS: 3,
  },

  // UI Configuration
  UI: {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 3000,
    MAX_TITLE_LENGTH: 50,
    DEBOUNCE_DELAY: 300,
  },

  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: '@brightmind_auth_token',
    USER_PREFERENCES: '@brightmind_user_prefs',
    OFFLINE_CONTENT: '@brightmind_offline_content',
    LEARNING_PROGRESS: '@brightmind_learning_progress',
  },
} as const;
