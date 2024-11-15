// src/types/topic.ts

export type TopicCardVariant = 'started' | 'notStarted';

export interface TopicProgress {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

export interface Topic {
  id: string;
  subject: string;
  title: string;
  imageUrl: string;
  totalLessons: number;
  totalQuizzes: number;
  downloadUrl?: string;
  progress?: TopicProgress;
  isDownloaded?: boolean;
  downloadStatus?: 'queued' | 'paused' | 'downloading' | 'completed' | 'error' | 'cancelled';
}

export interface QuizScore {
  score: number;
  quizId: string;
}