// src/hooks/useAffiliate.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReferralLink,
  addCommission,
  fetchAffiliateStats,
  fetchAffiliateBalanceDetail,
  fetchCommissionBreakdown,
  checkMitraEligibility,
  upgradeToMitra
} from "@/services/api";
import { toast } from "sonner";


 const affiliateKeys = {
  all: ["affiliate"] as const,
  referralLink: () => [...affiliateKeys.all, "referral-link"] as const,
  stats: () => [...affiliateKeys.all, "stats"] as const,
  balance: () => [...affiliateKeys.all, "balance"] as const,
  commissionBreakdown: () => [...affiliateKeys.all, "commission-breakdown"] as const,
  mitraEligibility: () => [...affiliateKeys.all, "mitra-eligibility"] as const,
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

// Mitra Eligibility
export const useCheckMitraEligibility = () =>
  useQuery({
    queryKey: affiliateKeys.mitraEligibility(),
    queryFn: checkMitraEligibility,
  });

// Upgrade to Mitra Mutation
export const useUpgradeToMitra = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upgradeToMitra,
    onSuccess: (data) => {
      toast.success(data.message || "Upgrade ke Mitra berhasil!");
      queryClient.invalidateQueries({ queryKey: affiliateKeys.mitraEligibility() });
      // Reload page to reflect role change (or handle in AuthProvider)
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal upgrade ke Mitra");
    },
  });
};
