import { addChildUser, getUserChilds, purchaseToken, transferTokenToChild } from "@/services/api/tokenTransfer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authKeys, useMeQuery } from "./useAuthQuery";

export const tokenKeys = {
  all: ['token'] as const,
  children: () => [...tokenKeys.all, 'children'] as const,
  child: (id: number) => [...tokenKeys.children(), id] as const,
  transfer: () => [...tokenKeys.all, 'transfer'] as const,
  purchase: () => [...tokenKeys.all, 'purchase'] as const,
  addChild: () => [...tokenKeys.all, 'add-child'] as const,
}

export const usePurchaseToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseToken,
    onSuccess: (data) => {
      // Invalidate auth/me query to refresh user token balance
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success("Token purchase initiated successfully");
      return data;
    },
  });
}

export const useAddChildUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addChildUser,
    onSuccess: () => {
      toast.success("Child user added successfully");
      queryClient.invalidateQueries({ queryKey: tokenKeys.children() });
      // Also invalidate auth/me to refresh parent user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

export const useTransferTokenToChild = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: transferTokenToChild,
    onSuccess: () => {
      toast.success("Token transferred successfully");
      // Invalidate auth/me to refresh parent token balance
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      // Invalidate children list to refresh child token balances
      queryClient.invalidateQueries({ queryKey: tokenKeys.children() });
    },
  });
}       

export const useGetAllChildUser = () => {
  return useQuery({
    queryKey: tokenKeys.children(),
    queryFn: getUserChilds,
    staleTime: 0,
  });
}

// Hook to get current user token balance from auth/me
export const useUserTokenBalance = () => {
  const { data: meData, isLoading, error } = useMeQuery();
  
  return {
    tokenBalance: meData?.user?.tokens || 0,
    isLoading,
    error,
    user: meData?.user
  };
}

