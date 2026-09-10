import React from 'react';
import { RequestStatus, PriorityLevel } from '../../../types/studentResourceRequest';
import { Clock, CheckCircle2, XCircle, Ban, CheckCheck, AlertCircle, AlertTriangle, Info, Zap } from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus;
}

export const StudentRequestStatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25">
          <Clock className="w-3 h-3 text-amber-400" />
          PENDING
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          APPROVED
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/25">
          <XCircle className="w-3 h-3 text-rose-400" />
          REJECTED
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/25">
          <Ban className="w-3 h-3 text-gray-400" />
          CANCELLED
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-500/10 text-teal-300 border border-teal-500/25">
          <CheckCheck className="w-3 h-3 text-teal-400" />
          COMPLETED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/25">
          {status}
        </span>
      );
  }
};

interface PriorityBadgeProps {
  priority: PriorityLevel;
}

export const StudentRequestPriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'URGENT':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
          <Zap className="w-2.5 h-2.5 text-rose-400" />
          URGENT
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-500/15 text-orange-300 border border-orange-500/30">
          <AlertTriangle className="w-2.5 h-2.5 text-orange-400" />
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
          <Info className="w-2.5 h-2.5 text-blue-400" />
          MEDIUM
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/30">
          <AlertCircle className="w-2.5 h-2.5 text-gray-400" />
          LOW
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-500/15 text-gray-400">
          {priority}
        </span>
      );
  }
};
