import React from 'react';
import { Clock, CheckSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Progress, EmptyState } from '../../ui';
import { RequestSummary, AllocationSummary } from '../../../types/dashboard';

interface ResourceStatusBreakdownProps {
  requestSummary: RequestSummary | null;
  allocationSummary: AllocationSummary | null;
  loading: boolean;
}

export const ResourceStatusBreakdown: React.FC<ResourceStatusBreakdownProps> = ({
  requestSummary,
  allocationSummary,
  loading,
}) => {
  if (loading || !requestSummary || !allocationSummary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 h-[280px] animate-pulse bg-white border-[#E8E0D0]">
          <div className="h-4 bg-[#F4F0E6] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-[#FBF9F3] rounded"></div>
            <div className="h-3 bg-[#FBF9F3] rounded"></div>
            <div className="h-3 bg-[#FBF9F3] rounded"></div>
          </div>
        </Card>
        <Card className="p-5 h-[280px] animate-pulse bg-white border-[#E8E0D0]">
          <div className="h-4 bg-[#F4F0E6] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-[#FBF9F3] rounded"></div>
            <div className="h-3 bg-[#FBF9F3] rounded"></div>
            <div className="h-3 bg-[#FBF9F3] rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  const hasRequests = requestSummary.totalRequests > 0;
  const hasAllocations = allocationSummary.totalAllocations > 0;

  const getPercent = (count: number, total: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Request Pipeline Status */}
      <Card className="p-5 flex flex-col justify-between border-[#D8C9A8] bg-white shadow-none">
        <CardHeader className="p-0 pb-3 flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-serif font-bold text-[#202020] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#B8A16A]" />
              Resource Requests Pipeline
            </CardTitle>
            <CardDescription className="text-xs text-[#77736A] mt-0.5">
              Requisitions across academic space & hostel rooms
            </CardDescription>
          </div>
          <span className="text-xs font-serif font-bold text-[#202020] bg-[#FBF9F3] border border-[#E8E0D0] px-2 py-0.5 rounded">
            {requestSummary.totalRequests} Total
          </span>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col justify-center space-y-3">
          {!hasRequests ? (
            <EmptyState
              title="No requests submitted"
              description="No resource or room requests have been filed yet."
              icon={Clock}
              compact
            />
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#A87928] font-medium">Pending Review</span>
                  <span className="font-serif text-[#202020] font-medium">
                    {requestSummary.pending} ({getPercent(requestSummary.pending, requestSummary.totalRequests)}%)
                  </span>
                </div>
                <Progress value={getPercent(requestSummary.pending, requestSummary.totalRequests)} color="warning" size="sm" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#3F7655] font-medium">Approved</span>
                  <span className="font-serif text-[#202020] font-medium">
                    {requestSummary.approved} ({getPercent(requestSummary.approved, requestSummary.totalRequests)}%)
                  </span>
                </div>
                <Progress value={getPercent(requestSummary.approved, requestSummary.totalRequests)} color="success" size="sm" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#B8A16A] font-medium">Completed</span>
                  <span className="font-serif text-[#202020] font-medium">
                    {requestSummary.completed} ({getPercent(requestSummary.completed, requestSummary.totalRequests)}%)
                  </span>
                </div>
                <Progress value={getPercent(requestSummary.completed, requestSummary.totalRequests)} color="primary" size="sm" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#B44747] font-medium">Rejected / Cancelled</span>
                  <span className="font-serif text-[#202020] font-medium">
                    {requestSummary.rejected + requestSummary.cancelled} ({getPercent(requestSummary.rejected + requestSummary.cancelled, requestSummary.totalRequests)}%)
                  </span>
                </div>
                <Progress value={getPercent(requestSummary.rejected + requestSummary.cancelled, requestSummary.totalRequests)} color="danger" size="sm" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Allocation Lifecycle Status */}
      <Card className="p-5 flex flex-col justify-between border-[#D8C9A8] bg-white shadow-none">
        <CardHeader className="p-0 pb-3 flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-serif font-bold text-[#202020] flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#3F7655]" />
              Allocation Lifecycle Status
            </CardTitle>
            <CardDescription className="text-xs text-[#77736A] mt-0.5">
              Active, scheduled, and past allocation records
            </CardDescription>
          </div>
          <span className="text-xs font-serif font-bold text-[#202020] bg-[#FBF9F3] border border-[#E8E0D0] px-2 py-0.5 rounded">
            {allocationSummary.totalAllocations} Total
          </span>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col justify-center space-y-3">
          {!hasAllocations ? (
            <EmptyState
              title="No allocations recorded"
              description="No physical resources or hostel beds are currently allocated."
              icon={CheckSquare}
              compact
            />
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#3F7655] font-medium">Active Allocations</span>
                  <span className="font-serif text-[#202020] font-medium">
                    {allocationSummary.active} ({getPercent(allocationSummary.active, allocationSummary.totalAllocations)}%)
                  </span>
                </div>
                <Progress value={getPercent(allocationSummary.active, allocationSummary.totalAllocations)} color="success" size="sm" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#A87928] font-medium">Pending Activation</span>
                  <span className="font-serif text-[#202020] font-medium">
                    {allocationSummary.pending} ({getPercent(allocationSummary.pending, allocationSummary.totalAllocations)}%)
                  </span>
                </div>
                <Progress value={getPercent(allocationSummary.pending, allocationSummary.totalAllocations)} color="warning" size="sm" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#B8A16A] font-medium">Completed Terms</span>
                  <span className="font-serif text-[#202020] font-medium">
                    {allocationSummary.completed} ({getPercent(allocationSummary.completed, allocationSummary.totalAllocations)}%)
                  </span>
                </div>
                <Progress value={getPercent(allocationSummary.completed, allocationSummary.totalAllocations)} color="primary" size="sm" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#B44747] font-medium">Cancelled</span>
                  <span className="font-serif text-[#202020] font-medium">
                    {allocationSummary.cancelled} ({getPercent(allocationSummary.cancelled, allocationSummary.totalAllocations)}%)
                  </span>
                </div>
                <Progress value={getPercent(allocationSummary.cancelled, allocationSummary.totalAllocations)} color="danger" size="sm" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
