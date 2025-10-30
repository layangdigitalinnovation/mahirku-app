import { useQuery } from '@tanstack/react-query';
import api from '@/utils/axios';

interface DashboardOverview {
  totalUsers: number;
  totalTests: number;
  totalRevenue: number;
  totalTokensSold: number;
  totalPurchases: number;
}

interface UsersByRole {
  role: string;
  count: number;
}

interface PackageStats {
  [packageName: string]: {
    packageName: string;
    count: number;
    revenue: number;
    tokens: number;
  };
}

interface MonthlyData {
  month: string;
  users: number;
  tests: number;
  revenue: number;
}

interface WithdrawStats {
  status: string;
  count: string;
  totalAmount: string;
}

interface DashboardStatistics {
  overview: DashboardOverview;
  usersByRole: UsersByRole[];
  packageStats: PackageStats;
  monthlyData: MonthlyData[];
  withdrawStats: WithdrawStats[];
}

interface RealtimeStats {
  todayUsers: number;
  todayTests: number;
  todayRevenue: number;
  pendingWithdraws: number;
}

interface DashboardResponse {
  success: boolean;
  data: DashboardStatistics;
}

interface RealtimeResponse {
  success: boolean;
  data: RealtimeStats;
}

// Hook untuk mendapatkan statistik dashboard lengkap
export const useDashboardStatistics = (startDate?: string, endDate?: string) => {
  return useQuery<DashboardResponse>({
    queryKey: ['dashboard-statistics', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/dashboard/statistics?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Hook untuk mendapatkan statistik real-time
export const useRealtimeStats = () => {
  return useQuery<RealtimeResponse>({
    queryKey: ['dashboard-realtime'],
    queryFn: async () => {
      const response = await api.get('/dashboard/realtime');
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export type {
  DashboardStatistics,
  DashboardOverview,
  UsersByRole,
  PackageStats,
  MonthlyData,
  WithdrawStats,
  RealtimeStats
};