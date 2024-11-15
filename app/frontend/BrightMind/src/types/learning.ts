// src/types/learning.ts
export interface TopicSummary {
    id: string;
    title: string;
    description: string;
    totalLessons: number;
    totalQuizzes: number;
    lessons: Lesson[];
  }