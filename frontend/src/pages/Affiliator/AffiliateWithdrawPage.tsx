import { useState } from 'react';
import { Clock, Check, X, AlertCircle, CreditCard, Wallet, TrendingUp } from 'lucide-react';
import { useAffiliateBalanceDetail } from '@/hooks/useAffiliator';
import { useCreateWithdrawRequest, useGetWithdrawHistory } from '@/hooks/useWithdraw';
import { CreateWithdrawPayload } from '@/services/api/withdraw';

const AffiliateWithdrawPage = () => {
  // Hooks for data fetching
  const { data: balanceData, isLoading: balanceLoading, error: balanceError, refetch: refetchBalance } = useAffiliateBalanceDetail();
  const { data: withdrawHistoryData, isLoading: historyLoading, error: historyError, refetch: refetchHistory } = useGetWithdrawHistory();
  const createWithdrawMutation = useCreateWithdrawRequest();
  
  // Local state
  const [submitting, setSubmitting] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: ''
  });
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Extract withdraw history from API response
  const withdrawHistory = withdrawHistoryData?.data?.withdrawRequests || [];
  const loading = balanceLoading || historyLoading;

  const handleWithdraw = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const amount = parseFloat(withdrawAmount);
      
      if (amount < 100000) {
        setError('Minimum withdraw adalah Rp 100.000');
        setSubmitting(false);
        return;
      }

      if (amount > (balanceData?.effectiveAvailableBalance || 0)) {
        setError('Jumlah melebihi saldo yang tersedia');
        setSubmitting(false);
        return;
      }

      const payload: CreateWithdrawPayload = {
        amount,
        bankName: bankDetails.bankName,
        accountNumber: bankDetails.accountNumber,
        accountName: bankDetails.accountName
      };

      await createWithdrawMutation.mutateAsync(payload);

      setSuccess('Permintaan withdraw berhasil diajukan! Tim kami akan memproses dalam 1-3 hari kerja.');
      setShowWithdrawForm(false);
      setWithdrawAmount('');
      setBankDetails({ bankName: '', accountNumber: '', accountName: '' });
      
      // Refresh data
      refetchBalance();
      refetchHistory();
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Terjadi kesalahan saat mengajukan withdraw');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status : string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <Check className="w-4 h-4 text-blue-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-purple-500" />;
      case 'processed':
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'rejected':
      case 'failed':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status : string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Proses';
      case 'approved':
        return 'Disetujui';
      case 'processing':
        return 'Sedang Diproses';
      case 'processed':
      case 'completed':
        return 'Selesai';
      case 'rejected':
        return 'Ditolak';
      case 'failed':
        return 'Gagal';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status : string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'processed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Handle API errors
  if (balanceError || historyError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Terjadi kesalahan saat memuat data</p>
          <button 
            onClick={() => {
              refetchBalance();
              refetchHistory();
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Penarikan Dana</h1>
          <p className="text-gray-600">Kelola penarikan komisi affiliate Anda</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
            <Check className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Komisi</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(balanceData?.totalEarned || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Saldo Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(balanceData?.effectiveAvailableBalance || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dalam Proses</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(balanceData?.pendingAmount || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Withdraw Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowWithdrawForm(true)}
            disabled={!balanceData?.effectiveAvailableBalance || balanceData?.effectiveAvailableBalance < 100000 || submitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg flex items-center transition-colors"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Ajukan Penarikan
          </button>
          {(balanceData?.effectiveAvailableBalance || 0) < 100000 && (
            <p className="text-sm text-gray-500 mt-2">Minimum penarikan Rp 100.000</p>
          )}
        </div>

        {/* Withdraw Form Modal */}
        {showWithdrawForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ajukan Penarikan</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Penarikan
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100000"
                    min="100000"
                    max={balanceData?.effectiveAvailableBalance}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tersedia: {formatCurrency(balanceData?.effectiveAvailableBalance || 0)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Bank
                  </label>
                  <select
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Pilih Bank</option>
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                    <option value="CIMB Niaga">CIMB Niaga</option>
                    <option value="Danamon">Danamon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1234567890"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Pemegang Rekening
                  </label>
                  <input
                    type="text"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawForm(false)}
                    disabled={submitting || createWithdrawMutation.isPending}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    disabled={submitting || createWithdrawMutation.isPending}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
                  >
                    {submitting || createWithdrawMutation.isPending ? 'Memproses...' : 'Ajukan'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information */}
        <div className="mt-8 mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Informasi Penting:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Minimum penarikan adalah Rp 100.000</li>
            <li>• Penarikan akan diproses dalam 1-3 hari kerja</li>
            <li>• Pastikan data rekening bank sudah benar</li>
            <li>• Penarikan hanya bisa dilakukan ke rekening atas nama yang sama dengan akun affiliate</li>
          </ul>
        </div>

        {/* Withdraw History */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Riwayat Penarikan</h2>
          </div>
          
          <div className="p-6">
            {withdrawHistory.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada riwayat penarikan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawHistory.map((withdraw : any) => (
                  <div key={withdraw.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {getStatusIcon(withdraw.status)}
                        <span className="ml-2 font-medium text-gray-900">
                          {formatCurrency(withdraw.amount)}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdraw.status)}`}>
                        {getStatusText(withdraw.status)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Bank:</span> {withdraw.bankName} - {withdraw.accountNumber}</p>
                      <p><span className="font-medium">Tanggal Pengajuan:</span> {formatDate(withdraw.createdAt)}</p>
                      {withdraw.processedAt && (
                        <p><span className="font-medium">Tanggal Diproses:</span> {formatDate(withdraw.processedAt)}</p>
                      )}
                      {withdraw.rejectionReason && (
                        <p className="text-red-600"><span className="font-medium">Alasan ditolak:</span> {withdraw.rejectionReason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default AffiliateWithdrawPage;