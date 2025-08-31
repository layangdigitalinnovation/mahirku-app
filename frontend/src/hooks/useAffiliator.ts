// src/hooks/useAffiliate.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReferralLink,
  addCommission,
  fetchAffiliateStats,
  fetchAffiliateBalanceDetail,
  fetchCommissionBreakdown,
} from "@/services/api";
import { toast } from "sonner";


 const affiliateKeys = {
  all: ["affiliate"] as const,
  referralLink: () => [...affiliateKeys.all, "referral-link"] as const,
  stats: () => [...affiliateKeys.all, "stats"] as const,
  balance: () => [...affiliateKeys.all, "balance"] as const,
  commissionBreakdown: () => [...affiliateKeys.all, "commission-breakdown"] as const,
};
// Referral Link
export const useReferralLink = () =>
  useQuery({
    queryKey: affiliateKeys.referralLink(),
    queryFn: getReferralLink,
  });

// Add Commission (mutation)
export const useAddCommission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCommission,
    onSuccess: () => {
      toast.success("Commission added successfully");
      queryClient.invalidateQueries({ queryKey: affiliateKeys.stats() });
      queryClient.invalidateQueries({ queryKey: affiliateKeys.balance() });
      queryClient.invalidateQueries({ queryKey: affiliateKeys.commissionBreakdown() });
    },
  });
};

// Stats
export const useAffiliateStats = () =>
  useQuery({
    queryKey: affiliateKeys.stats(),
    queryFn: fetchAffiliateStats,
  });

// Balance
export const useAffiliateBalanceDetail = () =>
  useQuery({
    queryKey: affiliateKeys.balance(),
    queryFn: fetchAffiliateBalanceDetail,
  });

// Commission Breakdown
export const useCommissionBreakdown = () =>
  useQuery({
    queryKey: affiliateKeys.commissionBreakdown(),
    queryFn: fetchCommissionBreakdown,
  });
