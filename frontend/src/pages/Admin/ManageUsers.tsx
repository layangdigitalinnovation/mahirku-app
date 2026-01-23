import { DataTable } from "@/components/table/DataTable";
import { columns } from "@/components/table/columns/userColumn";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Filter, X, UserPlus, Trash2, Edit, ShieldCheck, Banknote, Handshake, UserCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RoleName, User } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UserForm, { UserFormValues } from "@/components/form/UserForm";
import { createUser, updateUser, deleteUser } from "@/services/api/users";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const { data, isLoading, isError, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const queryClient = useQueryClient();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: UserFormValues) => {
      // Ensure password is required for create
      if (!payload.password) {
        throw new Error('Password is required');
      }
      return createUser({ ...payload, password: payload.password });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User berhasil ditambahkan");
      setIsAddDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menambahkan user");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UserFormValues> }) =>
      updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User berhasil diupdate");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal mengupdate user");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success("User berhasil dihapus");
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal menghapus user");
    },
  });

  // Handlers
  const handleAddUser = (values: UserFormValues) => {
    createMutation.mutate(values);
  };

  const handleEditUser = (values: UserFormValues) => {
    if (selectedUser) {
      // Remove password if it's empty (user doesn't want to change it)
      const payload = values.password ? values : { ...values, password: undefined };
      updateMutation.mutate({ id: selectedUser.id, payload });
    }
  };

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const handleDeleteUser = () => {
    if (selectedUser) {
      if (currentUser?.id === selectedUser.id) {
        toast.error("Anda tidak dapat menghapus akun sendiri");
        return;
      }
      deleteMutation.mutate(selectedUser.id);
    }
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Get unique roles from data
  const roles = useMemo(() => {
    if (!data) return [];
    const uniqueRoles = Array.from(new Set(data.map((user: User) => user.role.name)));
    return uniqueRoles;
  }, [data]);

  // Count users by role
  const roleStats = useMemo(() => {
    if (!data) return {};
    const stats: Record<string, number> = {};

    data.forEach((user: User) => {
      const roleName = user.role.name;
      stats[roleName] = (stats[roleName] || 0) + 1;
    });

    return stats;
  }, [data]);

  // Filter and search data
  const filteredData = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter((user: User) => user.role.name === selectedRole);
    }

    // Search by name, email, username, or other relevant fields
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((user: User) => {
        return (
          user.fullname?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.username?.toLowerCase().includes(term) ||
          user.role.name?.toLowerCase().includes(term) ||
          user.address?.toLowerCase().includes(term) ||
          user.phoneNumber?.toLowerCase().includes(term)
        );
      });
    }

    return filtered;
  }, [data, selectedRole, searchTerm]);

  // Enhanced columns with actions
  const enhancedColumns: ColumnDef<User>[] = useMemo(
    () => [
      ...(columns as ColumnDef<User>[]),
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(user)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openDeleteDialog(user)}
                disabled={currentUser?.id === user.id}
                className={currentUser?.id === user.id ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Hapus
              </Button>
            </div>
          );
        },
      },
    ],
    [columns, currentUser]
  );

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRole("all");
  };

  const hasActiveFilters = searchTerm !== "" || selectedRole !== "all";

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Table Skeleton */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-2">
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Kesalahan</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Gagal memuat pengguna."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Tidak ada pengguna ditemukan</p>
        <p className="text-sm text-gray-400">Belum ada pengguna yang terdaftar dalam sistem.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto px-10 sm:px-10 lg:px-12">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Pengguna</h1>
          <p className="text-sm text-gray-500">Kelola pengguna sistem</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Tambah User
        </Button>
      </div>

      {/* Role Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Users Card */}
        <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-white hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Pengguna</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-800">{data.length}</span>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {roles.map((role: any) => {
          const roleNameStr = role as string;
          let style = {
            bg: "bg-white",
            border: "border-gray-200",
            text: "text-gray-600",
            icon: Users,
            iconBg: "bg-gray-100",
            label: roleNameStr
          };

          if (role === RoleName.SUPER_ADMIN) {
            style = {
              bg: "bg-linear-to-br from-purple-50 to-white",
              border: "border-purple-200",
              text: "text-purple-600",
              icon: ShieldCheck,
              iconBg: "bg-purple-100",
              label: "Super Admin"
            };
          } else if (role === RoleName.AFFILIATOR) {
            style = {
              bg: "bg-linear-to-br from-emerald-50 to-white",
              border: "border-emerald-200",
              text: "text-emerald-600",
              icon: Banknote,
              iconBg: "bg-emerald-100",
              label: "Affiliator"
            };
          } else if (role === RoleName.USER) {
            style = {
              bg: "bg-linear-to-br from-orange-50 to-white",
              border: "border-orange-200",
              text: "text-orange-600",
              icon: UserCircle,
              iconBg: "bg-orange-100",
              label: "User"
            };
          } else if (roleNameStr.toLowerCase() === 'mitra') {
            style = {
              bg: "bg-linear-to-br from-cyan-50 to-white",
              border: "border-cyan-200",
              text: "text-cyan-600",
              icon: Handshake,
              iconBg: "bg-cyan-100",
              label: "Mitra"
            };
          }

          const IconComponent = style.icon;

          return (
            <Card key={roleNameStr} className={`${style.bg} ${style.border} hover:shadow-md transition-all duration-300`}>
              <CardHeader className="pb-2">
                <CardDescription className={`text-xs font-semibold ${style.text} uppercase tracking-wider`}>
                  {style.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gray-800">{roleStats[roleNameStr]}</span>
                  <div className={`p-2 rounded-full ${style.iconBg} flex items-center gap-2`}>
                    <IconComponent className={`h-5 w-5 ${style.text}`} />
                    <Badge variant="secondary" className="bg-white/50 backdrop-blur-sm text-xs border-0">
                      {Math.round((roleStats[roleNameStr] / data.length) * 100)}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
          <CardDescription>
            Cari dan filter pengguna berdasarkan kriteria tertentu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari berdasarkan nama, email, username, alamat, atau telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  {roles.map((role) => role as RoleName).map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center justify-between w-full">
                        <span>
                          {role === RoleName.SUPER_ADMIN ? 'Super Admin' :
                            role === RoleName.AFFILIATOR ? 'Affiliator' :
                              role === RoleName.USER ? 'User' :
                                (role as string).charAt(0).toUpperCase() + (role as string).slice(1)}
                        </span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {roleStats[role]}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="default"
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Filter aktif:</span>
              {searchTerm && (
                <Badge variant="secondary">
                  Pencarian: "{searchTerm}"
                </Badge>
              )}
              {selectedRole !== "all" && (
                <Badge variant="secondary">
                  Role: {selectedRole === 'super_admin' ? 'Super Admin' :
                    selectedRole === 'affiliator' ? 'Affiliator' :
                      selectedRole === 'user' ? 'User' :
                        selectedRole}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Menampilkan {filteredData.length} dari {data.length} pengguna
        </p>
        {filteredData.length === 0 && hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Reset Filter
          </Button>
        )}
      </div>

      {/* Data Table */}
      {filteredData.length === 0 && hasActiveFilters ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Tidak ada hasil ditemukan</p>
              <p className="text-sm text-gray-400 mb-4">
                Coba ubah kriteria pencarian atau filter yang dipilih
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Reset Semua Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={enhancedColumns} data={filteredData} />
      )}

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah User Baru</DialogTitle>
            <DialogDescription>
              Isi form di bawah ini untuk menambahkan user baru ke sistem
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleAddUser}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update informasi user {selectedUser?.fullname}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              defaultValues={{
                username: selectedUser.username,
                email: selectedUser.email,
                fullname: selectedUser.fullname,
                phoneNumber: selectedUser.phoneNumber,
                address: selectedUser.address,
                roleId: selectedUser.roleId,
                password: "",
              }}
              onSubmit={handleEditUser}
              loading={updateMutation.isPending}
              isEdit
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. User <strong>{selectedUser?.fullname}</strong> akan dihapus secara permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}