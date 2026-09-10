import React from 'react';
import { ApprovalSummaryDto } from '../../types/approval';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { Building2, Hotel, Eye, Clock, ChevronRight } from 'lucide-react';

interface ApprovalTableProps {
  approvals: ApprovalSummaryDto[];
  isLoading: boolean;
  onSelectApproval: (id: number) => void;
  onViewTimeline: (id: number) => void;
}

export const ApprovalTable: React.FC<ApprovalTableProps> = ({
  approvals,
  isLoading,
  onSelectApproval,
  onViewTimeline,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded-xl border border-slate-800 bg-slate-900/50"
          />
        ))}
      </div>
    );
  }

  if (!approvals || approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Clock className="mb-3 h-10 w-10 text-slate-600" />
        <h3 className="text-base font-semibold text-slate-300">No Approvals Found</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          No resource allocation requests match your current filters or require your review.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-800 bg-slate-950/60 uppercase tracking-wider text-[11px] text-slate-400">
          <tr>
            <th className="px-4 py-3.5">ID</th>
            <th className="px-4 py-3.5">Type</th>
            <th className="px-4 py-3.5">Purpose / Item</th>
            <th className="px-4 py-3.5">Requester</th>
            <th className="px-4 py-3.5">Scope</th>
            <th className="px-4 py-3.5">Level</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {approvals.map((approval) => (
            <tr
              key={approval.id}
              className="group hover:bg-slate-800/40 transition-colors"
            >
              {/* ID */}
              <td className="px-4 py-3.5 font-medium text-slate-300">
                #{approval.id}
              </td>

              {/* Type */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5 font-medium">
                  {approval.requestType === 'ACADEMIC_RESOURCE' ? (
                    <span className="flex items-center gap-1 rounded bg-indigo-500/10 px-2 py-0.5 text-indigo-400">
                      <Building2 size={12} />
                      Academic
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-0.5 text-cyan-400">
                      <Hotel size={12} />
                      Hostel
                    </span>
                  )}
                </div>
              </td>

              {/* Purpose / Item */}
              <td className="px-4 py-3.5">
                <p className="font-medium text-slate-200 truncate max-w-xs">
                  {approval.purpose || 'Resource Allocation'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {approval.requestedResourceName
                    ? `Resource: ${approval.requestedResourceName}`
                    : approval.targetDate
                    ? `Date: ${approval.targetDate}`
                    : ''}
                </p>
              </td>

              {/* Requester */}
              <td className="px-4 py-3.5">
                <span className="font-medium text-slate-300">
                  {approval.requestedByName || 'N/A'}
                </span>
                {approval.requestedByRole && (
                  <span className="block text-[10px] text-slate-500">
                    {approval.requestedByRole}
                  </span>
                )}
              </td>

              {/* Scope */}
              <td className="px-4 py-3.5 text-slate-400">
                {approval.departmentName || approval.hostelName || 'General Campus'}
              </td>

              {/* Level */}
              <td className="px-4 py-3.5 font-medium text-slate-300">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px]">
                  {approval.approvalLevel}
                </span>
              </td>

              {/* Status */}
              <td className="px-4 py-3.5">
                <ApprovalStatusBadge status={approval.status} size="sm" />
              </td>

              {/* Actions */}
              <td className="px-4 py-3.5 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onViewTimeline(approval.id)}
                    className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-slate-300 hover:bg-slate-700 transition"
                    title="View Timeline"
                  >
                    <Clock size={12} />
                    <span>Timeline</span>
                  </button>
                  <button
                    onClick={() => onSelectApproval(approval.id)}
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white shadow-sm hover:bg-indigo-500 transition"
                  >
                    <span>{approval.status === 'PENDING' ? 'Review' : 'Details'}</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
