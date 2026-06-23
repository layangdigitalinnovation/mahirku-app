import { useQuery } from '@tanstack/react-query';
import { getThinkingStyleAiReport, getDiscAiReport, getGraphologyAiReport } from '@/services/api/aiReports';

export const useThinkingStyleAiReport = (resultId: number | undefined) => {
  return useQuery({
    queryKey: ['cst-ai-report', resultId],
    queryFn: () => getThinkingStyleAiReport(resultId!),
    enabled: !!resultId,
    refetchInterval: (query) => {
      // Polling if status is processing/pending
      const data = query.state?.data;
      if (data?.status === 'processing' || data?.status === 'pending') {
        return 3000;
      }
      return false;
    },
  });
};

export const useDiscAiReport = (resultId: number | undefined) => {
  return useQuery({
    queryKey: ['disc-ai-report', resultId],
    queryFn: () => getDiscAiReport(resultId!),
    enabled: !!resultId,
    refetchInterval: (query) => {
      const data = query.state?.data;
      if (data?.status === 'processing' || data?.status === 'pending') {
        return 3000;
      }
      return false;
    },
  });
};

export const useGraphologyAiReport = (resultId: number | undefined) => {
  return useQuery({
    queryKey: ['graphology-ai-report', resultId],
    queryFn: () => getGraphologyAiReport(resultId!),
    enabled: !!resultId,
    refetchInterval: (query) => {
      const data = query.state?.data;
      if (data?.status === 'processing' || data?.status === 'pending') {
        return 3000;
      }
      return false;
    },
  });
};
