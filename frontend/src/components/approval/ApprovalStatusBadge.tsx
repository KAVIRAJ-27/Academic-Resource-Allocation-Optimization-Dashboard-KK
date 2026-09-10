import React from 'react';
import { ApprovalStatus } from '../../types/approval';
import { Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  switch (status) {
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 ${sizeClasses[size]}`}
        >
          <Clock size={iconSizes[size]} className="animate-pulse" />
          Pending Review
        </span>
      );
    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ${sizeClasses[size]}`}
        >
          <CheckCircle2 size={iconSizes[size]} />
          Approved
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 ${sizeClasses[size]}`}
        >
          <XCircle size={iconSizes[size]} />
          Rejected
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-slate-600 bg-slate-800/80 text-slate-400 ${sizeClasses[size]}`}
        >
          <Ban size={iconSizes[size]} />
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-800 text-slate-400 ${sizeClasses[size]}`}>
          {status}
        </span>
      );
  }
};
