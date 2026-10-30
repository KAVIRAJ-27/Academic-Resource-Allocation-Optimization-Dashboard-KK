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
            className="h-16 w-full animate-pulse rounded-xl border border-[#D8C9A8] bg-[#FBF9F3]"
          />
        ))}
      </div>
    );
  }

  if (!approvals || approvals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Clock className="mb-3 h-10 w-10 text-[#77736A]" />
        <h3 className="text-base font-serif font-semibold text-[#202020]">No Approvals Found</h3>
        <p className="mt-1 text-xs text-[#555555] max-w-sm">
          No resource allocation requests match your current filters or require your review.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-[#D8C9A8] bg-[#F8F6F0] uppercase tracking-wider text-[11px] text-[#555555] font-semibold">
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
        <tbody className="divide-y divide-[#E8E0D0] bg-white">
          {approvals.map((approval) => (
            <tr
              key={approval.id}
              className="group hover:bg-[#F4F0E6] transition-colors"
            >
              {/* ID */}
              <td className="px-4 py-3.5 font-semibold font-mono text-[#202020]">
                #{approval.id}
              </td>

              {/* Type */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1.5 font-medium">
                  {approval.requestType === 'ACADEMIC_RESOURCE' ? (
                    <span className="flex items-center gap-1 rounded-md bg-[#FBF9F3] border border-[#D8C9A8] px-2 py-0.5 text-[#202020] font-medium">
                      <Building2 size={12} className="text-[#B8A16A]" />
                      Academic
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-md bg-[#FAF7F0] border border-[#E8D8BA] px-2 py-0.5 text-[#A87928] font-medium">
                      <Hotel size={12} className="text-[#A87928]" />
                      Hostel
                    </span>
                  )}
                </div>
              </td>

              {/* Purpose / Item */}
              <td className="px-4 py-3.5">
                <p className="font-semibold text-[#202020] truncate max-w-xs">
                  {approval.purpose || 'Resource Allocation'}
                </p>
                <p className="text-[11px] text-[#555555]">
                  {approval.requestedResourceName
                    ? `Resource: ${approval.requestedResourceName}`
                    : approval.targetDate
                    ? `Date: ${approval.targetDate}`
                    : ''}
                </p>
              </td>

              {/* Requester */}
              <td className="px-4 py-3.5">
                <span className="font-semibold text-[#202020] block">
                  {approval.requestedByName || 'N/A'}
                </span>
                {approval.requestedByRole && (
                  <span className="block text-[10px] text-[#77736A]">
                    {approval.requestedByRole}
                  </span>
                )}
              </td>

              {/* Scope */}
              <td className="px-4 py-3.5 text-[#555555]">
                {approval.departmentName || approval.hostelName || 'General Campus'}
              </td>

              {/* Level */}
              <td className="px-4 py-3.5 font-medium text-[#202020]">
                <span className="rounded bg-[#F8F6F0] text-[#555555] border border-[#E8E0D0] px-2 py-0.5 text-[10px] font-semibold">
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
                    className="flex items-center gap-1 rounded-lg border border-[#D8C9A8] bg-white px-2.5 py-1.5 text-[#202020] font-medium hover:bg-[#F4F0E6] transition"
                    title="View Timeline"
                  >
                    <Clock size={12} className="text-[#77736A]" />
                    <span>Timeline</span>
                  </button>
                  <button
                    onClick={() => onSelectApproval(approval.id)}
                    className="flex items-center gap-1 rounded-lg border border-[#B8A16A] bg-[#B8A16A] px-3 py-1.5 font-semibold text-[#202020] hover:bg-[#a8915a] transition"
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
