import { api } from './client';

export const getPackages = async () => {
  const res = await api.get('/package');
  return res.data?.data ?? [];
};

