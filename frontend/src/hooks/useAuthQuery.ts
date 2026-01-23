import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe } from '../services/api'; 
import { AffiliatorRegisterPayload, CreateUserPayload, LoginPayload } from '../services/api/types';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthProvider';

// Key untuk query cache
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// Hook untuk login
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { loginUser } = useAuth();  
  return useMutation({
    mutationFn: (credentials: LoginPayload) => loginUser(credentials.email, credentials.password),
    onSuccess: () => {
      // Invalidate dan refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success("Login berhasil");
    },
  });
};

// Hook untuk registrasi user - menggunakan AuthProvider untuk auto-login
export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  const { register } = useAuth();
  
  return useMutation({
    mutationFn: async (userData: CreateUserPayload) => {
      // Menggunakan AuthProvider register yang sudah ada auto-login
      await register(
        userData.email,
        userData.password,
        'user',
        {
          username: userData.username,
          fullname: userData.fullname,
          address: userData.address,
          phoneNumber: userData.phoneNumber,
          mitraId: userData.mitraId,
        }
      );
    },
    onSuccess: () => {
      // Invalidate dan refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success("Registrasi berhasil! Anda telah login otomatis.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registrasi gagal");
    },
  });
};

// Hook untuk registrasi affiliator - menggunakan AuthProvider untuk auto-login
export const useRegisterAffiliator = () => {
  const queryClient = useQueryClient();
  const { register } = useAuth();
  
  return useMutation({
    mutationFn: async (userData: AffiliatorRegisterPayload) => {
      // Menggunakan AuthProvider register yang sudah ada auto-login
      await register(
        userData.email,
        userData.password,
        'affiliator',
        {
          username: userData.username,
          fullname: userData.fullname,
          address: userData.address,
          phoneNumber: userData.phoneNumber,
          bankAccountName: userData.bankAccountName,
          bankAccountNumber: userData.bankAccountNumber,
          bankName: userData.bankName,
        }
      );
    },
    onSuccess: () => {
      // Invalidate dan refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success("Registrasi affiliator berhasil! Anda telah login otomatis.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Registrasi affiliator gagal");
    },
  });
};

export const useMeQuery = () => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => getMe(),
  });
}
