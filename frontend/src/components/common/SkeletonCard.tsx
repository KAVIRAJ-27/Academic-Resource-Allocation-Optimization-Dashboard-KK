import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className, lines = 3 }) => {
  return (
    <div className={cn('bg-[#11141C] border border-[#1E2330] rounded-xl p-5 animate-pulse space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-[#1E2330] rounded w-1/3" />
        <div className="h-7 w-7 bg-[#1E2330] rounded-lg" />
      </div>
      <div className="h-8 bg-[#1E2330] rounded w-1/2" />
      <div className="space-y-2 pt-2 border-t border-[#1E2330]/50">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className="h-3 bg-[#1E2330] rounded"
            style={{ width: `${85 - idx * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
};
