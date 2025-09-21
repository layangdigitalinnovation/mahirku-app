import { DataTable } from "@/components/table/DataTable";
import { columns } from "@/components/table/columns/userColumn";
import { useUsers } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Filter, X } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RoleName, User } from "@/types";

export default function ManageUsers() {
  const { data, isLoading, isError, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  // Get unique roles from data
  const roles = useMemo(() => {
    if (!data) return [];
    const uniqueRoles = Array.from(new Set(data.map((user : User) => user.role.name)));
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
      filtered = filtered.filter((user : User) => user.role.name === selectedRole);
    }
    
    // Search by name, email, username, or other relevant fields
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((user : User) => {
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
      {/* Role Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium">Total Pengguna</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">{data.length}</span>
            </div>
          </CardContent>
        </Card>
        
        {roles.map((role) => role as RoleName).map((role) => (
          <Card key={role}>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-medium">
                {role === RoleName.SUPER_ADMIN ? 'Super Admin' : 
                 role === RoleName.AFFILIATOR ? 'Affiliator' : 
                 role === RoleName.USER ? 'User' : 
                 (role as string).charAt(0).toUpperCase() + (role as string).slice(1)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{roleStats[role]}</span>
                <Badge variant="secondary" className="text-xs">
                  {Math.round((roleStats[role] / data.length) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
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
        <DataTable columns={columns} data={filteredData} />
      )}
    </div>
  )
}