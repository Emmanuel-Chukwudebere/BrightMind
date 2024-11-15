// src/services/api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiService {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
          // Redirect to login or refresh token
        }
        return Promise.reject(error);
      }
    );
  }

  // HTTP methods
  async get<T>(url: string, config = {}) {
    return this.instance.get<T>(url, config);
  }

  async post<T>(url: string, data = {}, config = {}) {
    return this.instance.post<T>(url, data, config);
  }

  async put<T>(url: string, data = {}, config = {}) {
    return this.instance.put<T>(url, data, config);
  }

  async delete<T>(url: string, config = {}) {
    return this.instance.delete<T>(url, config);
  }

  async patch<T>(url: string, data = {}, config = {}) {
    return this.instance.patch<T>(url, data, config);
  }
}

export const api = new ApiService();

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    refreshToken: '/auth/refresh-token',
  },
  topics: {
    list: '/topics',
    search: (query: string) => `/topics/search?q=${query}`,
    byId: (id: string) => `/topics/${id}`,
    download: (id: string) => `/topics/${id}/download`,
    delete: (id: string) => `/topics/${id}`,
    progress: (id: string) => `/topics/${id}/progress`,
  },
  lessons: {
    list: '/lessons',
    byId: (id: string) => `/lessons/${id}`,
    complete: (id: string) => `/lessons/${id}/complete`,
    progress: (id: string) => `/lessons/${id}/progress`,
  },
  quizzes: {
    list: '/quizzes',
    byId: (id: string) => `/quizzes/${id}`,
    submit: (id: string) => `/quizzes/${id}/submit`,
    reset: (id: string) => `/quizzes/${id}/reset`,
    results: (id: string) => `/quizzes/${id}/results`,
  },
  profile: {
    get: '/profile',
    update: '/profile',
    uploadImage: '/profile/image',
    notifications: '/profile/notifications',
    settings: '/profile/settings',
  },
  streaming: {
    start: (topicId: string, level: string) => 
      `/streaming/${topicId}/level/${level}`,
    status: (requestId: string) => 
      `/streaming/status/${requestId}`,
  },
};

// Helper functions
export async function downloadTopic(topicId: string) {
  return api.post(endpoints.topics.download(topicId));
}

export async function deleteDownloadedTopic(topicId: string) {
  return api.delete(endpoints.topics.delete(topicId));
}

export async function getLessonById(lessonId: string) {
  return api.get(endpoints.lessons.byId(lessonId));
}

export async function resetQuiz(quizId: string) {
  return api.post(endpoints.quizzes.reset(quizId));
}

export async function submitQuiz(quizId: string, answers: Record<string, any>) {
  return api.post(endpoints.quizzes.submit(quizId), answers);
}

export async function updateProfile(data: Record<string, any>) {
  return api.put(endpoints.profile.update, data);
}

export async function uploadProfileImage(formData: FormData) {
  return api.post(endpoints.profile.uploadImage, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function updateNotificationSettings(settings: Record<string, boolean>) {
  return api.put(endpoints.profile.notifications, settings);
}