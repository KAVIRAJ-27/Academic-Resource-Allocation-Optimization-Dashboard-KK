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
            <h1 className="text-2xl font-serif font-bold tracking-tight text-[#202020] sm:text-3xl">Approval Center</h1>
            <span className="rounded-full border border-[#D8C9A8] bg-[#FBF9F3] px-2.5 py-0.5 text-xs font-semibold text-[#B8A16A]">
              Phase 32
            </span>
          </div>
          <p className="mt-1 text-sm text-[#555555]">
            Review resource allocation requests, evaluate real-time Phase 30 conflict safety, and
            authorize allocations.
          </p>
        </div>

        <button
          onClick={fetchApprovals}
          className="flex items-center gap-2 rounded-xl border border-[#D8C9A8] bg-white px-4 py-2 text-xs font-semibold text-[#202020] hover:bg-[#F4F0E6] transition"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E8D8BA] bg-[#FAF7F0] p-4 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A87928] uppercase tracking-wider">
              Pending My Action
            </span>
            <Clock className="h-5 w-5 text-[#A87928]" />
          </div>
          <p className="mt-2 text-2xl font-serif font-bold text-[#202020]">{pendingCount}</p>
          <p className="text-xs text-[#555555]">Requests requiring authority decision</p>
        </div>

        <div className="rounded-xl border border-[#C2D6C9] bg-[#F0F5F2] p-4 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3F7655] uppercase tracking-wider">
              Conflict-Free Gatekeeper
            </span>
            <CheckCircle2 className="h-5 w-5 text-[#3F7655]" />
          </div>
          <p className="mt-2 text-base font-bold text-[#3F7655]">Phase 30 Active</p>
          <p className="text-xs text-[#555555]">Double-booking blocked before final allocation</p>
        </div>

        <div className="rounded-xl border border-[#D8C9A8] bg-[#FBF9F3] p-4 shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B8A16A] uppercase tracking-wider">
              Allocation Tracking
            </span>
            <ShieldCheck className="h-5 w-5 text-[#B8A16A]" />
          </div>
          <p className="mt-2 text-base font-serif font-bold text-[#202020]">Full Audit History</p>
          <p className="text-xs text-[#555555]">Complete lifecycle timestamps & decisions</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="rounded-xl border border-[#D8C9A8] bg-white shadow-none overflow-hidden">
        {/* Navigation Tabs & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E0D0] p-4 bg-[#F8F6F0]">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveTab('pending');
                setPage(0);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'pending'
                  ? 'border border-[#B8A16A] bg-[#B8A16A] text-[#202020]'
                  : 'bg-white border border-[#D8C9A8] text-[#555555] hover:bg-[#F4F0E6]'
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
                  ? 'border border-[#B8A16A] bg-[#B8A16A] text-[#202020]'
                  : 'bg-white border border-[#D8C9A8] text-[#555555] hover:bg-[#F4F0E6]'
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
                className="rounded-xl border border-[#D9D2C3] bg-white px-3 py-1.5 text-[#202020] font-medium focus:border-[#B8A16A] focus:outline-none"
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
                className="rounded-xl border border-[#D9D2C3] bg-white px-3 py-1.5 text-[#202020] font-medium focus:border-[#B8A16A] focus:outline-none"
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
          <div className="flex items-center justify-between border-t border-[#E8E0D0] px-6 py-3 text-xs text-[#555555] font-medium bg-[#F8F6F0]">
            <span>
              Showing Page {page + 1} of {totalPages} ({totalElements} total requests)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-[#D8C9A8] bg-white px-3 py-1.5 font-semibold text-[#202020] hover:bg-[#F4F0E6] disabled:opacity-50 transition"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[#D8C9A8] bg-white px-3 py-1.5 font-semibold text-[#202020] hover:bg-[#F4F0E6] disabled:opacity-50 transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#202020]/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-[#D8C9A8] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8E0D0] bg-[#F8F6F0] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <Clock className="h-5 w-5 text-[#B8A16A]" />
                <h3 className="text-base font-serif font-bold text-[#202020]">
                  Lifecycle Tracking Timeline
                </h3>
              </div>
              <button
                onClick={() => setTimelineItems(null)}
                className="rounded-lg p-1.5 text-[#77736A] hover:bg-[#F4F0E6] hover:text-[#202020]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <ApprovalTimeline timeline={timelineItems} isLoading={isTimelineLoading} />
            </div>
            <div className="flex justify-end border-t border-[#E8E0D0] bg-[#F8F6F0] px-6 py-3">
              <button
                onClick={() => setTimelineItems(null)}
                className="rounded-xl border border-[#D8C9A8] bg-white px-4 py-2 text-xs font-semibold text-[#202020] hover:bg-[#F4F0E6]"
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
