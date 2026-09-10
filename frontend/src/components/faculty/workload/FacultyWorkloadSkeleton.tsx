import React from 'react';

export const FacultyWorkloadSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#11141C] border border-[#1E2330] rounded-xl p-5 h-32">
            <div className="flex justify-between items-center mb-3">
              <div className="h-3 bg-gray-800 rounded w-24" />
              <div className="w-8 h-8 bg-gray-800 rounded-lg" />
            </div>
            <div className="h-6 bg-gray-800 rounded w-16 mb-4" />
            <div className="h-3 bg-gray-800 rounded w-32" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-5 h-72">
        <div className="h-4 bg-gray-800 rounded w-48 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-32 mb-6" />
        <div className="h-48 bg-gray-800/40 rounded w-full" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-5 h-64">
        <div className="h-4 bg-gray-800 rounded w-44 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-gray-800/50 rounded w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};
