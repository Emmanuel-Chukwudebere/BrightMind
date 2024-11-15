// src/utils/analytics.ts
import { APP_CONFIG } from '../config/app.config';

export enum AnalyticsEvent {
  APP_OPEN = 'app_open',
  SIGN_IN = 'sign_in',
  SIGN_UP = 'sign_up',
  LESSON_START = 'lesson_start',
  LESSON_COMPLETE = 'lesson_complete',
  QUIZ_START = 'quiz_start',
  QUIZ_COMPLETE = 'quiz_complete',
  TOPIC_VIEW = 'topic_view',
  CONTENT_DOWNLOAD = 'content_download',
  SEARCH = 'search',
  ERROR = 'error',
}

export enum AnalyticsUserProperty {
  USER_ID = 'user_id',
  SUBSCRIPTION_STATUS = 'subscription_status',
  LEARNING_LEVEL = 'learning_level',
  APP_VERSION = 'app_version',
  DEVICE_TYPE = 'device_type',
  OS_VERSION = 'os_version',
}

interface AnalyticsParams {
  [key: string]: string | number | boolean | undefined;
}

class Analytics {
  private userId?: string;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Initialize your analytics service here
      // Example: await analytics.initialize(APP_CONFIG.ANALYTICS_KEY);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
    // Set user ID in your analytics service
  }

  clearUserId(): void {
    this.userId = undefined;
    // Clear user ID in your analytics service
  }

  trackEvent(event: AnalyticsEvent, params?: AnalyticsParams): void {
    if (!this.initialized) {
      console.warn('Analytics not initialized');
      return;
    }

    try {
      const eventParams = {
        ...params,
        timestamp: new Date().toISOString(),
        userId: this.userId,
      };

      // Track event in your analytics service
      console.log('Analytics Event:', event, eventParams);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  setUserProperty(property: AnalyticsUserProperty, value: string | number | boolean): void {
    if (!this.initialized) {
      console.warn('Analytics not initialized');
      return;
    }

    try {
      // Set user property in your analytics service
      console.log('Set User Property:', property, value);
    } catch (error) {
      console.error('Failed to set user property:', error);
    }
  }

  trackError(error: Error, context?: string): void {
    this.trackEvent(AnalyticsEvent.ERROR, {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      context,
    });
  }
}

export const analytics = new Analytics();
