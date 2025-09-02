import { DataTable } from "@/components/table/DataTable";
import { columns } from "@/components/table/columns/userColumn";
import { useUsers } from "@/hooks/useUsers";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ManageUsers() {
  const { data, isLoading, isError, error } = useUsers();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-24" />
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
        Tidak ada pengguna ditemukan.
      </div>
    );
  }

  return (
    <div className="container max-w-screen-xl py-10 mx-auto px-4">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
