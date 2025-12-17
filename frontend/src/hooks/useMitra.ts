import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMitraDashboardStats, getMitraMembers, addMitraMember } from "@/services/api";

export const useMitraStats = () => {
  return useQuery({
    queryKey: ["mitra-stats"],
    queryFn: getMitraDashboardStats,
  });
};

export const useMitraMembers = () => {
  return useQuery({
    queryKey: ["mitra-members"],
    queryFn: getMitraMembers,
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
