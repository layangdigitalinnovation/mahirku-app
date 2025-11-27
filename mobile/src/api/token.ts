import { api } from './client';

export const purchaseToken = async (payload: { packageId: number; voucherCode?: string }) => {
  const res = await api.post('/token/purchase', payload);
  return res.data as { message: string; paymentUrl: string; invoiceId: number };
};

