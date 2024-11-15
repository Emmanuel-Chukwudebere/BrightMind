import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLocalStorage = () => {
  const getItem = async <T>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting item from storage: ${error}`);
      return null;
    }
  };

  const setItem = async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in storage: ${error}`);
    }
  };

  const removeItem = async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from storage: ${error}`);
    }
  };

  const clear = async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error(`Error clearing storage: ${error}`);
    }
  };

  return {
    getItem,
    setItem,
    removeItem,
    clear,
  };
};
