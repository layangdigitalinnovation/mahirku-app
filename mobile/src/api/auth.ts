import { api } from './client';

export const loginApi = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const registerUserApi = (payload: {
  username: string;
  email: string;
  password: string;
  fullname: string;
  address: string;
  phoneNumber: string;
  roleId?: number;
  referralCode?: string;
}) => api.post('/auth/register-user', payload);

export const meApi = () => api.get('/auth/me');
