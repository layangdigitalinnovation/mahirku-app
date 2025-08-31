import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getAllThinkingStyles,
  getThinkingStyleById,
  getThinkingStyleStats,
  createThinkingStyle,
  updateThinkingStyle,
  deleteThinkingStyle,
  restoreThinkingStyle,
  bulkUpdateThinkingStyles,
  type GetAllThinkingStylesParams,
  type CreateThinkingStylePayload,
  type UpdateThinkingStylePayload,
  type BulkUpdatePayload
} from '@/services/api/thinkingStylesAdmin';

// Query Keys
export const thinkingStylesKeys = {
  all: ['thinking-styles'] as const,
  lists: () => [...thinkingStylesKeys.all, 'list'] as const,
  list: (params: GetAllThinkingStylesParams) => [...thinkingStylesKeys.lists(), params] as const,
  details: () => [...thinkingStylesKeys.all, 'detail'] as const,
  detail: (id: number) => [...thinkingStylesKeys.details(), id] as const,
  stats: () => [...thinkingStylesKeys.all, 'stats'] as const,
};

// Get All Thinking Styles
export const useGetAllThinkingStyles = (params: GetAllThinkingStylesParams = {}) => {
  return useQuery({
    queryKey: thinkingStylesKeys.list(params),
    queryFn: () => getAllThinkingStyles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Thinking Style by ID
export const useGetThinkingStyleById = (id: number) => {
  return useQuery({
    queryKey: thinkingStylesKeys.detail(id),
    queryFn: () => getThinkingStyleById(id),
    enabled: !!id,
  });
};

// Get Thinking Style Statistics
export const useGetThinkingStyleStats = () => {
  return useQuery({
    queryKey: thinkingStylesKeys.stats(),
    queryFn: getThinkingStyleStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Create Thinking Style
export const useCreateThinkingStyle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateThinkingStylePayload) => createThinkingStyle(payload),
    onSuccess: (data) => {
      toast.success(data.message || 'Thinking style berhasil dibuat');
      queryClient.invalidateQueries({ queryKey: thinkingStylesKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat thinking style');
    },
  });
};

// Update Thinking Style
export const useUpdateThinkingStyle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateThinkingStylePayload }) => 
      updateThinkingStyle(id, payload),
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Thinking style berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: thinkingStylesKeys.all });
      queryClient.invalidateQueries({ queryKey: thinkingStylesKeys.detail(variables.id) });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui thinking style');
    },
  });
};

// Delete Thinking Style
export const useDeleteThinkingStyle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteThinkingStyle(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Thinking style berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: thinkingStylesKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus thinking style');
    },
  });
};

// Restore Thinking Style
export const useRestoreThinkingStyle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => restoreThinkingStyle(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Thinking style berhasil dipulihkan');
      queryClient.invalidateQueries({ queryKey: thinkingStylesKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memulihkan thinking style');
    },
  });
};

// Bulk Update Thinking Styles
export const useBulkUpdateThinkingStyles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkUpdatePayload) => bulkUpdateThinkingStyles(payload),
    onSuccess: (data) => {
      toast.success(data.message || 'Thinking styles berhasil diperbarui secara massal');
      queryClient.invalidateQueries({ queryKey: thinkingStylesKeys.all });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui thinking styles secara massal');
    },
  });
};