/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useVouchers,
  useDeleteVoucher,
  useCreateVoucher,
} from "@/hooks/useVouchers";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
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
    return <ErrorFetch error={error} />;
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

      {!data || data.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No vouchers found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((voucher: any) => (
            <div key={voucher.id} className="relative">
              {/* Voucher Card */}
              <div className="bg-gradient-to-r shadow-lg">
                <div className="bg-white rounded-lg p-6 relative overflow-hidden">
                  {/* Decorative circles */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500 rounded-full opacity-20"></div>
                  <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-pink-500 rounded-full opacity-20"></div>

                  {/* Voucher Header */}
                  <div className="text-center mb-4">
                    <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-2">
                      VOUCHER
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-wider">
                      {voucher.code}
                    </h2>
                  </div>

                  {/* Voucher Value */}
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-purple-600">
                      {voucher.type === "percentage"
                        ? `${voucher.value}%`
                        : formatCurrency(voucher.value)}
                    </div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide">
                      {voucher.type === "percentage"
                        ? "DISCOUNT"
                        : "CASH VALUE"}
                    </div>
                  </div>

                  {/* Voucher Details */}
                  <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">
                        {voucher.type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          voucher.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {voucher.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="text-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === voucher.id}
                      onClick={async () => {
                        setDeletingId(voucher.id);
                        await deleteVoucher.mutateAsync(voucher.id);
                        setDeletingId(null);
                      }}
                      className="w-full"
                    >
                      {deletingId === voucher.id
                        ? "Menghapus..."
                        : "Hapus Voucher"}
                    </Button>
                  </div>

                  {/* Perforated edge effect */}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-gray-100 rounded-full"></div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-gray-100 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
