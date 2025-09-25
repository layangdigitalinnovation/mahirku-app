/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
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
import { Search, X, Calendar } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  // PaginationEllipsis,
} from "../ui/pagination";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  className?: string;
}

// Table Components
const Table: React.FC<TableProps> = ({ className = "", ...props }) => (
  <table className={`w-full ${className}`} {...props} />
);

const TableHeader: React.FC<
  React.HTMLAttributes<HTMLTableSectionElement>
> = ({ className = "", ...props }) => (
  <thead
    className={`bg-gradient-to-r from-gray-50 to-gray-100 ${className}`}
    {...props}
  />
);

const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className = "",
  ...props
}) => <tbody className={`divide-y divide-gray-200 ${className}`} {...props} />;

const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  className = "",
  ...props
}) => (
  <tr
    className={`hover:bg-gray-50 transition-colors duration-150 ${className}`}
    {...props}
  />
);

const TableHead: React.FC<
  React.ThHTMLAttributes<HTMLTableHeaderCellElement>
> = ({ className = "", ...props }) => (
  <th
    className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    {...props}
  />
);

const TableCell: React.FC<
  React.TdHTMLAttributes<HTMLTableDataCellElement>
> = ({ className = "", ...props }) => (
  <td
    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}
    {...props}
  />
);

// Filter options interface
interface FilterOption {
  value: string;
  label: string;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: keyof TData;
  title?: string;
  description?: string;
  showPagination?: boolean;
  isLoading?: boolean;
  // New filter props
  enableFilters?: boolean;
  searchPlaceholder?: string;
  statusFilterOptions?: FilterOption[];
  statusFilterKey?: keyof TData;
  enableDateFilter?: boolean;
  dateFilterKey?: keyof TData;
  searchKeys?: string[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  title,
  description,
  showPagination = true,
  isLoading = false,
  enableFilters = false,
  searchPlaceholder = "Search...",
  statusFilterOptions = [],
  statusFilterKey,
  enableDateFilter = false,
  dateFilterKey,
  searchKeys = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Filter states for UI
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Custom filter function for multiple search keys
  const customGlobalFilterFn = (row: any, _columnId: string, value: string) => {
    if (!value) return true;
    
    const searchValue = value.toLowerCase();
    
    // If searchKeys are provided, search in those specific keys
    if (searchKeys.length > 0) {
      return searchKeys.some(key => {
        const keys = key.split('.');
        let cellValue: any = row.original;
        
        // Navigate through nested object properties
        for (const k of keys) {
          cellValue = cellValue?.[k];
        }
        
        return String(cellValue ?? "").toLowerCase().includes(searchValue);
      });
    }
    
    // Fallback to searchKey if provided
    if (searchKey) {
      const cellValue = String(row.getValue(searchKey as string) ?? "").toLowerCase();
      return cellValue.includes(searchValue);
    }
    
    // Search in all visible columns as last resort
    return row.getVisibleCells().some((cell: any) => {
      const cellValue = String(cell.getValue() ?? "").toLowerCase();
      return cellValue.includes(searchValue);
    });
  };

  // Apply additional filters using useMemo for performance
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply global search filter
    if (globalFilter) {
      filtered = filtered.filter((item: any) => 
        customGlobalFilterFn({ original: item, getValue: (key: string) => item[key] }, '', globalFilter)
      );
    }

    // Status filter
    if (statusFilter !== "ALL" && statusFilterKey) {
      filtered = filtered.filter((item: any) => item[statusFilterKey] === statusFilter);
    }
    
    // Date range filter
    if (enableDateFilter && dateFilterKey && (dateFrom || dateTo)) {
      filtered = filtered.filter((item: any) => {
        const rowDate = new Date(item[dateFilterKey as string] as string);
        if (dateFrom && rowDate < new Date(dateFrom)) return false;
        if (dateTo && rowDate > new Date(dateTo)) return false;
        return true;
      });
    }
    
    return filtered;
  }, [data, globalFilter, statusFilter, dateFrom, dateTo, statusFilterKey, dateFilterKey, enableDateFilter, searchKeys]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  // Clear all filters
  const clearAllFilters = () => {
    setGlobalFilter("");
    setStatusFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setColumnFilters([]);
  };

  // Check if any filters are active
  const hasActiveFilters = globalFilter !== "" || statusFilter !== "ALL" || dateFrom !== "" || dateTo !== "";

  return (
    <div className="mx-auto">
      {/* Header */}
      {(title || description) && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
      )}

      {/* Filters */}
      {enableFilters && (
        <div className="bg-white rounded-xl shadow-sm mb-6 p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            {statusFilterOptions.length > 0 && (
              <div className="w-full lg:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Status</SelectItem>
                    {statusFilterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date Range Filter */}
            {enableDateFilter && (
              <>
                <div className="w-full lg:w-40">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="pl-10"
                      placeholder="Dari tanggal"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-40">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="pl-10"
                      placeholder="Sampai tanggal"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="w-full lg:w-auto"
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>

          {/* Filter Results Info */}
          <div className="mt-4 text-sm text-gray-600">
            Menampilkan {filteredData.length} dari {data.length} data
            {globalFilter && (
              <span className="ml-2">
                • Pencarian: "<span className="font-medium">{globalFilter}</span>"
              </span>
            )}
            {statusFilter !== 'ALL' && (
              <span className="ml-2">
                • Status: <span className="font-medium">{statusFilterOptions.find(opt => opt.value === statusFilter)?.label || statusFilter}</span>
              </span>
            )}
            {(dateFrom || dateTo) && (
              <span className="ml-2">
                • Periode: <span className="font-medium">
                  {dateFrom && dateTo ? `${dateFrom} - ${dateTo}` : 
                   dateFrom ? `Dari ${dateFrom}` : 
                   `Sampai ${dateTo}`}
                </span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg relative">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3" />
                      <p className="text-sm text-gray-500">Loading data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
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
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="text-gray-400 mb-3">
                        <Search className="w-12 h-12" />
                      </div>
                      {hasActiveFilters ? (
                        <div>
                          <p className="text-gray-500 mb-2">Tidak ada data yang sesuai dengan filter</p>
                          <Button
                            variant="outline"
                            onClick={clearAllFilters}
                            className="text-sm"
                          >
                            Reset Filter
                          </Button>
                        </div>
                      ) : (
                        <p className="text-gray-500">Tidak ada data tersedia</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {showPagination && table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => table.previousPage()}
                    className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                  const pageIndex = table.getState().pagination.pageIndex;
                  const totalPages = table.getPageCount();
                  
                  let startPage = Math.max(0, pageIndex - 2);
                  const endPage = Math.min(totalPages - 1, startPage + 4);
                  
                  if (endPage - startPage < 4) {
                    startPage = Math.max(0, endPage - 4);
                  }
                  
                  const page = startPage + i;
                  if (page > endPage) return null;
                  
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => table.setPageIndex(page)}
                        isActive={pageIndex === page}
                        className="cursor-pointer"
                      >
                        {page + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => table.nextPage()}
                    className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
