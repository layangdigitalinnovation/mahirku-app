import { api } from './client';

export interface Invoice {
  id: number;
  userId: number;
  packageId: number;
  tokenAmount: number;  // This is the price field from backend
  status: 'PENDING' | 'PAID' | 'FAILED';
  paymentDate: Date | null;
  xenditInvoiceId: string | null;
  createdAt: string;
  updatedAt: string;
  Package?: {
    id: number;
    name: string;
    tokens: number;
    price: number;
  };
}

export const getInvoiceById = async (id: number) => {
  const res = await api.get(`/invoice/${id}`);
  return res.data as { id: number; status: 'PENDING' | 'PAID' | 'FAILED'; tokenAmount?: number; paymentDate?: string };
};

export const getUserInvoices = async () => {
  const res = await api.get<Invoice[]>('/invoice/user');
  return res.data;
};
