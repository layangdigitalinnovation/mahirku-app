import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, createUser } from '../services/api';
import { CreateUserPayload } from '../services/api/types';

// Key untuk query cache
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (filters: string) => [...usersKeys.lists(), { filters }] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: number) => [...usersKeys.details(), id] as const,
};

// Hook untuk mendapatkan semua users
export const useUsers = () => {
  return useQuery({
    queryKey: usersKeys.lists(),
    queryFn: getAllUsers,
  });
};

// Hook untuk membuat user baru
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newUser: CreateUserPayload) => createUser(newUser),
    onSuccess: () => {
      // Invalidate dan refetch
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};