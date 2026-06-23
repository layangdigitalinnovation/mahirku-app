import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../api/client';

export const saveToken = async (token: string) => {
  await AsyncStorage.setItem('token', token);
  setAuthToken(token);
};

export const loadToken = async () => {
  const token = await AsyncStorage.getItem('token');
  if (token) setAuthToken(token);
  return token;
};

export const clearToken = async () => {
  await AsyncStorage.removeItem('token');
  setAuthToken(undefined);
  
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cstKeys = keys.filter(k => k.startsWith('cst:'));
    if (cstKeys.length > 0) {
      await AsyncStorage.multiRemove(cstKeys);
    }
  } catch (error) {
    console.error('Error clearing cst data:', error);
  }
};
