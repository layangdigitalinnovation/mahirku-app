import { usePackages, useDeletePackage, useCreatePackage, useUpdatePackage } from "@/hooks/usePackage";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader , CardContent, CardFooter } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import formatCurrency from "@/utils/formatCurrency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import PackageForm, { PackageFormValues } from "@/components/form/PackageForm";
import { PackagePayload } from "@/services/api";

export default function ManagePackages() {
  const { data, isLoading, isError, error } = usePackages();
  const deletePackage = useDeletePackage();
  const createPackage = useCreatePackage();
  const updatePackage = useUpdatePackage();

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingPkg, setEditingPkg] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-4 space-y-2">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-8 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Failed to load packages."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        No packages found.
      </div>
    );
  }

  return (
    <div className="container max-w-screen-xl py-10 mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Manage Packages</h1>

        {/* Add Package Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Package</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Package</DialogTitle>
            </DialogHeader>
            <PackageForm
              onSubmit={(values: PackageFormValues) =>
                createPackage.mutate(values as PackagePayload)
              }
              loading={createPackage.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((pkg: any) => (
          <Card key={pkg.id} className="flex flex-col justify-between font-body">
            <CardHeader>
              <h1 className="text-heading5 font-heading font-bold">{pkg.name}</h1>
            </CardHeader>

            <CardContent>
              <p className="text-heading5 font-semibold mb-8">
                {formatCurrency(pkg.price)}
              </p>
              <p className="text-body1 ">
                {pkg.description}
              </p>
              <p className="text-sm text-muted-foreground">
                Jumlah Token : {pkg.defaultTokenAmount}
              </p>
            </CardContent>

            <CardFooter className="flex justify-between">
              {/* Edit Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setEditingPkg(pkg)}>
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Package</DialogTitle>
                  </DialogHeader>
                  <PackageForm
                    defaultValues={editingPkg || undefined}
                    onSubmit={(values: PackageFormValues) =>
                      updatePackage.mutate({ id: pkg.id, data: values as PackagePayload })
                    }
                    loading={updatePackage.isPending}
                  />
                </DialogContent>
              </Dialog>

              <Button
                variant="destructive"
                size="sm"
                disabled={deletingId === pkg.id}
                onClick={async () => {
                  setDeletingId(pkg.id);
                  await deletePackage.mutateAsync(pkg.id);
                  setDeletingId(null);
                }}
              >
                {deletingId === pkg.id ? "Deleting..." : "Delete"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
