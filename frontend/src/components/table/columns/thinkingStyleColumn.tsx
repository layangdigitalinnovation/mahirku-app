import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Eye, Edit, Trash2, RotateCcw } from 'lucide-react';
import { ThinkingStyle } from '@/services/api/thinkingStylesAdmin';
import { Link } from 'react-router-dom';

interface ThinkingStyleColumnProps {
  onView: (thinkingStyle: ThinkingStyle) => void;
  onEdit: (thinkingStyle: ThinkingStyle) => void;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}

export const createThinkingStyleColumns = ({
  onView,
  onEdit,
  onDelete,
  onRestore,
}: ThinkingStyleColumnProps): ColumnDef<ThinkingStyle>[] => [
  {
    accessorKey: 'digit',
    header: 'Digit',
    cell: ({ row }) => (
      <div className="font-medium text-center">
        {row.getValue('digit')}
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue('type')}
      </div>
    ),
  },
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
        {row.getValue('code')}
      </div>
    ),
  },
  {
    accessorKey: 'detailPage',
    header: 'Detail Page',
    cell: ({ row }) => {
  
      console.log(row.original)

    return  (


      <div className="font-mono text-xs bg-gray-100">
        <Button variant={'link'}>
          <Link to={`edit/${row.original.id}`}>
            Detail Page
          </Link>
        </Button>
      </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue('description') as string;
      return (
        <div className="max-w-xs truncate" title={description}>
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: 'theory',
    header: 'Theory',
    cell: ({ row }) => {
      const theory = row.getValue('theory') as string;
      return (
        <div className="max-w-xs truncate" title={theory}>
          {theory}
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean;
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return (
        <div className="text-sm text-gray-600">
          {date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const thinkingStyle = row.original;
      const isActive = thinkingStyle.isActive;

      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(thinkingStyle)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(thinkingStyle)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          {isActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(thinkingStyle.id)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(thinkingStyle.id)}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];