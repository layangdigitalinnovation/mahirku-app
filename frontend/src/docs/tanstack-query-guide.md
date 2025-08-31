# Panduan Penggunaan TanStack Query

## Pengenalan

TanStack Query (sebelumnya dikenal sebagai React Query) adalah library untuk mengelola state server dan fetching data di React. Library ini menyediakan hooks untuk fetching, caching, synchronizing, dan updating data server di aplikasi React.

## Keuntungan Menggunakan TanStack Query

- **Caching otomatis** - Hasil query di-cache secara otomatis
- **Deduplication request** - Request yang sama tidak akan dijalankan berulang kali
- **Background fetching** - Data dapat di-refresh di background
- **Stale data handling** - Data yang sudah usang (stale) dapat dikonfigurasi
- **Pagination & infinite scrolling** - Dukungan untuk pagination dan infinite scrolling
- **Prefetching** - Data dapat di-prefetch sebelum dibutuhkan
- **Mutations** - Dukungan untuk update, create, dan delete data
- **Devtools** - Alat pengembangan untuk debugging

## Struktur Proyek

```
src/
├── components/
│   ├── QueryProvider.tsx       # Provider untuk TanStack Query
│   └── examples/               # Contoh komponen yang menggunakan TanStack Query
│       ├── LoginForm.tsx      # Contoh form login dengan TanStack Query
│       └── UsersList.tsx      # Contoh daftar users dengan TanStack Query
├── hooks/
│   ├── useAuthQuery.ts        # Custom hooks untuk autentikasi
│   └── useUsers.ts            # Custom hooks untuk manajemen users
└── services/
    └── api/                   # API services
```

## Cara Penggunaan

### 1. Setup Provider

Provider sudah disetup di `main.tsx` dengan konfigurasi default yang sesuai untuk sebagian besar kasus penggunaan. Provider juga sudah termasuk React Query DevTools yang dapat diakses di pojok kanan bawah aplikasi saat mode development.

### 2. Membuat Custom Hooks

Buat custom hooks untuk setiap domain atau fitur. Contoh:

```typescript
// useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, createUser } from '../services/api';

// Key untuk query cache
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
};

// Hook untuk mendapatkan semua users
export const useUsers = () => {
  return useQuery({
    queryKey: usersKeys.lists(),
    queryFn: getAllUsers,
  });
};
```

### 3. Menggunakan Hooks di Komponen

```tsx
import { useUsers } from '../hooks/useUsers';

function UsersList() {
  const { data, isLoading, error } = useUsers();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 4. Mutations (Create, Update, Delete)

```typescript
// Hook untuk membuat user baru
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newUser) => createUser(newUser),
    onSuccess: () => {
      // Invalidate dan refetch
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};
```

Di komponen:

```tsx
function CreateUserForm() {
  const createUserMutation = useCreateUser();
  
  const handleSubmit = (userData) => {
    createUserMutation.mutate(userData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={createUserMutation.isPending}>
        {createUserMutation.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

## Best Practices

1. **Gunakan Query Keys yang Terstruktur** - Buat struktur query keys yang konsisten untuk memudahkan invalidasi cache

2. **Pisahkan Queries dan Mutations** - Buat custom hooks terpisah untuk queries dan mutations

3. **Gunakan Prefetching untuk UX yang Lebih Baik** - Prefetch data sebelum user membutuhkannya

4. **Kelola Stale Time dengan Bijak** - Sesuaikan stale time berdasarkan kebutuhan data

5. **Gunakan Devtools untuk Debugging** - DevTools sudah diaktifkan di development mode

## Menggunakan React Query DevTools

React Query DevTools sudah terintegrasi dalam aplikasi dan dapat diakses di pojok kanan bawah aplikasi saat mode development. DevTools ini menyediakan beberapa fitur yang berguna:

1. **Query Explorer** - Melihat semua query yang aktif dan statusnya
2. **Query Details** - Melihat detail dari setiap query, termasuk data, status, dan waktu
3. **Query Refetching** - Memicu refetch query secara manual
4. **Query Invalidation** - Menginvalidasi query secara manual
5. **Query Reset** - Mereset query ke status awal

Untuk menggunakan DevTools:
1. Klik ikon React Query di pojok kanan bawah aplikasi
2. Panel DevTools akan terbuka dan menampilkan semua query aktif
3. Klik pada query untuk melihat detailnya
4. Gunakan tombol di panel untuk memicu aksi seperti refetch atau invalidate

## Referensi

- [Dokumentasi Resmi TanStack Query](https://tanstack.com/query/latest)
- [Contoh Kode di Proyek Ini](../components/examples)