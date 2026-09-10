import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, columns = 4, className }) => {
  return (
    <div className={cn('bg-[#11141C] border border-[#1E2330] rounded-xl overflow-hidden animate-pulse', className)}>
      {/* Table Header */}
      <div className="bg-[#171A23] p-4 border-b border-[#1E2330] grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-4 bg-[#222838] rounded w-3/4" />
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-[#1E2330]">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="p-4 grid gap-4 items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="h-3.5 bg-[#171A23] rounded"
                style={{ width: `${60 + ((rIdx + cIdx) % 4) * 10}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
