// src/hooks/useStorage.ts
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Get value from storage
  const getValue = useCallback(async () => {
    try {
      const item = await AsyncStorage.getItem(key);
      const value = item ? JSON.parse(item) : initialValue;
      setStoredValue(value);
      return value;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return initialValue;
    }
  }, [key, initialValue]);

  // Set value to storage
  const setValue = useCallback(async (value: T) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }, [key, storedValue]);

  // Remove value from storage
  const removeValue = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }, [key, initialValue]);

  return {
    storedValue,
    setValue,
    getValue,
    removeValue,
  };
}
