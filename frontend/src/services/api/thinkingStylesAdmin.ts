import api from '@/utils/axios';

// Interfaces
export interface ThinkingStyle {
  id: number;
  digit: number;
  type: string;
  code: string;
  description: string;
  theory: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ThinkingStyleStatistics {
  summary: {
    total: number;
    active: number;
    inactive: number;
  };
  styles: ThinkingStyle[];
}

export interface CreateThinkingStylePayload {
  digit: number;
  type: string;
  code: string;
  description: string;
  theory: string;
  isActive: boolean;
}

export interface UpdateThinkingStylePayload {
  id?: number;
  digit?: number;
  type?: string;
  code?: string;
  description?: string;
  theory?: string;
  isActive?: boolean;
}

export interface BulkUpdatePayload {
  updates: UpdateThinkingStylePayload[];
}

export interface GetAllThinkingStylesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface ThinkingStylesResponse {
  message: string;
  data: {
    thinkingStyles: ThinkingStyle[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

// API Functions
export const getAllThinkingStyles = async (params: GetAllThinkingStylesParams = {}): Promise<ThinkingStylesResponse> => {
  const { page = 1, limit = 10, search = '', isActive } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
    ...(isActive !== undefined && { isActive: isActive.toString() })
  });
  
  const response = await api.get(`/admin/thinking-styles?${queryParams}`);
  return response.data;
};

export const getThinkingStyleById = async (id: number): Promise<{ message: string; data: ThinkingStyle }> => {
  const response = await api.get(`/admin/thinking-styles/${id}`);
  return response.data;
};

export const getThinkingStyleStats = async (): Promise<{ message: string; data: ThinkingStyleStatistics }> => {
  const response = await api.get('/admin/thinking-styles/stats');
  return response.data;
};

export const createThinkingStyle = async (payload: CreateThinkingStylePayload): Promise<{ message: string; data: ThinkingStyle }> => {
  const response = await api.post('/admin/thinking-styles', payload);
  return response.data;
};

export const updateThinkingStyle = async (id: number, payload: UpdateThinkingStylePayload): Promise<{ message: string; data: ThinkingStyle }> => {
  const response = await api.put(`/admin/thinking-styles/${id}`, payload);
  return response.data;
};

export const deleteThinkingStyle = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete(`/admin/thinking-styles/${id}`);
  return response.data;
};

export const restoreThinkingStyle = async (id: number): Promise<{ message: string; data: ThinkingStyle }> => {
  const response = await api.patch(`/admin/thinking-styles/${id}/restore`);
  return response.data;
};

export const bulkUpdateThinkingStyles = async (payload: BulkUpdatePayload): Promise<{ message: string; data: ThinkingStyle[] }> => {
  const response = await api.post('/admin/thinking-styles/bulk-update', payload);
  return response.data;
};