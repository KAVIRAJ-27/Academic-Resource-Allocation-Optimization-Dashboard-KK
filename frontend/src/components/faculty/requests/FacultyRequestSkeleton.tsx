import React from 'react';

export const FacultyRequestSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4 h-24">
            <div className="flex justify-between items-center mb-2">
              <div className="h-3 bg-gray-800 rounded w-16" />
              <div className="w-4 h-4 bg-gray-800 rounded" />
            </div>
            <div className="h-6 bg-gray-800 rounded w-8" />
          </div>
        ))}
      </div>

      {/* Filter bar Skeleton */}
      <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-4 h-16 flex items-center gap-4">
        <div className="h-9 bg-gray-800 rounded-lg flex-1" />
        <div className="h-9 bg-gray-800 rounded-lg w-48" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#11141C] border border-[#1E2330] rounded-xl p-5 h-80">
        <div className="h-4 bg-gray-800 rounded w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-800/50 rounded w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};
