import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllVoucher,
  createVoucher,
  deleteVoucher,
  validateVoucher
} from "@/services/api";
import {
    VoucherPayload
} from "@/services/api/types";
import { toast } from "sonner";

export const voucherKeys = {
  all: ["vouchers"] as const,
  lists: () => [...voucherKeys.all, "list"] as const,
  list: (filters?: string) => [...voucherKeys.lists(), { filters }] as const,
  details: () => [...voucherKeys.all, "detail"] as const,
  detail: (id: number) => [...voucherKeys.details(), id] as const,
};

// Get All
export const useVouchers = () =>
  useQuery({
    queryKey: voucherKeys.lists(),
    queryFn: getAllVoucher,
  });

// Create
export const useCreateVoucher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VoucherPayload) => createVoucher(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: voucherKeys.lists() });
      toast.success("Voucher created successfully");
    },
  });
};

// Delete
export const useDeleteVoucher = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteVoucher(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: voucherKeys.lists() });
      toast.success("Voucher deleted successfully");
    },
  });
};

export const useValidateVoucher = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (code: string) => validateVoucher(code),
        onSuccess: (data) => {
            qc.invalidateQueries({ queryKey: voucherKeys.lists() });
            return data
        }
    })
}