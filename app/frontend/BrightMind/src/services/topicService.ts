// src/services/topicService.ts

import axios from 'axios';
import { LearningLevel, TopicSummary, Lesson, Quiz } from '../types/content';

const API_BASE_URL = 'url/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ContentService = {
  generateContent: async (level: LearningLevel['value']) => {
    try {
      const response = await api.post('/content/generate', { level });
      return response.data;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  },
};