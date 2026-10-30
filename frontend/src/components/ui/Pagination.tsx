import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  totalRecords?: number;
  pageSize?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  totalRecords,
  pageSize,
}) => {
  if (totalPages <= 1 && !totalRecords) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('dots-1');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('dots-2');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-3 text-xs', className)}>
      {totalRecords !== undefined && pageSize !== undefined ? (
        <div className="text-[#77736A] text-[11px] font-mono">
          Showing <span className="text-[#202020] font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{' '}
          <span className="text-[#202020] font-semibold">{Math.min(currentPage * pageSize, totalRecords)}</span> of{' '}
          <span className="text-[#202020] font-semibold">{totalRecords}</span> entries
        </div>
      ) : (
        <div className="text-[#77736A] text-[11px] font-mono">
          Page <span className="text-[#202020] font-semibold">{currentPage}</span> of{' '}
          <span className="text-[#202020] font-semibold">{totalPages}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="xs"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          iconOnly
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </Button>

        {getPageNumbers().map((page, idx) => {
          if (typeof page === 'string') {
            return (
              <span key={`dots-${idx}`} className="px-1.5 text-[#77736A]">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={cn(
                'min-w-[28px] h-7 px-2 rounded-lg font-mono text-xs font-medium transition-colors border shadow-xs',
                isCurrent
                  ? 'bg-[#B8A16A] text-[#202020] border-[#A38C57] font-bold'
                  : 'bg-white hover:bg-[#F4F0E6] text-[#202020] border-[#D8C9A8]'
              )}
            >
              {page}
            </button>
          );
        })}

        <Button
          variant="outline"
          size="xs"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          iconOnly
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
