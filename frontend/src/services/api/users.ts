/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/api/users.ts
import api from '../../utils/axios';
import { CreateUserPayload } from './types';

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (e : any) {
    throw new Error(e.response?.data?.message || 'Failed to fetch users');
  }
};

// Create new user (admin only)
export const createUser = async (payload: CreateUserPayload) => {
  try {
    const response = await api.post('/users/add', payload);
    return response.data;
  } catch (e : any) {
    throw new Error(e.response?.data?.message || 'Failed to create user');
  }
};