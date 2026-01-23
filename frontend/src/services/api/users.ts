/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/api/users.ts
import api from '../../utils/axios';
import { CreateUserPayload } from './types';

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (e: any) {
    throw new Error(e.response?.data?.message || 'Failed to fetch users');
  }
};

// Create new user (admin only)
export const createUser = async (payload: CreateUserPayload) => {
  try {
    const response = await api.post('/users/add', payload);
    return response.data;
  } catch (e: any) {
    throw new Error(e.response?.data?.message || 'Failed to create user');
  }
};

// Update user (admin only)
export const updateUser = async (id: number, payload: Partial<CreateUserPayload>) => {
  try {
    const response = await api.put(`/users/${id}`, payload);
    return response.data;
  } catch (e: any) {
    throw new Error(e.response?.data?.message || 'Failed to update user');
  }
};

// Delete user (admin only)
export const deleteUser = async (id: number) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (e: any) {
    throw new Error(e.response?.data?.message || 'Failed to delete user');
  }
};
