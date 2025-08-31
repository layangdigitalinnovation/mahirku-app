import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPackages,
  addPackage,
  updatePackage,
  deletePackage,
} from "../services/api";
import {
  PackagePayload,
} from "../services/api/types";
import { toast } from "sonner";

// Key untuk query cache
export const packagesKeys = {
  all: ["packages"] as const,
  lists: () => [...packagesKeys.all, "list"] as const,
  list: (filters?: string) => [...packagesKeys.lists(), { filters }] as const,
  details: () => [...packagesKeys.all, "detail"] as const,
  detail: (id: number) => [...packagesKeys.details(), id] as const,
};

// Hook untuk mendapatkan semua packages
export const usePackages = () => {
  return useQuery({
    queryKey: packagesKeys.lists(),
    queryFn: getPackages,
  });
};

// Hook untuk membuat package baru
export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPackage: PackagePayload) => addPackage(newPackage),
    onSuccess: () => {
        toast.success("Package added successfully");
      queryClient.invalidateQueries({ queryKey: packagesKeys.lists() });
    },
  });
};

// Hook untuk update package
export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PackagePayload }) =>
      updatePackage(id, data),
    onSuccess: (_, { id }) => {
        toast.success("Package updated successfully");
      queryClient.invalidateQueries({ queryKey: packagesKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: packagesKeys.lists() });
    },
  });
};

// Hook untuk delete package
export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packagesKeys.lists() });
    },
  });
};
