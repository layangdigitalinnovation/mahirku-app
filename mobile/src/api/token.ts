import { api } from './client';

export const purchaseToken = async (payload: { packageId: number; voucherCode?: string }) => {
  const res = await api.post('/tokens/purchase', payload);
  return res.data as { message: string; paymentUrl: string; invoiceId: number };
};

