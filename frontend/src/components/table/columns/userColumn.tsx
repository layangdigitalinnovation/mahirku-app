import { UserColumn } from "@/types"
import  { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "fullname",
    header: "Nama",
  },
  {
    accessorKey: "address",
    header: "Alamat",
  },
  {
    accessorKey: "phoneNumber",
    header: "Nomor Telepon",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const roleName = row.original.role.name
      return roleName
    }
  },
]
