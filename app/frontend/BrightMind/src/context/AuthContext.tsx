// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthFormData, ProfileImageData, User } from '../types/auth.types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (data: AuthFormData) => Promise<void>;
  signIn: (data: AuthFormData) => Promise<void>;
  signOut: () => Promise<void>;
  uploadProfileImage: (imageData: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'https://your-api-url.com/api/v1/auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user from AsyncStorage on app start
  useEffect(() => {
    const loadUserData = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    loadUserData();
  }, []);

  const signUp = async (data: AuthFormData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/signup`, data);
      setUser(response.data);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (data: AuthFormData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/login`, data);
      setUser(response.data);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error signing in');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      throw new Error('Error signing out');
    } finally {
      setLoading(false);
    }
  };

  const uploadProfileImage = async (imageData: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', imageData);
      const response = await axios.post(`${API_URL}/profile/picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update user profile image in both state and AsyncStorage
      const updatedUser = { ...user, profileImage: response.data.profileImage };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error uploading profile image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, uploadProfileImage }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
