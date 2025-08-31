import { useState } from 'react';
import { Plus, User, CreditCard, Search } from 'lucide-react';
import { DataTable } from '@/components/table/DataTable';
import { useAddChildUser, useGetAllChildUser, useTransferTokenToChild, useUserTokenBalance } from '@/hooks/useTokenTest';
import { ChildUser, getColumns } from '@/components/table/columns/childUserColumn';
import { Button } from '@/components/ui/Button'; // lowercase!
import ErrorFetch from '@/components/ui/Error';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import ChildrenForm, {ChildFormValues} from '@/components/form/ChildrenForm';

export default function CustomerChilds() {
  const { data: children = [], isLoading, error } = useGetAllChildUser();
  const { tokenBalance } = useUserTokenBalance();
  const transferMutation = useTransferTokenToChild();
  const addChildMutation = useAddChildUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPackage, setFilterPackage] = useState('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);



  const columns = getColumns(transferMutation.mutateAsync, () => {});



  const filteredChildren = children?.filter(child => {
    if (!child) return false;
    const matchesSearch =
      child.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterPackage === 'All' ||
      (filterPackage === 'With Package' && child.packageId !== null) ||
      (filterPackage === 'No Package' && child.packageId === null);
    return matchesSearch && matchesFilter;
  });

  if (error) {
    return (
      <ErrorFetch
        error={error}
        errorType="network"
        retryText="Coba Lagi"
        showRetry={false}
        className="w-full"
        size="default"
      />
    );
  }

  const handleSubmit = async (values: ChildFormValues) => {
     // TODO: panggil API POST add child di sini
  await addChildMutation.mutateAsync(values)
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-screen-xl md:px-10 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Kelola Member</h1>
          <p className="text-gray-600">Kelola data member dan informasi akun mereka</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Add Button with Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={tokenBalance <= 1} variant={tokenBalance <= 1 ? 'ghost' : 'secondary'}>
                  { tokenBalance >= 1 ? <Plus className="h-4 w-4" /> : null }
                  {tokenBalance <= 1 ? 'Minimal 2 Token' : 'Tambah Member'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Tambah Member</DialogTitle>
                  <DialogDescription>
                    Isi data member dengan lengkap untuk menambahkan akun baru.
                  </DialogDescription>
                </DialogHeader>
                <ChildrenForm onSubmit={handleSubmit} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Anak</p>
                <p className="text-2xl font-bold text-gray-800">{children?.length || 0}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tokens</p>
                <p className="text-2xl font-bold text-gray-800">
                  {tokenBalance}
                </p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-purple-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <DataTable columns={columns} isLoading={isLoading} data={filteredChildren as ChildUser[]} />
      </div>
    </div>
  );
}
