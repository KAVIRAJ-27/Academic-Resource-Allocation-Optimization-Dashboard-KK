import React from 'react';
import { Card, CardHeader, CardContent, Skeleton } from '../../ui';

export const FacultyAcademicSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-[#1E2330]" />
        <Skeleton className="h-4 w-96 bg-[#171A23]" />
      </div>

      {/* Nav tabs skeleton */}
      <div className="flex gap-2 border-b border-[#1E2330] pb-2">
        <Skeleton className="h-9 w-32 bg-[#171A23] rounded-lg" />
        <Skeleton className="h-9 w-32 bg-[#171A23] rounded-lg" />
        <Skeleton className="h-9 w-32 bg-[#171A23] rounded-lg" />
      </div>

      {/* KPI metric skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl bg-[#11141C] border border-[#1E2330] space-y-3">
            <Skeleton className="h-4 w-24 bg-[#171A23]" />
            <Skeleton className="h-7 w-16 bg-[#1E2330]" />
          </div>
        ))}
      </div>

      {/* Main card skeleton */}
      <Card className="bg-[#11141C] border-[#1E2330]">
        <CardHeader className="border-b border-[#1E2330] pb-4">
          <Skeleton className="h-5 w-48 bg-[#171A23]" />
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full bg-[#171A23] rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
