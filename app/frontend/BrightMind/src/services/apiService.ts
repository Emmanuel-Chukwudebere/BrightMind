// src/services/apiService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: 'https://dummyurl/api/v1',
  timeout: 10000,
});

export const fetchProfile = async (userId: string) => {
  const cacheKey = `profile_${userId}`;
  try {
    const response = await api.get(`/auth/profile/${userId}`);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    const cachedData = await AsyncStorage.getItem(cacheKey);
    return cachedData ? JSON.parse(cachedData) : null;
  }
};

export const updateProfile = async (userId: string, data: object) => {
    return await api.put(`/auth/profile/${userId}`, data);
};

export const uploadProfilePicture = async (formData: FormData) => {
    return await api.post('/auth/profile/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
};
