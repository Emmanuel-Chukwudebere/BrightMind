// src/services/streakService.ts
import axios from 'axios';
import { StreakData } from '../types/streak';

const API_BASE_URL = 'your-api-base-url';

export const fetchStreakData = async (): Promise<StreakData> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/streak/track`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch streak data');
  }
};