import React from 'react';
import { Card, CardContent } from '../../ui';

export const StudentAcademicSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Overview Banner Skeleton */}
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2.5">
            <div className="h-6 w-48 bg-[#1E2330] rounded-lg" />
            <div className="h-4 w-72 bg-slate-50 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 bg-[#1E2330] rounded-lg" />
            <div className="h-8 w-24 bg-[#1E2330] rounded-lg" />
          </div>
        </div>
      </Card>

      {/* Grid Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 bg-white border-slate-200">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-[#1E2330] rounded" />
              <div className="h-6 w-32 bg-slate-50 rounded-lg" />
              <div className="h-2 w-16 bg-[#1E2330] rounded" />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <Card className="bg-white border-slate-200">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 bg-[#1E2330] rounded" />
            <div className="h-8 w-48 bg-slate-50 rounded-lg" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="h-14 bg-slate-50 rounded-xl border border-slate-200" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
