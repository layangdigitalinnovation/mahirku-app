import { api } from './client';

export const purchaseToken = async (payload: { packageId: number; voucherCode?: string }) => {
  const res = await api.post('/tokens/purchase', payload);
  return res.data as { message: string; paymentUrl: string; invoiceId: number };
};

export const validateVoucher = async (code: string) => {
  const res = await api.get(`/vouchers/validate/${code}`);
  return res.data as { message: string; data: { id: number; code: string; type: 'percentage' | 'fixed'; value: number; isActive: boolean } };
};

