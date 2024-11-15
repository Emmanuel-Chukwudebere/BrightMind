// src/services/navigationService.ts
import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const NavigationService = {
  navigate<RouteName extends keyof RootStackParamList>(
    name: RouteName,
    params?: RootStackParamList[RouteName]
  ) {
    if (navigationRef.isReady()) {
      navigationRef.navigate(name, params);
    }
  },

  goBack() {
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    }
  },

  reset(routeName: keyof RootStackParamList) {
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: routeName }],
      });
    }
  },

  getCurrentRoute() {
    if (navigationRef.isReady()) {
      return navigationRef.getCurrentRoute()?.name;
    }
    return undefined;
  },

  // Navigation shortcuts for common flows
  navigateToLesson(lessonId: string) {
    this.navigate('LessonContentScreen', { lessonId });
  },

  navigateToQuiz(quizId: string) {
    this.navigate('QuizScreen', { quizId });
  },

  navigateToTopic(topicId: string) {
    this.navigate('TopicSummary', { topicId });
  },

  navigateToLearningLevel(topicId: string) {
    this.navigate('LearningLevelScreen', { topicId });
  },

  navigateToStreaming(topicId: string, level: string, contentRequestId: string) {
    this.navigate('StreamingScreen', { topicId, level, contentRequestId });
  },

  // Authentication flow
  navigateToAuth() {
    this.reset('SignIn');
  },

  navigateToMain() {
    this.reset('MainTabs');
  },

  // Profile flow
  navigateToEditProfile() {
    this.navigate('EditProfile');
  },

  navigateToNotifications() {
    this.navigate('Notifications');
  },

  navigateToOfflineContent() {
    this.navigate('OfflineContent');
  },
};
