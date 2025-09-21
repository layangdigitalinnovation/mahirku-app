import { Badge } from "@/components/ui/badge"
import { RoleName, UserColumn } from "@/types"
import { ColumnDef } from "@tanstack/react-table"

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
      };

      // Map role name to display labels
      const labelMap: Record<RoleName, string> = {
        [RoleName.SUPER_ADMIN]: 'Super Admin',
        [RoleName.AFFILIATOR]: 'Affiliator',
        [RoleName.USER]: 'User',
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
]