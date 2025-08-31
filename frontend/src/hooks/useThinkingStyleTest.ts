// hooks/useTest.ts
import { getAllThinkingStyleTest, submitThinkingStyleTest, ThinkingStyleRequest } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";


export const testKeys = {
  all: ["tests"] as const,
  lists: () => [...testKeys.all, "list"] as const,
  details: () => [...testKeys.all, "detail"] as const,
  detail: (id: number) => [...testKeys.details(), id] as const,
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
        queryKey : testKeys.all,
        queryFn : getAllThinkingStyleTest
    })
}
