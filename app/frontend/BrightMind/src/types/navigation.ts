// src/types/navigation.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  // Auth Stack
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ForgotPasswordReset: { token: string };
  ForgotPasswordSuccess: undefined;

  // Main Stack
  Home: undefined;
  Explore: undefined;
  TopicDetail: { topicId: string };
  LearningLevel: { topicId: string };
  Profile: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

export interface TabBarIconProps {
  focused: boolean;
  name: string;
  label: string;
}