import React from 'react';
import { Skeleton } from '../../ui';

export const FacultyDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading faculty dashboard">
      {/* Header Skeleton */}
      <div className="p-6 bg-[#11141C] border border-[#1E2330] rounded-2xl flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-28 bg-[#171A23]" />
          <Skeleton className="h-8 w-64 bg-[#171A23]" />
          <Skeleton className="h-4 w-96 bg-[#171A23]" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-xl bg-[#171A23]" />
          <Skeleton className="h-10 w-36 rounded-xl bg-[#171A23]" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-[#11141C] border border-[#1E2330] rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24 bg-[#171A23]" />
              <Skeleton className="h-8 w-8 rounded-lg bg-[#171A23]" />
            </div>
            <Skeleton className="h-9 w-20 bg-[#171A23]" />
            <Skeleton className="h-3 w-36 bg-[#171A23]" />
          </div>
        ))}
      </div>

      {/* Profile and Workload Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-6 bg-[#11141C] border border-[#1E2330] rounded-2xl space-y-4">
          <Skeleton className="h-5 w-40 bg-[#171A23]" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl bg-[#171A23]" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32 bg-[#171A23]" />
              <Skeleton className="h-4 w-24 bg-[#171A23]" />
            </div>
          </div>
          <div className="space-y-2.5 pt-2">
            <Skeleton className="h-4 w-full bg-[#171A23]" />
            <Skeleton className="h-4 w-full bg-[#171A23]" />
            <Skeleton className="h-4 w-3/4 bg-[#171A23]" />
          </div>
        </div>

        <div className="lg:col-span-2 p-6 bg-[#11141C] border border-[#1E2330] rounded-2xl space-y-4">
          <Skeleton className="h-5 w-48 bg-[#171A23]" />
          <div className="grid grid-cols-3 gap-4 pt-2">
            <Skeleton className="h-20 rounded-xl bg-[#171A23]" />
            <Skeleton className="h-20 rounded-xl bg-[#171A23]" />
            <Skeleton className="h-20 rounded-xl bg-[#171A23]" />
          </div>
          <Skeleton className="h-16 rounded-xl bg-[#171A23]" />
        </div>
      </div>

      {/* Tables Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-[#11141C] border border-[#1E2330] rounded-2xl space-y-4">
          <Skeleton className="h-5 w-36 bg-[#171A23]" />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-14 rounded-xl bg-[#171A23]" />
            ))}
          </div>
        </div>

        <div className="p-6 bg-[#11141C] border border-[#1E2330] rounded-2xl space-y-4">
          <Skeleton className="h-5 w-36 bg-[#171A23]" />
          <div className="space-y-3">
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} className="h-14 rounded-xl bg-[#171A23]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
