// src/services/api/auth.ts
import api from '../../utils/axios';
import { AffiliatorRegisterPayload, CreateUserPayload, LoginPayload } from './types';

// Register user (umum atau affiliator, tergantung roleId)
export const registerUser = async (payload: CreateUserPayload) => {
  try {
    const response = await api.post('/auth/register-user', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to register user');
  }
};

// Register khusus affiliator (landing page khusus)
export const registerAffiliator = async (payload: AffiliatorRegisterPayload) => {
  try {
    const response = await api.post('/auth/register-affiliator', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to register affiliator');
  }
};

// Login
export const login = async (payload: LoginPayload) => {
  try {
    const response = await api.post('/auth/login', payload);

    const { password, ...res } = response.data;
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Get current authenticated user
export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
};