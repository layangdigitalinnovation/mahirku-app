import { ColumnDef } from '@tanstack/react-table';
import { Eye, Check, X } from 'lucide-react';
import { WithdrawRequest } from '@/services/api/withdraw';

interface WithdrawColumnProps {
  onView: (request: WithdrawRequest) => void;
  onApprove: (request: WithdrawRequest) => void;
  onReject: (request: WithdrawRequest) => void;
  onMarkAsProcessed: (id: number) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
    approved: { color: 'bg-blue-100 text-blue-800', text: 'Approved' },
    processed: { color: 'bg-green-100 text-green-800', text: 'Processed' },
    rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', text: status };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  );
};

export const createWithdrawColumns = ({
  onView,
  onApprove,
  onReject,
  onMarkAsProcessed
}: WithdrawColumnProps): ColumnDef<WithdrawRequest>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">#{row.getValue('id')}</span>
    ),
  },
  {
    accessorKey: 'affiliate',
    header: 'Affiliate',
    cell: ({ row }) => {
      const affiliate = row.getValue('affiliate') as WithdrawRequest['affiliate'];
      return (
        <div>
          <div className="text-sm font-medium text-gray-900">{affiliate.fullname}</div>
          <div className="text-sm text-gray-500">{affiliate.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">
        {formatCurrency(row.getValue('amount'))}
      </span>
    ),
  },
  {
    accessorKey: 'bankName',
    header: 'Bank Details',
    cell: ({ row }) => {
      const bankName = row.getValue('bankName') as string;
      const accountNumber = row.original.accountNumber;
      const accountName = row.original.accountName;
      return (
        <div>
          <div className="text-sm font-medium text-gray-900">{bankName}</div>
          <div className="text-sm text-gray-500">{accountNumber}</div>
          <div className="text-sm text-gray-500">{accountName}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.getValue('status')),
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">
        {formatDate(row.getValue('createdAt'))}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const request = row.original;
      return (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(request)}
            className="text-blue-600 hover:text-blue-900 p-1"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {request.status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(request)}
                className="text-green-600 hover:text-green-900 p-1"
                title="Approve"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => onReject(request)}
                className="text-red-600 hover:text-red-900 p-1"
                title="Reject"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          
          {request.status === 'approved' && (
            <button
              onClick={() => onMarkAsProcessed(request.id)}
              className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs hover:bg-green-200"
            >
              Mark Processed
            </button>
          )}
        </div>
      );
    },
  },
];