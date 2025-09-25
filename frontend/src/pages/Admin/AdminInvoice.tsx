
import { useInvoicesAdmin } from '@/hooks/useInvoice';
import { DataTable } from '@/components/table/DataTable';
import { invoiceColumns } from '@/components/table/columns/invoiceColumn';
import { InvoicePayload } from '@/types';

export const AdminInvoice = () => {
  const { data: invoices, isLoading } = useInvoicesAdmin();

  // Status filter options for DataTable
  const statusFilterOptions = [
    { value: "PAID", label: "Terbayar" },
    { value: "PENDING", label: "Pending" },
    { value: "FAILED", label: "Gagal" },
    { value: "EXPIRED", label: "Kadaluarsa" }
  ];

  // Search keys for multi-field search
  const searchKeys = ['id', 'User.email', 'User.fullname', 'Package.name'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manajemen Invoice</h1>
              <p className="text-gray-600 mt-1">
                Pantau dan kelola semua transaksi pembelian token dari pengguna
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* DataTable with built-in filters */}
        <DataTable 
          data={invoices || []} 
          columns={invoiceColumns} 
          isLoading={isLoading}
          enableFilters={true}
          searchPlaceholder="Cari berdasarkan nomor invoice, nama paket, email, atau nama pengguna..."
          statusFilterOptions={statusFilterOptions}
          statusFilterKey="status"
          enableDateFilter={true}
          dateFilterKey="createdAt"
          searchKeys={searchKeys as (keyof InvoicePayload)[]}
          showPagination={true}
        />
      </div>
    </div>
  );
}
