import React from 'react';
import { Modal, Button } from '../../../ui';
import { StudentHostelComplaint } from '../../../../types/studentHostelComplaint';
import {
  ComplaintStatusBadge,
  ComplaintPriorityBadge,
  ComplaintCategoryBadge,
} from './HostelComplaintBadges';
import { Hotel, Clock, CheckCircle2, UserCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  complaint: StudentHostelComplaint | null;
  loading: boolean;
}

export const HostelComplaintDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  complaint,
}) => {
  if (!complaint) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hostel Complaint #HC-${String(complaint.id).padStart(4, '0')}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#0C0E14] border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2">
            <ComplaintCategoryBadge category={complaint.category} />
            <ComplaintPriorityBadge priority={complaint.priority} />
          </div>
          <div>
            <ComplaintStatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Title */}
        <div className="p-3.5 bg-[#0C0E14] border border-slate-200 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider block mb-1">
            Complaint Subject
          </span>
          <h4 className="text-sm font-semibold text-slate-900">{complaint.title}</h4>
        </div>

        {/* Location & Timestamps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Hostel Context */}
          <div className="p-3 bg-[#0C0E14] border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Hotel className="w-3.5 h-3.5 text-teal-400" />
              Premises Context
            </span>
            <p className="text-xs font-medium text-white">{complaint.hostelName || 'Hostel'}</p>
            {complaint.roomNumber && (
              <p className="text-[11px] text-gray-400">Allocated Room: {complaint.roomNumber}</p>
            )}
          </div>

          {/* Submission Details */}
          <div className="p-3 bg-[#0C0E14] border border-slate-200 rounded-xl space-y-1">
            <span className="text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              Lodged On
            </span>
            <p className="text-xs text-gray-200">
              {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            <p className="text-[11px] text-gray-400">
              {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="p-4 bg-[#0C0E14] border border-slate-200 rounded-xl space-y-2">
          <span className="text-[11px] font-semibold text-slate-600 font-bold uppercase tracking-wider">
            Issue Description
          </span>
          <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-line">
            {complaint.description}
          </p>
        </div>

        {/* Resolution Information if exists */}
        {(complaint.status === 'RESOLVED' || complaint.status === 'CLOSED' || complaint.resolvedAt) && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Resolution Information</span>
            </div>
            {complaint.resolvedAt && (
              <p className="text-xs text-gray-300">
                Resolved on: {new Date(complaint.resolvedAt).toLocaleString()}
              </p>
            )}
            {complaint.assignedToName && (
              <p className="text-xs text-gray-300 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                Handled by: {complaint.assignedToName}
              </p>
            )}
          </div>
        )}

        {/* Action Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-200">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-slate-200 text-gray-300"
          >
            Close Details
          </Button>
        </div>
      </div>
    </Modal>
  );
};
