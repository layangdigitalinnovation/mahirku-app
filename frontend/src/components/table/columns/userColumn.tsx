import { Badge } from "@/components/ui/badge"
import { RoleName, UserColumn } from "@/types"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Edit, Trash } from "lucide-react"

// Define proper badge variant type based on shadcn/ui badge component
type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

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
      const roleName = row.original.role.name as RoleName;
      
      // Map role name to badge variant (using standard shadcn/ui variants)
      const variantMap: Record<RoleName, BadgeVariant> = {
        [RoleName.SUPER_ADMIN]: 'default',
        [RoleName.AFFILIATOR]: 'outline',
        [RoleName.USER]: 'secondary',
        [RoleName.MITRA]: 'default', // Using default/primary color for Mitra
      };

      // Map role name to display labels
      const labelMap: Record<RoleName, string> = {
        [RoleName.SUPER_ADMIN]: 'Super Admin',
        [RoleName.AFFILIATOR]: 'Affiliator',
        [RoleName.USER]: 'User',
        [RoleName.MITRA]: 'Mitra',
      };

      const variant = variantMap[roleName] || 'default';
      const label = labelMap[roleName] || roleName;

      return (
        <Badge variant={variant} className="text-xs font-medium">
          {label}
        </Badge>
      );
    }
  },
];

export const getColumns = (
  onEdit: (user: UserColumn) => void,
  onDelete: (user: UserColumn) => void
): ColumnDef<UserColumn>[] => [
  ...columns,
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const user = row.original;
      // Hide delete for Super Admin
      const isSuperAdmin = user.role.name === RoleName.SUPER_ADMIN;

      return (
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={() => onEdit(user)} title="Edit User">
             <Edit className="h-4 w-4" />
           </Button>
           {!isSuperAdmin && (
             <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(user)} title="Delete User">
               <Trash className="h-4 w-4" />
             </Button>
           )}
        </div>
      );
    }
  }
]