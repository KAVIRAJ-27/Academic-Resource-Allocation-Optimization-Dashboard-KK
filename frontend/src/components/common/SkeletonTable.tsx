import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, columns = 4, className }) => {
  return (
    <div className={cn('bg-white border border-[#D8C9A8] rounded-xl overflow-hidden animate-pulse shadow-card', className)}>
      {/* Table Header */}
      <div className="bg-[#F8F6F0] p-4 border-b border-[#E8E0D0] grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-[#F4F0E6] rounded w-3/4" />
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-[#E8E0D0]">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="p-4 grid gap-4 items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, cIdx) => (
              <div
                key={cIdx}
                className="h-3.5 bg-[#F4F0E6] rounded"
                style={{ width: `${60 + ((rIdx + cIdx) % 4) * 10}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
