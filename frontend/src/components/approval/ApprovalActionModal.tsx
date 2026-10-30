import React, { useState } from 'react';
import { ApprovalDetailDto, ApprovalActionRequestDto } from '../../types/approval';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { ApprovalTimeline } from './ApprovalTimeline';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Hotel,
  Calendar,
  Clock,
  User,
  ShieldAlert,
} from 'lucide-react';

interface ApprovalActionModalProps {
  approval: ApprovalDetailDto | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number, data: ApprovalActionRequestDto) => Promise<void>;
  onReject: (id: number, data: ApprovalActionRequestDto) => Promise<void>;
}

export const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
  approval,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !approval) {
    return null;
  }

  const isPending = approval.status === 'PENDING';
  const conflict = approval.liveConflictCheck;
  const hasBlockingConflict = conflict ? !conflict.canAllocate : false;

  const handleApprove = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onApprove(approval.id, { comments: comment.trim() || undefined });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to approve request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      setError('Please provide a reason or comment before rejecting.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onReject(approval.id, { comments: comment.trim() });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to reject request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#202020]/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-2xl border border-[#D8C9A8] bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E8E0D0] px-6 py-4 bg-[#F8F6F0]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBF9F3] border border-[#D8C9A8] text-[#B8A16A]">
              {approval.requestType === 'ACADEMIC_RESOURCE' ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <Hotel className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#202020]">
                {approval.requestType === 'ACADEMIC_RESOURCE'
                  ? 'Academic Resource Request'
                  : 'Hostel Bed Request'}
              </h2>
              <p className="text-xs text-[#555555]">
                ID #{approval.id} • Level: {approval.approvalLevel} • Requester:{' '}
                {approval.requestedByName || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ApprovalStatusBadge status={approval.status} size="sm" />
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#77736A] hover:bg-[#F4F0E6] hover:text-[#202020] transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E8E0D0] px-6 bg-white">
          <button
            onClick={() => setActiveTab('details')}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'details'
                ? 'border-[#B8A16A] text-[#202020]'
                : 'border-transparent text-[#77736A] hover:text-[#202020]'
            }`}
          >
            Request & Validation Details
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'timeline'
                ? 'border-[#B8A16A] text-[#202020]'
                : 'border-transparent text-[#77736A] hover:text-[#202020]'
            }`}
          >
            Lifecycle Timeline ({approval.timeline?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-[#EBBABA] bg-[#FBF0F0] p-3 text-xs text-[#B44747] font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'details' ? (
            <>
              {/* Live Conflict Status Banner */}
              {conflict && (
                <div
                  className={`rounded-xl border p-4 text-xs ${
                    conflict.canAllocate
                      ? 'border-[#C2D6C9] bg-[#F0F5F2] text-[#3F7655]'
                      : 'border-[#EBBABA] bg-[#FBF0F0] text-[#B44747]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {conflict.canAllocate ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3F7655]" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B44747]" />
                    )}
                    <div>
                      <p className="font-bold">
                        {conflict.canAllocate
                          ? 'Phase 30 Conflict Validation: Clear to Allocate'
                          : 'Phase 30 Conflict Validation: Conflicting Resource'}
                      </p>
                      <p className="mt-0.5 text-[11px] opacity-90 font-medium">
                        {conflict.canAllocate
                          ? 'All hard constraints, double-booking, and scope validations passed.'
                          : conflict.conflicts?.map((c: any) => c.message).join('; ') ||
                            'Resource is occupied or violates scheduling constraints.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Request Specifications Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-[#D8C9A8] bg-[#FBF9F3] p-4 text-xs">
                <div>
                  <span className="text-[#77736A] font-medium">Requester:</span>
                  <p className="font-semibold text-[#202020]">
                    {approval.requestedByName} ({approval.requestedByRole || 'Requester'})
                  </p>
                </div>
                <div>
                  <span className="text-[#77736A] font-medium">Email:</span>
                  <p className="font-semibold text-[#202020]">{approval.requestedByEmail || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[#77736A] font-medium">Department / Hostel:</span>
                  <p className="font-semibold text-[#202020]">
                    {approval.departmentName || approval.hostelName || 'General Campus'}
                  </p>
                </div>
                <div>
                  <span className="text-[#77736A] font-medium">Target Date:</span>
                  <p className="font-semibold text-[#202020]">{approval.targetDate || 'Immediate'}</p>
                </div>

                {approval.requestType === 'ACADEMIC_RESOURCE' ? (
                  <>
                    <div>
                      <span className="text-[#77736A] font-medium">Time Window:</span>
                      <p className="font-semibold text-[#202020]">
                        {approval.startTime} – {approval.endTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#77736A] font-medium">Capacity Requested:</span>
                      <p className="font-semibold text-[#202020]">{approval.quantity || 1} seats</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-[#77736A] font-medium">Student Roll Number:</span>
                      <p className="font-semibold text-[#202020]">
                        {approval.studentRollNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#77736A] font-medium">Room / Bed:</span>
                      <p className="font-semibold text-[#202020]">
                        {approval.roomNumber ? `Room ${approval.roomNumber}` : 'Auto Selection'}
                      </p>
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <span className="text-[#77736A] font-medium">Purpose / Description:</span>
                  <p className="mt-0.5 text-[#555555]">
                    {approval.purpose || approval.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Target Candidate Information */}
              {approval.candidateName && (
                <div className="rounded-xl border border-[#E8D8BA] bg-[#FAF7F0] p-4 text-xs">
                  <span className="text-[#A87928] font-bold uppercase tracking-wider text-[10px]">
                    Recommended Resource for Allocation
                  </span>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#202020]">{approval.candidateName}</p>
                      <p className="text-[#555555] text-[11px]">
                        Code: {approval.candidateCode} • Capacity: {approval.candidateCapacity} seats
                        {approval.candidateLocation ? ` • ${approval.candidateLocation}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks / Action Comment Input */}
              {isPending && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#202020]">
                    Decision Remarks / Comments:
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter approval conditions or mandatory rejection reasons..."
                    rows={3}
                    className="w-full rounded-xl border border-[#D9D2C3] bg-white p-3 text-xs text-[#202020] placeholder-[#77736A] focus:border-[#B8A16A] focus:outline-none focus:ring-1 focus:ring-[#B8A16A] shadow-none"
                  />
                  <p className="text-[10px] text-[#77736A]">
                    Remarks are optional for approvals, but mandatory when declining a request.
                  </p>
                </div>
              )}
            </>
          ) : (
            <ApprovalTimeline timeline={approval.timeline} />
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#E8E0D0] px-6 py-4 bg-[#F8F6F0]">
          <div>
            {!approval.canApprove && isPending && (
              <span className="text-xs text-[#A87928] font-medium">
                {approval.cannotApproveReason || 'You are not authorized to approve this request.'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-[#D8C9A8] bg-white px-4 py-2 text-xs font-semibold text-[#202020] hover:bg-[#F4F0E6] transition"
            >
              Close
            </button>
            {isPending && approval.canApprove && (
              <>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl border border-[#EBBABA] bg-[#FBF0F0] px-4 py-2 text-xs font-semibold text-[#B44747] hover:bg-[#fae3e3] transition disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reject Request
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={isSubmitting || hasBlockingConflict}
                  title={
                    hasBlockingConflict
                      ? 'Cannot approve: Phase 30 detected a conflict'
                      : 'Approve and allocate resource'
                  }
                  className="flex items-center gap-1.5 rounded-xl border border-[#3F7655] bg-[#3F7655] px-4 py-2 text-xs font-semibold text-white hover:bg-[#325e44] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve & Allocate
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
