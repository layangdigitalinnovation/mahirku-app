/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { 
  Clock, 
  DollarSign, 
  TrendingUp, 
  X
} from 'lucide-react';
import { DataTable } from '@/components/table/DataTable';
import { createWithdrawColumns } from '@/components/table/columns/withdrawColumn';
import {
  useGetAllWithdrawRequests,
  useApproveWithdrawRequest,
  useRejectWithdrawRequest,
  useMarkAsProcessed
} from '@/hooks/useWithdraw';
import { WithdrawRequest } from '@/services/api/withdraw';

const AdminWithdrawManagement = () => {
  // Backend hooks
  const { data: withdrawRequests = [], isLoading } = useGetAllWithdrawRequests();
  const approveWithdrawMutation = useApproveWithdrawRequest();
  const rejectWithdrawMutation = useRejectWithdrawRequest();
  const markAsProcessedMutation = useMarkAsProcessed();
  
  // State untuk UI
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'view' | 'approve' | 'reject'>('view');
  const [currentRequest, setCurrentRequest] = useState<WithdrawRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');

  // Handler functions
  const handleView = (request: WithdrawRequest) => {
    setCurrentRequest(request);
    setModalType('view');
    setShowModal(true);
  };

  const handleApprove = (request: WithdrawRequest) => {
    setCurrentRequest(request);
    setModalType('approve');
    setShowModal(true);
  };

  const handleReject = (request: WithdrawRequest) => {
    setCurrentRequest(request);
    setModalType('reject');
    setShowModal(true);
  };

  const handleMarkAsProcessed = (id: number) => {
    markAsProcessedMutation.mutate(id);
  };

  const handleConfirmApprove = () => {
    if (currentRequest) {
      approveWithdrawMutation.mutate(
        { id: currentRequest.id, payload: { notes } },
        {
          onSuccess: () => {
            setShowModal(false);
            setNotes('');
            setCurrentRequest(null);
          }
        }
      );
    }
  };

  const handleConfirmReject = () => {
    if (currentRequest) {
      rejectWithdrawMutation.mutate(
        { id: currentRequest.id, payload : { rejectionReason } },
        {
          onSuccess: () => {
            setShowModal(false);
            setRejectionReason('');
            setCurrentRequest(null);
          }
        }
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentRequest(null);
    setRejectionReason('');
    setNotes('');
  };



  // Create columns for DataTable
  const columns = createWithdrawColumns({
    onView: handleView,
    onApprove: handleApprove,
    onReject: handleReject,
    onMarkAsProcessed: handleMarkAsProcessed
  });



  return (
    <div className="container max-w-screen-xl mx-auto p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Penarikan</h1>
          <p className="text-gray-600">Kelola permintaan penarikan afiliasi</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total withdraw berhasil</p>
                <p className="text-2xl font-bold text-green-600">
                  {withdrawRequests && withdrawRequests.filter((request : any) => request.status === 'completed').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jumlah Tertunda</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {withdrawRequests && withdrawRequests.filter((request : any) => request.status === 'pending').length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Permintaan</p>
                <p className="text-2xl font-bold text-blue-600">
                  {withdrawRequests && withdrawRequests.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Withdraw Requests DataTable */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Permintaan Penarikan</h2>
            </div>
          </div>
          
          <div className="p-6">
            <DataTable
              columns={columns}
              data={withdrawRequests}
              title=""
              description=""
              showPagination={true}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalType === 'view' && 'Detail Permintaan'}
                  {modalType === 'approve' && 'Setujui Permintaan'}
                  {modalType === 'reject' && 'Tolak Permintaan'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {currentRequest && (
                <div className="space-y-4">
                  {modalType === 'view' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-500">ID Permintaan:</span>
                          <p className="text-gray-900">#{currentRequest.id}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Status:</span>
                          <div className="mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              currentRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              currentRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                              currentRequest.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {currentRequest.status.charAt(0).toUpperCase() + currentRequest.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Jumlah:</span>
                          <p className="text-gray-900 font-semibold">Rp {currentRequest.amount.toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-500">Tanggal:</span>
                          <p className="text-gray-900">{new Date(currentRequest.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-500">Afiliasi:</span>
                          <p className="text-gray-900">{currentRequest.affiliate.fullname}</p>
                          <p className="text-gray-500 text-sm">{currentRequest.affiliate.email}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium text-gray-500">Detail Bank:</span>
                          <p className="text-gray-900">{currentRequest.affiliate.bankName}</p>
                          <p className="text-gray-900">{currentRequest.affiliate.bankAccountNumber}</p>
                          <p className="text-gray-900">{currentRequest.affiliate.bankAccountName}</p>
                        </div>
                        {currentRequest.notes && (
                          <div className="col-span-2">
                            <span className="font-medium text-gray-500">Catatan:</span>
                            <p className="text-gray-900">{currentRequest.notes}</p>
                          </div>
                        )}
                        {currentRequest.rejectionReason && (
                          <div className="col-span-2">
                            <span className="font-medium text-gray-500">Alasan Penolakan:</span>
                            <p className="text-red-600">{currentRequest.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {modalType === 'approve' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan (Opsional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Tambahkan catatan untuk persetujuan ini..."
                      />
                    </div>
                  )}

                  {modalType === 'reject' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alasan Penolakan *
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Silakan berikan alasan penolakan..."
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                {modalType === 'approve' && (
                  <button
                    onClick={handleConfirmApprove}
                    disabled={approveWithdrawMutation.isPending}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {approveWithdrawMutation.isPending ? 'Menyetujui...' : 'Setujui Permintaan'}
                  </button>
                )}
                
                {modalType === 'reject' && (
                  <button
                    onClick={handleConfirmReject}
                    disabled={rejectWithdrawMutation.isPending || !rejectionReason.trim()}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {rejectWithdrawMutation.isPending ? 'Menolak...' : 'Tolak Permintaan'}
                  </button>
                )}
                
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {modalType === 'view' ? 'Tutup' : 'Batal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawManagement;