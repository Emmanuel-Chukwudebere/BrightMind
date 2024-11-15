// src/services/api.ts
import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/app.config';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || API_BASE_URL;

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
          // Redirect to login
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
    signup: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    profile: (userId: string) => `/auth/profile/${userId}`,
    settings: (userId: string) => `/auth/settings/${userId}`,
    uploadImage: '/auth/profile/picture'
  },
  topics: {
    list: '/lessons',  // Using lessons routes for topics
    byId: (id: string) => `/lessons/${id}`,
    complete: (id: string) => `/lessons/${id}/complete`,
    progress: (id: string) => `/lessons/${id}/progress`,
    download: (id: string) => `/lessons/${id}/download`,
    delete: (id: string) => `/lessons/${id}/delete`,
    size: (id: string) => `/lessons/${id}/size`,
    content: (id: string) => `/lessons/${id}/content`
  },
  quizzes: {
    list: '/quiz',
    byId: (id: string) => `/quiz/${id}`,
    submit: (id: string) => `/quiz/${id}/submit`,
    reset: (id: string) => `/quiz/${id}/reset`,
    results: (id: string) => `/quiz/${id}/results`,
  },
  profile: {
    get: (userId: string) => `/auth/profile/${userId}`,
    update: (userId: string) => `/auth/profile/${userId}`,
    uploadImage: '/auth/profile/picture',
    settings: (userId: string) => `/auth/settings/${userId}`
  },
  notifications: {
    send: '/notifications/send-notification',
    subscribe: '/notifications/subscribe',
  },
  streaming: {
    start: (topicId: string, level: string) => 
      `/streaming/${topicId}/level/${level}`,
    status: (requestId: string) => 
      `/streaming/status/${requestId}`,
  },
  ai: {
    ask: '/ai/ask-ai',
    textToSpeech: '/ai/text-to-speech',
    speechToText: '/ai/speech-to-text'
  },
  search: {
    explore: (query: string) => `/search/search?screen=explore&query=${query}`
  }
};

// Helper functions
export async function downloadTopic(topicId: string) {
  return api.post(endpoints.topics.download(topicId));
}

export async function deleteDownloadedTopic(topicId: string) {
  return api.delete(endpoints.topics.delete(topicId));
}

export async function getTopicById(topicId: string) {
  return api.get(endpoints.topics.byId(topicId));
}

export async function resetQuiz(quizId: string) {
  return api.post(endpoints.quizzes.reset(quizId));
}

export async function submitQuiz(quizId: string, answers: Record<string, any>) {
  return api.post(endpoints.quizzes.submit(quizId), answers);
}

export async function updateProfile(userId: string, data: Record<string, any>) {
  return api.put(endpoints.profile.update(userId), data);
}

export async function uploadProfileImage(formData: FormData) {
  return api.post(endpoints.profile.uploadImage, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function updateSettings(userId: string, settings: Record<string, any>) {
  return api.put(endpoints.profile.settings(userId), settings);
}

export async function sendNotification(data: { userId: string; title: string; body: string }) {
  return api.post(endpoints.notifications.send, data);
}

export async function subscribeToNotifications(data: { fcmToken: string; subscriptions: string[] }) {
  return api.post(endpoints.notifications.subscribe, data);
}

export async function askAI(data: { question: string; context?: string }) {
  return api.post(endpoints.ai.ask, data);
}

export async function textToSpeech(data: { text: string }) {
  return api.post(endpoints.ai.textToSpeech, data);
}

export async function speechToText(data: FormData) {
  return api.post(endpoints.ai.speechToText, data);
}