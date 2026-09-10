import React from 'react';
import { Card } from '../../../ui';

export const HostelRequestSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-3.5 bg-[#11141C] border-[#1E2330]">
            <div className="flex justify-between mb-2">
              <div className="h-3 w-16 bg-[#1E2330] rounded animate-pulse" />
              <div className="h-6 w-6 bg-[#1E2330] rounded-lg animate-pulse" />
            </div>
            <div className="h-6 w-8 bg-[#1E2330] rounded animate-pulse" />
          </Card>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="p-4 bg-[#11141C] border border-[#1E2330] rounded-xl flex justify-between">
        <div className="h-9 w-64 bg-[#1E2330] rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-[#1E2330] rounded-lg animate-pulse" />
          <div className="h-9 w-28 bg-[#1E2330] rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Table Skeleton */}
      <Card className="bg-[#11141C] border-[#1E2330] p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 border-b border-[#1E2330] last:border-0"
          >
            <div className="space-y-1.5">
              <div className="h-4 w-40 bg-[#1E2330] rounded animate-pulse" />
              <div className="h-3 w-64 bg-[#1E2330] rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-16 bg-[#1E2330] rounded animate-pulse" />
              <div className="h-6 w-20 bg-[#1E2330] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
