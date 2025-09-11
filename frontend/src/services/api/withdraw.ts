import api from '@/utils/axios';

export interface WithdrawRequest {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  bankName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  processedAt?: string;
  affiliate: {
    id: number;
    fullname: string;
    email: string;
  };
  processor?: {
    id: number;
    fullname: string;
    email: string;
  };
}

export interface WithdrawStatistics {
  statusCounts: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  processedTotal: number;
  pendingTotal: number;
}

export interface CreateWithdrawPayload {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  notes?: string;
}

export interface ApproveWithdrawPayload {
  notes?: string;
}

export interface RejectWithdrawPayload {
  rejectionReason: string;
}

// Admin endpoints
export const getAllWithdrawRequests = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  affiliateId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get('/withdraw/admin/all', { params });
  return response.data.data.withdrawRequests;
};

export const getWithdrawStatistics = async () => {
  const response = await api.get('/withdraw/admin/statistics');
  return response.data;
};

export const approveWithdrawRequest = async (id: number, payload: ApproveWithdrawPayload) => {
  const response = await api.put(`/withdraw/admin/approve/${id}`, payload);
  return response.data;
};

export const rejectWithdrawRequest = async (id: number, payload: RejectWithdrawPayload) => {
  const response = await api.put(`/withdraw/admin/reject/${id}`, payload);
  return response.data;
};

export const markAsProcessed = async (id: number) => {
  const response = await api.put(`/withdraw/admin/process/${id}`);
  return response.data;
};

// Affiliator endpoints
export const createWithdrawRequest = async (payload: CreateWithdrawPayload) => {
  const response = await api.post('/withdraw/request', payload);
  return response.data;
};

export const getWithdrawHistory = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/withdraw/history', { params });
  return response.data;
};

export const getWithdrawRequestDetail = async (id: number) => {
  const response = await api.get(`/withdraw/${id}`);
  return response.data;
};