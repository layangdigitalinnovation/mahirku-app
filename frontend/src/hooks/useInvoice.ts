import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllInvoicesAdmin,
  getAllInvoicesCustomer,
} from "../services/api";
import { toast } from "sonner";

// Key untuk query cache
export const invoicesKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoicesKeys.all, "list"] as const,
  admin: () => [...invoicesKeys.lists(), "admin"] as const,
  customer: () => [...invoicesKeys.lists(), "customer"] as const,
  adminList: (filters?: InvoiceFilters) => [...invoicesKeys.admin(), { filters }] as const,
  customerList: (filters?: InvoiceFilters) => [...invoicesKeys.customer(), { filters }] as const,
  details: () => [...invoicesKeys.all, "detail"] as const,
  detail: (id: number) => [...invoicesKeys.details(), id] as const,
};

// Types untuk filters dan response
export interface InvoiceFilters {
  status?: "PENDING" | "COMPLETED" | "EXPIRED" | "ALL";
  search?: string;
  page?: number;
}

export interface InvoiceResponse {
  success: boolean;
  message: string;
  data: {
    transactions: Invoice[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
    summary?: {
      totalSpent: number;
      totalTokensPurchased: number;
      currentTokens: number;
      pendingTransactions: number;
      lastPurchaseDate: string | null;
    };
    analytics?: {
      totalRevenue: number;
      totalTransactions: number;
      averageTransactionValue: number;
      statusBreakdown: {
        pending: number;
        completed: number;
        failed: number;
        cancelled: number;
      };
    };
  };
}

export interface Invoice {
  id: number;
  tokenAmount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED";
  totalAmount: number;
  finalAmount: number;
  discountAmount: number;
  paymentMethod: string | null;
  createdAt: string;
  paymentDate: string | null;
  invoiceNumber: string;
  xenditInvoiceId: string;
  user?: {
    id: number;
    username: string;
    email: string;
    fullname: string;
  };
  package: {
    name: string;
    description: string;
    price: number;
  };
  voucher: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
  } | null;
}

// ===================================================================
// ADMIN HOOKS
// ===================================================================

// Hook untuk mendapatkan semua invoices (Admin)
export const useInvoicesAdmin = (filters?: InvoiceFilters, options?: {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: invoicesKeys.adminList(filters),
    queryFn: () => getAllInvoicesAdmin(),
    enabled: options?.enabled ?? true,
    refetchInterval: options?.refetchInterval,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 menit
  });
};


// ===================================================================
// CUSTOMER HOOKS  
// ===================================================================

// Hook untuk mendapatkan invoices customer/user
export const useInvoicesCustomer = (filters?: InvoiceFilters, options?: {
  enabled?: boolean;
  // refetchOnWindowFocus?: boolean;
}) => {
  return useQuery({
    queryKey: invoicesKeys.customerList(filters),
    queryFn: () => getAllInvoicesCustomer(),
    enabled: options?.enabled ?? true,
    // refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
    staleTime: 2 * 60 * 1000, // 2 menit
    // retry: 2,
  });
};
// ===================================================================
// UTILITY HOOKS
// ===================================================================

// Hook untuk prefetch invoices (berguna untuk optimistic loading)
export const usePrefetchInvoices = () => {
  const queryClient = useQueryClient();

  const prefetchAdminInvoices = (filters?: InvoiceFilters) => {
    queryClient.prefetchQuery({
      queryKey: invoicesKeys.adminList(filters),
      queryFn: () => getAllInvoicesAdmin(),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchCustomerInvoices = (filters?: InvoiceFilters) => {
    queryClient.prefetchQuery({
      queryKey: invoicesKeys.customerList(filters),
      queryFn: () => getAllInvoicesCustomer(),
      staleTime: 2 * 60 * 1000,
    });
  };

  return {
    prefetchAdminInvoices,
    prefetchCustomerInvoices,
  };
};

// Hook untuk invalidate/refresh invoice cache
export const useInvoiceCache = () => {
  const queryClient = useQueryClient();

  const invalidateAdminInvoices = () => {
    queryClient.invalidateQueries({ queryKey: invoicesKeys.admin() });
    toast.success("Invoice data refreshed");
  };

  const invalidateCustomerInvoices = () => {
    queryClient.invalidateQueries({ queryKey: invoicesKeys.customer() });
    toast.success("Your invoices refreshed");
  };

  const invalidateAllInvoices = () => {
    queryClient.invalidateQueries({ queryKey: invoicesKeys.all });
    toast.success("All invoice data refreshed");
  };

  return {
    invalidateAdminInvoices,
    invalidateCustomerInvoices,
    invalidateAllInvoices,
  };
};