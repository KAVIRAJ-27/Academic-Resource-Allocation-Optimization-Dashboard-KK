import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className, lines = 3 }) => {
  return (
    <div className={cn('bg-white border border-[#D8C9A8] rounded-xl p-5 animate-pulse space-y-4 shadow-card', className)}>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-[#F4F0E6] rounded w-1/3" />
        <div className="h-7 w-7 bg-[#F4F0E6] rounded-lg" />
      </div>
      <div className="h-8 bg-[#F4F0E6] rounded w-1/2" />
      <div className="space-y-2 pt-2 border-t border-[#E8E0D0]">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className="h-3 bg-[#F4F0E6] rounded"
            style={{ width: `${85 - idx * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
};
