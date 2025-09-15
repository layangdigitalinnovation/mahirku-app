import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {  registerUser, registerAffiliator, getMe } from '../services/api'; 
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
      toast.success("Login successful");
    },
  });
};

// Hook untuk registrasi user
export const useRegisterUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: CreateUserPayload) => registerUser(userData),
    onSuccess: () => {
      // Invalidate dan refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success("User registered successfully");
    },
  });
};

// Hook untuk registrasi affiliator
export const useRegisterAffiliator = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: AffiliatorRegisterPayload) => registerAffiliator(userData),
    onSuccess: () => {
      // Invalidate dan refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      toast.success("Affiliator registered successfully");
    },
  });
};

export const useMeQuery = () => {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => getMe(),
  });
}
