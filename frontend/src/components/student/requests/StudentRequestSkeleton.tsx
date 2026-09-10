import React from 'react';
import { Card } from '../../ui';

export const StudentRequestSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="p-3.5 bg-[#11141C] border-[#1E2330]">
            <div className="flex items-center justify-between mb-2">
              <div className="h-3 w-16 bg-[#1E2330] rounded" />
              <div className="w-6 h-6 rounded-lg bg-[#1E2330]" />
            </div>
            <div className="h-6 w-10 bg-[#171A23] rounded" />
          </Card>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-14 bg-[#11141C] border border-[#1E2330] rounded-xl" />

      {/* Table Skeleton */}
      <Card className="bg-[#11141C] border-[#1E2330] overflow-hidden">
        <div className="p-4 border-b border-[#1E2330]">
          <div className="h-4 w-32 bg-[#1E2330] rounded" />
        </div>
        <div className="divide-y divide-[#1E2330]">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1E2330]" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 bg-[#1E2330] rounded" />
                  <div className="h-3 w-28 bg-[#171A23] rounded" />
                </div>
              </div>
              <div className="hidden sm:block space-y-1.5">
                <div className="h-4 w-24 bg-[#1E2330] rounded" />
                <div className="h-3 w-32 bg-[#171A23] rounded" />
              </div>
              <div className="h-6 w-20 bg-[#1E2330] rounded-full" />
              <div className="h-8 w-16 bg-[#1E2330] rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
