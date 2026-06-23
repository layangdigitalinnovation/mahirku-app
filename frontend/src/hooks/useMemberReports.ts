import { useQuery } from '@tanstack/react-query';
import { getMemberReports } from '@/services/api/users';

export const memberReportKeys = {
  all: ['memberReports'] as const,
};

export const useMemberReports = () => {
  return useQuery({
    queryKey: memberReportKeys.all,
    queryFn: getMemberReports,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
