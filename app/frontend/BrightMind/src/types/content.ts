// src/types/content.ts

export interface LearningLevel {
    value: 'Beginner' | 'Intermediate' | 'Advanced';
    label: string;
  }
  
  export interface Topic {
    id: string;
    title: string;
    subject: string;
    description?: string;
    imageUrl: string;
    lessonCount: number;
    quizCount: number;
    progress: number;
    isDownloaded?: boolean;
  }
  
  export interface SubjectSection {
    title: string;
    topics: Topic[];
  }
  
  export interface TopicSummary {
    title: string;
    description: string;
    lessons: Lesson[];
  }
  
  export interface Lesson {
    id: string;
    title: string;
    content: string;
    examples: string[];
    notes?: string;
  }
  
  export interface Quiz {
    id: string;
    question: string;
    type: 'multiple-choice' | 'single-choice' | 'text-input';
    options?: string[];
    correctAnswer: string | string[];
  }