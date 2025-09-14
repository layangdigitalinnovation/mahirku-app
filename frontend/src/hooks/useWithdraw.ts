import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllWithdrawRequests,
  getWithdrawStatistics,
  approveWithdrawRequest,
  rejectWithdrawRequest,
  markAsProcessed,
  createWithdrawRequest,
  getWithdrawHistory,
  getWithdrawRequestDetail,
  CreateWithdrawPayload,
  ApproveWithdrawPayload,
  RejectWithdrawPayload
} from '@/services/api/withdraw';
import { toast } from 'sonner';

// Admin hooks
export const useGetAllWithdrawRequests = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  affiliateId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['withdraw-requests', params],
    queryFn: () => getAllWithdrawRequests(params),
      refetchInterval: 5000, // 30 seconds
  });
};

export const useGetWithdrawStatistics = () => {
  return useQuery({
    queryKey: ['withdraw-statistics'],
    queryFn: getWithdrawStatistics, // 1 minute
  });
};

export const useApproveWithdrawRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ApproveWithdrawPayload }) =>
      approveWithdrawRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdraw-requests'] });
      queryClient.invalidateQueries({ queryKey: ['withdraw-statistics'] });
      toast.success('Withdraw request approved successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to approve withdraw request');
    },
  });
};

export const useRejectWithdrawRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RejectWithdrawPayload }) =>
      rejectWithdrawRequest(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdraw-requests'] });
      queryClient.invalidateQueries({ queryKey: ['withdraw-statistics'] });
      toast.success('Withdraw request rejected successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject withdraw request');
    },
  });
};

export const useMarkAsProcessed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => markAsProcessed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdraw-requests'] });
      queryClient.invalidateQueries({ queryKey: ['withdraw-statistics'] });
      toast.success('Request marked as processed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark as processed');
    },
  });
};

// Affiliator hooks
export const useCreateWithdrawRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: CreateWithdrawPayload) => createWithdrawRequest(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdraw-history'] });
      toast.success('Withdraw request created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create withdraw request');
    },
  });
};

export const useGetWithdrawHistory = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['withdraw-history', params],
    queryFn: () => getWithdrawHistory(params),
    staleTime: 30000, // 30 seconds
  });
};

export const useGetWithdrawRequestDetail = (id: number) => {
  return useQuery({
    queryKey: ['withdraw-request', id],
    queryFn: () => getWithdrawRequestDetail(id),
    enabled: !!id,
    staleTime: 30000, // 30 seconds
  });
};