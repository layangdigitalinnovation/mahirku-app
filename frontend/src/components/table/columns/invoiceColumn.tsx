import { ColumnDef } from "@tanstack/react-table";
import { InvoicePayload } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  User, 
  Package, 
  Ticket, 
  Coins,
  Calendar,
  ExternalLink
} from "lucide-react";

// Status mapping untuk styling yang konsisten
const statusConfig = {
  PENDING: { 
    variant: "secondary" as const, 
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
  },
  PAID: { 
    variant: "default" as const, 
    label: "Terbayar",
    className: "bg-green-100 text-green-800 hover:bg-green-200"
  },
  EXPIRED: { 
    variant: "destructive" as const, 
    label: "Kadaluarsa",
    className: "bg-red-100 text-red-800 hover:bg-red-200"
  },
  CANCELLED: { 
    variant: "outline" as const, 
    label: "Dibatalkan",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  }
};

// Helper function untuk format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// Helper function untuk format tanggal
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function untuk copy text
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // You can add toast notification here
    console.log('Copied to clipboard:', text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

export const invoiceColumns: ColumnDef<InvoicePayload>[] = [
  {
    accessorKey: "id",
    header: () => (
      <div className="flex items-center gap-2 font-medium">
        <ExternalLink className="h-4 w-4" />
        Invoice ID
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-medium">
          #{row.original.id}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => copyToClipboard(row.original.id.toString())}
        >
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    ),
    size: 120,
  },
  {
    accessorKey: "xenditInvoiceId",
    header: () => (
      <div className="flex items-center gap-2 font-medium">
        <ExternalLink className="h-4 w-4" />
        External ID
      </div>
    ),
    cell: ({ row }) => {
      const externalId = row.original.xenditInvoiceId;
      if (!externalId) return <span className="text-gray-400">-</span>;
      
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-blue-600">
            {externalId.length > 12 ? `${externalId.slice(0, 12)}...` : externalId}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => copyToClipboard(externalId)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      );
    },
    size: 140,
  },
  {
    accessorKey: "User",
    header: () => (
      <div className="flex items-center gap-2 font-medium">
        <User className="h-4 w-4" />
        Customer
      </div>
    ),
    cell: ({ row }) => {
      const user = row.original.User;
      
      if (!user) {
        return <span className="text-gray-400 text-sm">No user data</span>;
      }

      const fullname = user.fullname || 'Unknown User';
      const initials = fullname.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      
      return (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">
              {initials}
            </span>
          </div>
          <div>
            <div className="font-medium text-sm">{fullname}</div>
            {user.email && (
              <div className="text-xs text-gray-500">{user.email}</div>
            )}
          </div>
        </div>
      );
    },
    size: 200,
  },
  {
    accessorKey: "Package",
    header: () => (
      <div className="flex items-center gap-2 font-medium">
        <Package className="h-4 w-4" />
        Package
      </div>
    ),
    cell: ({ row }) => {
      const pkg = row.original.Package;
      
      if (!pkg) {
        return <span className="text-gray-400 text-sm">No package</span>;
      }

      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm">{pkg.name || 'Unknown Package'}</span>
          {pkg.price && typeof pkg.price === 'number' && (
            <span className="text-xs text-green-600 font-medium">
              {formatCurrency(pkg.price)}
            </span>
          )}
        </div>
      );
    },
    size: 160,
  },
  {
    accessorKey: "Voucher.code",
    header: () => (
      <div className="flex items-center gap-2 font-medium">
        <Ticket className="h-4 w-4" />
        Voucher
      </div>
    ),
    cell: ({ row }) => {
      const voucher = row.original.Voucher;
      
      if (!voucher || !voucher.code) {
        return <span className="text-gray-400 text-sm">No voucher</span>;
      }

      return (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="w-fit text-xs">
            {voucher.code}
          </Badge>
        </div>
      );
    },
    size: 120,
  },
  {
    accessorKey: "tokenAmount",
    header: () => (
      <div className="flex items-center gap-2 font-medium">
        <Coins className="h-4 w-4" />
        Token
      </div>
    ),
    cell: ({ row }) => {
      const tokenAmount = row.original.tokenAmount;
      
      if (tokenAmount === null || tokenAmount === undefined || typeof tokenAmount !== 'number') {
        return <span className="text-gray-400 text-sm">0</span>;
      }

      return (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
            <Coins className="h-3 w-3 text-yellow-600" />
          </div>
          <span className="font-semibold text-yellow-600">
            {tokenAmount.toLocaleString()}
          </span>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="flex items-center gap-2 font-medium">
        Status
      </div>
    ),
    cell: ({ row }) => {
      const status = row.original.status as keyof typeof statusConfig;
      const config = statusConfig[status] || statusConfig.PENDING;
      
      return (
        <Badge 
          variant={config.variant}
          className={config.className}
        >
          {config.label}
        </Badge>
      );
    },
    size: 100,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "paymentDate",
    header: () => (
      <div className="flex items-center gap-2 font-medium">
        <Calendar className="h-4 w-4" />
        Payment Date
      </div>
    ),
    cell: ({ row }) => {
      const paymentDate = row.original.paymentDate;
      
      if (!paymentDate) {
        return <span className="text-gray-400 text-sm">Not paid</span>;
      }

      return (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-sm">
            {formatDate(paymentDate)}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(paymentDate) > new Date(Date.now() - 24*60*60*1000) 
              ? 'Recent' 
              : 'Older'
            }
          </span>
        </div>
      );
    },
    size: 140,
  },
];

// Export additional utilities
export { statusConfig, formatCurrency, formatDate };