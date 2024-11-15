// src/utils/axios.ts
import axios from 'axios';
import { auth } from '../config/firebase';

const axiosInstance = axios.create({
  baseURL: '${url}/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;