import React from 'react';
import { Card } from '../../ui/Card';
import { Skeleton } from '../../ui/Skeleton';

export const HodDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <Card className="p-6 border border-gray-800 bg-gray-900/60 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-64 bg-gray-800 rounded-lg" />
              <Skeleton className="h-6 w-20 bg-gray-800 rounded-full" />
            </div>
            <Skeleton className="h-4 w-96 bg-gray-800/80 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-28 bg-gray-800 rounded-lg" />
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Skeleton className="h-12 bg-gray-800/50 rounded-lg" />
          <Skeleton className="h-12 bg-gray-800/50 rounded-lg" />
          <Skeleton className="h-12 bg-gray-800/50 rounded-lg" />
          <Skeleton className="h-12 bg-gray-800/50 rounded-lg" />
        </div>
      </Card>

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="p-5 border border-gray-800 bg-gray-900/40">
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-4 w-24 bg-gray-800 rounded" />
              <Skeleton className="h-8 w-8 bg-gray-800 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-16 bg-gray-800 rounded-lg mb-2" />
            <Skeleton className="h-3 w-32 bg-gray-800/60 rounded" />
          </Card>
        ))}
      </div>

      {/* 2-Column Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-gray-800 bg-gray-900/40">
          <Skeleton className="h-6 w-48 bg-gray-800 rounded mb-4" />
          <Skeleton className="h-64 w-full bg-gray-800/50 rounded-xl" />
        </Card>
        <Card className="p-6 border border-gray-800 bg-gray-900/40">
          <Skeleton className="h-6 w-48 bg-gray-800 rounded mb-4" />
          <Skeleton className="h-64 w-full bg-gray-800/50 rounded-xl" />
        </Card>
      </div>

      {/* Bottom Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 border border-gray-800 bg-gray-900/40 lg:col-span-2">
          <Skeleton className="h-6 w-48 bg-gray-800 rounded mb-4" />
          <Skeleton className="h-48 w-full bg-gray-800/50 rounded-xl" />
        </Card>
        <Card className="p-6 border border-gray-800 bg-gray-900/40">
          <Skeleton className="h-6 w-48 bg-gray-800 rounded mb-4" />
          <Skeleton className="h-48 w-full bg-gray-800/50 rounded-xl" />
        </Card>
      </div>
    </div>
  );
};
