// src/screens/Learn/types.ts
export interface Topic {
    id: string;
    title: string;
    category: string;
    thumbnail: string;
    totalLessons: number;
    totalQuizzes: number;
    progress: number;
    isDownloaded: boolean;
  }
  
  export interface TopicsByCategory {
    [key: string]: Topic[];
  }
  