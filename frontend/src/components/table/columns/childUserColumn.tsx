import { ColumnDef } from "@tanstack/react-table";
import { Mail, Phone, MapPin, Trash, SendHorizontal, FileText } from "lucide-react";
import ActionColumn from "../ActionColumn";
import z from "zod";

export type ChildUser = {
  id: number;
  username: string;
  email: string;
  roleId: number;
  fullname: string;
  address: string;
  phoneNumber: string;
  tokens: number;
  parentId: number;
  packageId: number | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  createdAt: string;
  updatedAt: string;
};


export const getColumns = ( onTransferToken: ({childUserId, tokenAmount}: {childUserId: number, tokenAmount: number}) => void,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _onDelete: (userId: number) => void,
  onViewHistory?: (userId: number) => void
) : ColumnDef<ChildUser>[] => [
  {
    accessorKey: "fullname",
    header: "User Info",
    cell: ({ row }) => {
      const child = row.original;
      return (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {child.fullname.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{child.fullname}</div>
            <div className="text-sm text-gray-500">@{child.username}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Contact",
    cell: ({ row }) => {
      const child = row.original;
      return (
        <div>
          <div className="text-sm text-gray-900 flex items-center gap-1">
            <Mail className="h-3 w-3 text-gray-400" />
            {child.email}
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Phone className="h-3 w-3 text-gray-400" />
            {child.phoneNumber}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => {
      const child = row.original;
      return (
        <div className="text-sm text-gray-900 flex items-center gap-1">
          <MapPin className="h-3 w-3 text-gray-400" />
          <span className="max-w-xs truncate">{child.address}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "tokens",
    header: "Tokens",
    cell: ({ row }) => {
      const tokens = row.getValue("tokens") as number;
      return (
        <div className="text-sm font-medium text-gray-900">{tokens}</div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const dateString = row.getValue("createdAt") as string;
      const date = new Date(dateString);
      return (
        <div className="text-sm text-gray-900">
          {date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </div>
      );
    },
  },
   {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <ActionColumn
          actions={[
            {
              label: "Riwayat Test",
              icon: <FileText className="h-4 w-4 text-blue-600" />,
              onClick: () => {
                if (onViewHistory) onViewHistory(user.id);
              },
            },
            {
              label: "Transfer Token",
              icon: <SendHorizontal className="h-4 w-4" />,
              confirm: true,
              description: `Transfer Token ke ${user.fullname}`,
              formSchema: z.object({
                tokenAmount: z
                  .coerce
                  .number()
                  .min(1, "Minimal 1"),
              }),
              defaultValues: { tokenAmount: 0 },
              onClick: (values) => {
                onTransferToken({childUserId: user.id, tokenAmount: values.tokenAmount});
              },
            },
            {
              label: "Delete",
              icon: <Trash className="h-4 w-4" />,
              variant: "destructive",
              confirm: true,
              onClick: () => {
                console.log("Delete user:", user.id);
                // 👉 panggil API delete
              },
            },
          ]}
        />
      );
    },
  },
];