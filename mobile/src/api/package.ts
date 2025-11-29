import { api } from './client';

export const getPackages = async () => {
  const res = await api.get('/packages');
  return res.data?.data ?? [];
};

