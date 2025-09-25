import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook untuk mengelola cache React Query
 * Berguna untuk invalidasi cache saat logout/login atau perubahan role
 */
export const useCacheManager = () => {
  const queryClient = useQueryClient();

  /**
   * Clear semua cache - digunakan saat logout atau login dengan role berbeda
   */
  const clearAllCache = () => {
    queryClient.clear();
  };

  /**
   * Invalidate cache berdasarkan key pattern
   */
  const invalidateQueries = (queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey });
  };

  /**
   * Invalidate cache untuk data user-specific
   */
  const invalidateUserData = () => {
    // Invalidate semua query yang berkaitan dengan user data
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['tests'] });
    queryClient.invalidateQueries({ queryKey: ['packages'] });
    queryClient.invalidateQueries({ queryKey: ['vouchers'] });
    queryClient.invalidateQueries({ queryKey: ['withdraws'] });
    queryClient.invalidateQueries({ queryKey: ['affiliates'] });
  };

  /**
   * Invalidate cache untuk data admin-specific
   */
  const invalidateAdminData = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['invoices', 'admin'] });
    queryClient.invalidateQueries({ queryKey: ['tests', 'admin'] });
    queryClient.invalidateQueries({ queryKey: ['packages', 'admin'] });
    queryClient.invalidateQueries({ queryKey: ['vouchers', 'admin'] });
    queryClient.invalidateQueries({ queryKey: ['withdraws', 'admin'] });
  };

  /**
   * Refresh cache dengan notifikasi
   */
  const refreshCache = (message = 'Data refreshed successfully') => {
    queryClient.invalidateQueries();
    toast.success(message);
  };

  /**
   * Reset cache untuk role switching
   * Membersihkan cache dan mempersiapkan untuk role baru
   */
  const resetCacheForRoleSwitch = (newRole?: string) => {
    clearAllCache();
    
    if (newRole) {
      // Pre-warm cache untuk role baru jika diperlukan
      // Bisa ditambahkan prefetch queries di sini
    }
  };

  return {
    clearAllCache,
    invalidateQueries,
    invalidateUserData,
    invalidateAdminData,
    refreshCache,
    resetCacheForRoleSwitch,
  };
};