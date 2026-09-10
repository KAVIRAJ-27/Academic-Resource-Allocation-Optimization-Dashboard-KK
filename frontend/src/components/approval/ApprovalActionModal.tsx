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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400">
              {approval.requestType === 'ACADEMIC_RESOURCE' ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <Hotel className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                {approval.requestType === 'ACADEMIC_RESOURCE'
                  ? 'Academic Resource Request'
                  : 'Hostel Bed Request'}
              </h2>
              <p className="text-xs text-slate-400">
                ID #{approval.id} • Level: {approval.approvalLevel} • Requester:{' '}
                {approval.requestedByName || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ApprovalStatusBadge status={approval.status} size="sm" />
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Request & Validation Details
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Lifecycle Timeline ({approval.timeline?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
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
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {conflict.canAllocate ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {conflict.canAllocate
                          ? 'Phase 30 Conflict Validation: Clear to Allocate'
                          : 'Phase 30 Conflict Validation: Conflicting Resource'}
                      </p>
                      <p className="mt-0.5 text-[11px] opacity-90">
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
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 text-xs">
                <div>
                  <span className="text-slate-400">Requester:</span>
                  <p className="font-medium text-slate-200">
                    {approval.requestedByName} ({approval.requestedByRole || 'Requester'})
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="font-medium text-slate-200">{approval.requestedByEmail || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Department / Hostel:</span>
                  <p className="font-medium text-slate-200">
                    {approval.departmentName || approval.hostelName || 'General Campus'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Target Date:</span>
                  <p className="font-medium text-slate-200">{approval.targetDate || 'Immediate'}</p>
                </div>

                {approval.requestType === 'ACADEMIC_RESOURCE' ? (
                  <>
                    <div>
                      <span className="text-slate-400">Time Window:</span>
                      <p className="font-medium text-slate-200">
                        {approval.startTime} – {approval.endTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Capacity Requested:</span>
                      <p className="font-medium text-slate-200">{approval.quantity || 1} seats</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-slate-400">Student Roll Number:</span>
                      <p className="font-medium text-slate-200">
                        {approval.studentRollNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Room / Bed:</span>
                      <p className="font-medium text-slate-200">
                        {approval.roomNumber ? `Room ${approval.roomNumber}` : 'Auto Selection'}
                      </p>
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <span className="text-slate-400">Purpose / Description:</span>
                  <p className="mt-0.5 text-slate-300">
                    {approval.purpose || approval.description || 'No description provided.'}
                  </p>
                </div>
              </div>

              {/* Target Candidate Information */}
              {approval.candidateName && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs">
                  <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[10px]">
                    Recommended Resource for Allocation
                  </span>
                  <div className="mt-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-200">{approval.candidateName}</p>
                      <p className="text-slate-400 text-[11px]">
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
                  <label className="text-xs font-medium text-slate-300">
                    Decision Remarks / Comments:
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Enter approval conditions or mandatory rejection reasons..."
                    rows={3}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400">
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
        <div className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
          <div>
            {!approval.canApprove && isPending && (
              <span className="text-xs text-amber-400/90">
                {approval.cannotApproveReason || 'You are not authorized to approve this request.'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
            >
              Close
            </button>
            {isPending && approval.canApprove && (
              <>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-600/20 px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-600/30 transition disabled:opacity-50"
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
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
