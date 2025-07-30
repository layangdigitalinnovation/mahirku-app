// src/services/api.ts
import api from '../utils/axios';

// =======================
// Interfaces
// =======================

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
  fullname: string;
  phoneNumber: string;
  address: string;
  roleId?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// =======================
// User Management (Admin)
// =======================

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
};

// Create new user (admin only)
export const createUser = async (payload: CreateUserPayload) => {
  try {
    const response = await api.post('/users', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create user');
  }
};

// =======================
// Auth & Registration
// =======================

// Register user (umum atau affiliator, tergantung roleId)
export const registerUser = async (payload: CreateUserPayload) => {
  try {
    const response = await api.post('/auth/register', payload);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to register user');
  }
};

// Register khusus affiliator (landing page khusus)
export const registerAffiliator = async (payload: CreateUserPayload) => {
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
    return response.data;
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
