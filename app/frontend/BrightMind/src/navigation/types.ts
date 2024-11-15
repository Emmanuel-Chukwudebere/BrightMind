// src/navigation/types.ts
import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  // Initial Screens
  Splash: undefined;
  Onboarding: undefined;

  // Auth Stack
  SignIn: undefined;
  SignUp: undefined;
  ForgotPasswordEmail: undefined;
  ForgotPasswordEmailSent: undefined;
  ForgotPasswordReset: { token: string };
  ForgotPasswordSuccess: undefined;

  // Main Tab Navigator
  MainTabs: undefined;

  // Learning & Content Screens
  Learn: undefined;
  LearningLevel: { topicId: string };
  LessonContent: { lessonId: string; topicId: string };
  Quiz: { quizId: string; lessonId: string };
  Streaming: { streamId: string; topicId: string };
  TopicSummary: { topicId: string };
  OfflineContent: undefined;

  // Profile & Settings Screens
  EditProfile: undefined;
  ProfileImage: undefined;
  NotificationSettings: undefined;
  Notifications: undefined;
};

export type TabNavigatorParamList = {
  Home: undefined;
  Explore: undefined;
  Learn: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}