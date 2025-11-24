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
};
