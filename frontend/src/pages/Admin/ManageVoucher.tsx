import { useVouchers, useDeleteVoucher, useCreateVoucher } from "@/hooks/useVouchers";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import VoucherForm, { VoucherFormValues } from "@/components/form/VoucherForm";
import { VoucherPayload } from "@/services/api";
import formatCurrency from "@/utils/formatCurrency";
import ErrorFetch from "@/components/ui/Error";

export default function ManageVouchers() {
  const { data, isLoading, isError, error } = useVouchers();
  const deleteVoucher = useDeleteVoucher();
  const createVoucher = useCreateVoucher();

  const [deletingId, setDeletingId] = useState<number | null>(null);

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
     <ErrorFetch error={error} />
    );
  }

  return (
    <div className="container max-w-screen-xl py-10 mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Manage Vouchers</h1>

        {/* Add Voucher Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Voucher</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Voucher</DialogTitle>
            </DialogHeader>
            <VoucherForm
              onSubmit={(values: VoucherFormValues) =>
                createVoucher.mutate(values as VoucherPayload)
              }
              loading={createVoucher.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {(!data || data.length === 0) ? (
        <div className="text-center text-gray-500 py-10">
          No vouchers found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((voucher: any) => (
            <Card key={voucher.id} className="flex flex-col justify-between font-body bg-secondary-200!">
              <CardHeader>
                <h1 className="text-heading5 font-heading font-bold">{voucher.code}</h1>
              </CardHeader>

              <CardContent className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Type: <span className="font-medium">{voucher.type}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Value:{" "}
                  {voucher.type === "percentage"
                    ? `${voucher.value}%`
                    : formatCurrency(voucher.value)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: {voucher.isActive ? "Active" : "Inactive"}
                </p>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deletingId === voucher.id}
                  onClick={async () => {
                    setDeletingId(voucher.id);
                    await deleteVoucher.mutateAsync(voucher.id);
                    setDeletingId(null);
                  }}
                >
                  {deletingId === voucher.id ? "Deleting..." : "Delete"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
