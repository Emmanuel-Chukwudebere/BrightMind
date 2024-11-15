// src/services/analyticsService.ts
import { analytics, AnalyticsEvent, AnalyticsUserProperty } from '../utils/analytics';
import { APP_CONFIG } from '../config/app.config';

class AnalyticsService {
  async initialize(): Promise<void> {
    await analytics.initialize();
  }

  trackAppOpen(): void {
    analytics.trackEvent(AnalyticsEvent.APP_OPEN, {
      appVersion: APP_CONFIG.VERSION,
      timestamp: new Date().toISOString(),
    });
  }

  trackSignIn(userId: string): void {
    analytics.setUserId(userId);
    analytics.trackEvent(AnalyticsEvent.SIGN_IN);
  }

  trackSignOut(): void {
    analytics.trackEvent(AnalyticsEvent.SIGN_OUT);
    analytics.clearUserId();
  }

  trackLessonStart(lessonId: string, topicId: string): void {
    analytics.trackEvent(AnalyticsEvent.LESSON_START, {
      lessonId,
      topicId,
    });
  }

  trackLessonComplete(lessonId: string, topicId: string, duration: number): void {
    analytics.trackEvent(AnalyticsEvent.LESSON_COMPLETE, {
      lessonId,
      topicId,
      duration,
    });
  }

  trackQuizStart(quizId: string, topicId: string): void {
    analytics.trackEvent(AnalyticsEvent.QUIZ_START, {
      quizId,
      topicId,
    });
  }

  trackQuizComplete(
    quizId: string,
    topicId: string,
    score: number,
    duration: number
  ): void {
    analytics.trackEvent(AnalyticsEvent.QUIZ_COMPLETE, {
      quizId,
      topicId,
      score,
      duration,
    });
  }

  trackTopicView(topicId: string): void {
    analytics.trackEvent(AnalyticsEvent.TOPIC_VIEW, {
      topicId,
    });
  }

  trackSearch(query: string, resultCount: number): void {
    analytics.trackEvent(AnalyticsEvent.SEARCH, {
      query,
      resultCount,
    });
  }

  trackError(error: Error, context?: string): void {
    analytics.trackError(error, context);
  }

  setUserProperties(properties: Record<AnalyticsUserProperty, string | number | boolean>): void {
    Object.entries(properties).forEach(([property, value]) => {
      analytics.setUserProperty(property as AnalyticsUserProperty, value);
    });
  }
}

export const analyticsService = new AnalyticsService();
