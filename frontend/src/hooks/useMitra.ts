import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMitraDashboardStats, getMitraMembers, addMitraMember, promoteMemberToAffiliator } from "@/services/api";
import { toast } from "sonner";

export const useMitraStats = () => {
  return useQuery({
    queryKey: ["mitra-stats"],
    queryFn: getMitraDashboardStats,
  });
};

export const useMitraMembers = (params?: { page?: number; limit?: number; search?: string }) => {
  return useQuery({
    queryKey: ["mitra-members", params],
    queryFn: () => getMitraMembers(params),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
  });
};

export const useAddMitraMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addMitraMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitra-members"] });
      queryClient.invalidateQueries({ queryKey: ["mitra-stats"] });
    },
  });
};

export const usePromoteMemberToAffiliator = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => promoteMemberToAffiliator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitra-members"] });
      queryClient.invalidateQueries({ queryKey: ["mitra-stats"] });
      toast.success("Anggota berhasil dijadikan affiliator");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal mempromosikan anggota");
    }
  });
};
