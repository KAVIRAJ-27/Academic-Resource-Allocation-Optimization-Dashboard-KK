import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { Pagination } from '../ui/Pagination';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  accessor?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (item: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalRecords?: number;
    pageSize?: number;
  };
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load records from server.',
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no active entries available for this view.',
  onRowClick,
  pagination,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a: any, b: any) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'string') {
        return sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
  }, [data, sortKey, sortDirection]);

  return (
    <Card className={cn('overflow-hidden p-0 border-[#1E2330] bg-[#11141C]', className)}>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1E2330] bg-[#141822] text-[11px] font-semibold text-gray-400 uppercase tracking-wider select-none">
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width }}
                    className={cn(
                      'py-3.5 px-4 font-semibold',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.sortable && 'cursor-pointer hover:text-white transition-colors',
                      col.className
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        col.align === 'center' && 'justify-center',
                        col.align === 'right' && 'justify-end'
                      )}
                    >
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="text-gray-500">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-teal-400" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-teal-400" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 text-gray-600" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 text-xs text-gray-300">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, r) => (
                <tr key={`skeleton-${r}`}>
                  {columns.map((col) => (
                    <td key={`skeleton-col-${col.key}`} className="py-4 px-4">
                      <Skeleton className="h-4 w-4/5" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                    <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-white">Error Loading Data</div>
                    <p className="text-xs text-gray-400">{errorMessage}</p>
                    {onRetry && (
                      <Button variant="outline" size="sm" onClick={onRetry} iconLeft={<RefreshCw className="w-3.5 h-3.5" />}>
                        Retry Connection
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                    <div className="p-3 rounded-2xl bg-white/[0.02] text-gray-500 border border-white/5 mb-1">
                      <Inbox className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <div className="text-sm font-semibold text-gray-300">{emptyTitle}</div>
                    <p className="text-xs text-gray-500">{emptyDescription}</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, idx) => (
                <tr
                  key={keyExtractor(row, idx)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    'transition-colors duration-150',
                    onRowClick ? 'cursor-pointer hover:bg-white/[0.03]' : 'hover:bg-white/[0.015]'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'py-3.5 px-4',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                        col.className
                      )}
                    >
                      {col.accessor ? col.accessor(row) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && !isLoading && !isError && sortedData.length > 0 && (
        <div className="p-4 border-t border-white/5 bg-[#141822]/60">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
            totalRecords={pagination.totalRecords}
            pageSize={pagination.pageSize}
          />
        </div>
      )}
    </Card>
  );
}
