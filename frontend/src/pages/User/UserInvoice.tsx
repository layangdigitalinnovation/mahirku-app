import { useState } from 'react';
import { 
  Search,
} from 'lucide-react';
import { useInvoicesCustomer } from '@/hooks/useInvoice';
import { DataTable } from '@/components/table/DataTable';
import { invoiceColumns } from '@/components/table/columns/invoiceColumn';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const UserInvoice  = () => {

  const { data : invoices, isLoading } = useInvoicesCustomer();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  if (isLoading ) {
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
              <h1 className="text-3xl font-bold text-gray-900">Riwayat Pembelian Token</h1>
              <p className="text-gray-600 mt-1">Kelola dan lacak pembelian token Anda</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nomor invoice atau nama paket..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="relative">
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger value={statusFilter}>
                  <SelectValue placeholder="Semua Status"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="COMPLETED">Terbayar</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Gagal</SelectItem>
                  <SelectItem value="EXPIRED">Kadaluarsa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Riwayat Invoice</h2>
            <p className="text-gray-600">Lacak semua transaksi pembelian token Anda</p>
          </div>
          
          <div className="overflow-x-auto">
            <DataTable data={invoices || []} columns={invoiceColumns} isLoading={isLoading} />
          </div>
          
          {invoices?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada invoice yang sesuai dengan kriteria Anda</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
