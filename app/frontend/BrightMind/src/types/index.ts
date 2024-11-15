// src/types/index.ts

// Navigation
export interface NavigationProps {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}

// Topic
export interface Topic {
  id: string;
  title: string;
  subject: string;
  lessonCount: number;
  quizCount: number;
  progress: number;
  imageUrl: string;
  isDownloaded?: boolean;
  downloadProgress?: number;
  lastAccessedAt?: string;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  streak: number;
  lastActive: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  autoDownload: boolean;
}

// Lesson
export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  content: string;
  duration: number;
  order: number;
  completed: boolean;
  progress: number;
}

// Quiz
export interface Quiz {
  id: string;
  topicId: string;
  title: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Download
export interface DownloadTask {
  id: string;
  topicId: string;
  progress: number;
  status: DownloadStatus;
  error?: string;
  startTime: Date;
  endTime?: Date;
}

export enum DownloadStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  COMPLETED = 'completed',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

// Network
export interface NetworkState {
  isConnected: boolean;
  showOfflineMessage: boolean;
}

// Download Options
export interface DownloadOptions {
  priority: number;
  onProgress: (progress: number) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

// Performance
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  metadata?: Record<string, any>;
}

// API
export interface APIResponse<T> {
  data: T;
  status: number;
  message?: string;
  error?: string;
}
