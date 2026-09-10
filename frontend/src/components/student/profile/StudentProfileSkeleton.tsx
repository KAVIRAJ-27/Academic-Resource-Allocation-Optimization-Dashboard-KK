import React from 'react';
import { Card, CardContent } from '../../ui';

export const StudentProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <Card className="p-6 bg-[#11141C] border-[#1E2330]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1E2330]" />
            <div className="space-y-2">
              <div className="h-5 w-44 bg-[#1E2330] rounded-lg" />
              <div className="h-3 w-64 bg-[#171A23] rounded" />
            </div>
          </div>
          <div className="h-8 w-28 bg-[#1E2330] rounded-xl" />
        </div>
      </Card>

      {/* Main Form Skeleton */}
      <Card className="bg-[#11141C] border-[#1E2330]">
        <CardContent className="p-6 space-y-4">
          <div className="h-4 w-48 bg-[#1E2330] rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-10 bg-[#171A23] rounded-xl border border-[#1E2330]" />
            <div className="h-10 bg-[#171A23] rounded-xl border border-[#1E2330]" />
            <div className="h-10 bg-[#171A23] rounded-xl border border-[#1E2330]" />
            <div className="h-10 bg-[#171A23] rounded-xl border border-[#1E2330]" />
          </div>
        </CardContent>
      </Card>

      {/* Academic & Account Skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-[#11141C] border-[#1E2330]">
          <div className="space-y-3">
            <div className="h-4 w-36 bg-[#1E2330] rounded" />
            <div className="h-16 bg-[#171A23] rounded-xl border border-[#1E2330]" />
          </div>
        </Card>
        <Card className="p-6 bg-[#11141C] border-[#1E2330]">
          <div className="space-y-3">
            <div className="h-4 w-36 bg-[#1E2330] rounded" />
            <div className="h-16 bg-[#171A23] rounded-xl border border-[#1E2330]" />
          </div>
        </Card>
      </div>
    </div>
  );
};
