import React, { useState, useEffect, useCallback } from 'react';
import { approvalApi } from '../../services/api/approvalApi';
import {
  ApprovalSummaryDto,
  ApprovalDetailDto,
  ApprovalStatus,
  AllocationTimelineItemDto,
  ApprovalActionRequestDto,
} from '../../types/approval';
import { ApprovalTable } from '../../components/approval/ApprovalTable';
import { ApprovalActionModal } from '../../components/approval/ApprovalActionModal';
import { ApprovalTimeline } from '../../components/approval/ApprovalTimeline';
import { useToast } from '../../components/ui/Toast';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
  X,
} from 'lucide-react';

export const ApprovalCenterPage: React.FC = () => {
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [approvals, setApprovals] = useState<ApprovalSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Selected for review modal
  const [selectedApproval, setSelectedApproval] = useState<ApprovalDetailDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Standalone timeline modal
  const [timelineItems, setTimelineItems] = useState<AllocationTimelineItemDto[] | null>(null);
  const [isTimelineLoading, setIsTimelineLoading] = useState(false);

  // Summary counts
  const [pendingCount, setPendingCount] = useState(0);

  const fetchApprovals = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'pending') {
        const res = await approvalApi.getPendingApprovals(page, 10);
        setApprovals(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
        setPendingCount(res.totalElements);
      } else {
        const res = await approvalApi.getApprovals(
          {
            requestType: selectedType || undefined,
            status: (selectedStatus as ApprovalStatus) || undefined,
          },
          page,
          10
        );
        setApprovals(res.content);
        setTotalPages(res.totalPages);
        setTotalElements(res.totalElements);
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load approvals');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, selectedType, selectedStatus, error]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleSelectApproval = async (id: number) => {
    setIsDetailLoading(true);
    try {
      const detail = await approvalApi.getApprovalById(id);
      setSelectedApproval(detail);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load approval details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleViewTimeline = async (id: number) => {
    setIsTimelineLoading(true);
    setTimelineItems([]);
    try {
      const items = await approvalApi.getApprovalTimeline(id);
      setTimelineItems(items);
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load timeline');
    } finally {
      setIsTimelineLoading(false);
    }
  };

  const handleApprove = async (id: number, data: ApprovalActionRequestDto) => {
    try {
      await approvalApi.approve(id, data);
      success('Request approved and resource successfully allocated.');
      setSelectedApproval(null);
      fetchApprovals();
    } catch (err: any) {
      throw err;
    }
  };

  const handleReject = async (id: number, data: ApprovalActionRequestDto) => {
    try {
      await approvalApi.reject(id, data);
      info('Request rejected successfully.');
      setSelectedApproval(null);
      fetchApprovals();
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">Approval Center</h1>
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
              Phase 32
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Review resource allocation requests, evaluate real-time Phase 30 conflict safety, and
            authorize allocations.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
              Pending My Action
            </span>
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-100">{pendingCount}</p>
          <p className="text-xs text-slate-400">Requests requiring authority decision</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              Conflict-Free Gatekeeper
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-2 text-base font-semibold text-emerald-300">Phase 30 Active</p>
          <p className="text-xs text-slate-400">Double-booking blocked before final allocation</p>
        </div>

        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">
              Allocation Tracking
            </span>
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
          </div>
          <p className="mt-2 text-base font-semibold text-indigo-300">Full Audit History</p>
          <p className="text-xs text-slate-400">Complete lifecycle timestamps & decisions</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
        {/* Navigation Tabs & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 p-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('pending');
                setPage(0);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'pending'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Clock size={14} />
              Pending Review ({pendingCount})
            </button>
            <button
              onClick={() => {
                setActiveTab('all');
                setPage(0);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Filter size={14} />
              All Approvals
            </button>
          </div>

          {activeTab === 'all' && (
            <div className="flex items-center gap-2 text-xs">
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(0);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">All Domains</option>
                <option value="ACADEMIC_RESOURCE">Academic Resources</option>
                <option value="HOSTEL_RESOURCE">Hostel Beds</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(0);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-slate-300 focus:border-indigo-500 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        {/* Approvals Table */}
        <ApprovalTable
          approvals={approvals}
          isLoading={isLoading}
          onSelectApproval={handleSelectApproval}
          onViewTimeline={handleViewTimeline}
        />

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3 text-xs text-slate-400">
            <span>
              Showing Page {page + 1} of {totalPages} ({totalElements} total requests)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review / Approve / Reject Modal */}
      {selectedApproval && (
        <ApprovalActionModal
          approval={selectedApproval}
          isOpen={Boolean(selectedApproval)}
          onClose={() => setSelectedApproval(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Standalone Timeline Modal */}
      {timelineItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-semibold text-slate-100">
                  Lifecycle Tracking Timeline
                </h3>
              </div>
              <button
                onClick={() => setTimelineItems(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <ApprovalTimeline timeline={timelineItems} isLoading={isTimelineLoading} />
            </div>
            <div className="flex justify-end border-t border-slate-800 px-6 py-3">
              <button
                onClick={() => setTimelineItems(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
