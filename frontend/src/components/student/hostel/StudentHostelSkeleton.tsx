import React from 'react';
import { Card } from '../../ui';

export const StudentHostelSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Banner Skeleton */}
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1E2330]" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-[#1E2330] rounded-lg" />
              <div className="h-4 w-72 bg-slate-50 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-12 w-20 bg-[#1E2330] rounded-xl" />
            <div className="h-12 w-20 bg-[#1E2330] rounded-xl" />
          </div>
        </div>
      </Card>

      {/* Hierarchy Skeleton */}
      <Card className="p-5 bg-white border-slate-200 space-y-3">
        <div className="h-4 w-40 bg-[#1E2330] rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-slate-50 border border-slate-200 rounded-xl" />
          ))}
        </div>
      </Card>

      {/* Room & Bed Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-white border-slate-200 space-y-3">
          <div className="h-5 w-36 bg-[#1E2330] rounded" />
          <div className="h-24 bg-slate-50 rounded-xl" />
        </Card>
        <Card className="p-5 bg-white border-slate-200 space-y-3">
          <div className="h-5 w-36 bg-[#1E2330] rounded" />
          <div className="h-24 bg-slate-50 rounded-xl" />
        </Card>
      </div>

      {/* Facilities Skeleton */}
      <Card className="p-5 bg-white border-slate-200 space-y-3">
        <div className="h-5 w-44 bg-[#1E2330] rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </Card>
    </div>
  );
};
