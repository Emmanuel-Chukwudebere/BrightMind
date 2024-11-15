// src/services/progressService.ts
import axios from 'axios';

const API_BASE_URL = 'your-api-base-url';

export const fetchLessonProgress = async (userId: string): Promise<number> => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/lessons/progress/${userId}`
    );
    return response.data.progress;
  } catch (error) {
    console.error('Error fetching lesson progress:', error);
    throw error;
  }
};

export const submitQuizProgress = async (
  quizId: string,
  answers: any
): Promise<number> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/quiz/submit/${quizId}`,
      answers
    );
    return response.data.score;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};