/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useUsers, useCreateUser } from '../../hooks/useUsers';
import { CreateUserPayload } from '../../services/api/types';

export const UsersList: React.FC = () => {
  // Menggunakan custom hook untuk mendapatkan data users
  const { data: users, isLoading, error } = useUsers();
  
  // Menggunakan custom hook untuk membuat user baru
  const createUserMutation = useCreateUser();

  // Contoh fungsi untuk menangani submit form
  const handleCreateUser = (userData: CreateUserPayload) => {
    createUserMutation.mutate(userData);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <div>
      <h2>Users List</h2>
      {/* Contoh penggunaan data */}
      <ul>
        {users?.map((user: any) => (
          <li key={user.id}>{user.username} - {user.email}</li>
        ))}
      </ul>

      {/* Status mutasi */}
      {createUserMutation.isPending && <div>Creating user...</div>}
      {createUserMutation.isError && (
        <div>Error: {(createUserMutation.error as Error).message}</div>
      )}
      {createUserMutation.isSuccess && <div>User created successfully!</div>}

      {/* Contoh button untuk trigger mutasi */}
      <button
        onClick={() => {
          // Contoh data untuk membuat user baru
          const newUser: CreateUserPayload = {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password123',
            fullname: 'New User',
            phoneNumber: '08123456789',
            address: 'Jakarta',
            roleId: 3, // user role
          };
          handleCreateUser(newUser);
        }}
        disabled={createUserMutation.isPending}
      >
        Create New User
      </button>
    </div>
  );
};