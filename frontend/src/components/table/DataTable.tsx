import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Search } from 'lucide-react';


interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  className?: string;
}




// Table Components
const Table: React.FC<TableProps> = ({ className = "", ...props }) => (
  <table className={`w-full ${className}`} {...props} />
);

const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = "", ...props }) => (
  <thead className={`bg-gradient-to-r from-gray-50 to-gray-100 ${className}`} {...props} />
);

const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className = "", ...props }) => (
  <tbody className={`divide-y divide-gray-200 ${className}`} {...props} />
);

const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className = "", ...props }) => (
  <tr className={`hover:bg-gray-50 transition-colors duration-150 ${className}`} {...props} />
);

const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableHeaderCellElement>> = ({ className = "", ...props }) => (
  <th className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`} {...props} />
);

const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableDataCellElement>> = ({ className = "", ...props }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`} {...props} />
);

// Select Component



interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: keyof TData
  title?: string
  description?: string
  showPagination?: boolean
  isLoading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  title ,
  description ,
  showPagination = true,
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    globalFilterFn: searchKey ? (row, _columnId, value) => {
      const searchValue = String(row.getValue(searchKey as string) ?? "").toLowerCase();
      return searchValue.includes(String(value).toLowerCase());
    } : undefined,
  });

  return (
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>

        {/* Controls */}
        {/* ... search bar dll ... */}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg relative">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {isLoading ? (
                  // Loading state pakai skeleton
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
                        <p className="text-sm text-gray-500">Loading data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  // Ada data
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                          <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          {globalFilter || columnFilters.length > 0 ? "No results found" : "No data available"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {globalFilter || columnFilters.length > 0
                            ? "Try adjusting your search or filters"
                            : "Start by adding new data"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {showPagination && !isLoading && table.getRowModel().rows.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              {/* ... pagination controls ... */}
            </div>
          )}
        </div>
      </div>
  );
}