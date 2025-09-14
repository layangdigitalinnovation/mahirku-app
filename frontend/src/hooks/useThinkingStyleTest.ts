// hooks/useTest.ts
import { 
  downloadPDFTest, 
  getAllThinkingStyleTest, 
  submitThinkingStyleTest, 
  ThinkingStyleRequest 
} from "@/services/api";
import { getAllCountThinkingStyleTest } from "@/services/api/thinkingStylesAdmin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const testKeys = {
  all: ["tests"] as const,
  lists: () => [...testKeys.all, "list"] as const,
  details: () => [...testKeys.all, "detail"] as const,
  detail: (id: number) => [...testKeys.details(), id] as const,
  download: (id: number) => [...testKeys.all, "download", id] as const,
};

// Hook untuk submit test
export const useSubmitTest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ThinkingStyleRequest) => submitThinkingStyleTest(payload),
    onSuccess: (data) => {
      toast.success("Test submitted successfully");
      // invalidate jika ada data test list/detail
      queryClient.invalidateQueries({ queryKey: testKeys.lists() });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: testKeys.detail(data.id) });
      }
    },
    onError: () => {
      toast.error("Failed to submit test");
    },
  });
};

export const useGetAllTest = () => {
  return useQuery({
    queryKey: testKeys.all,
    queryFn: getAllThinkingStyleTest,
  });
};

export const useGetAllCountTest = () => {
  return useQuery({
    queryKey: testKeys.all,
    queryFn: getAllCountThinkingStyleTest,
  });
};

// ✅ Perbaikan: terima id sebagai parameter
export const useDownloadPDFTest = (id: number) => {
  return useQuery({
    queryKey: testKeys.download(id),
    queryFn: () => downloadPDFTest(id),
    enabled: !!id, // hanya jalan kalau id ada
  });
};
