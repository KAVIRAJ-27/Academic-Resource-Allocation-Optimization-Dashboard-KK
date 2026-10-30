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
          className={`inline-flex items-center gap-1.5 rounded-full border border-[#E8D8BA] bg-[#FAF7F0] text-[#A87928] ${sizeClasses[size]}`}
        >
          <Clock size={iconSizes[size]} className="animate-pulse" />
          Pending Review
        </span>
      );
    case 'APPROVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-[#C2D6C9] bg-[#F0F5F2] text-[#3F7655] ${sizeClasses[size]}`}
        >
          <CheckCircle2 size={iconSizes[size]} />
          Approved
        </span>
      );
    case 'REJECTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-[#EBBABA] bg-[#FBF0F0] text-[#B44747] ${sizeClasses[size]}`}
        >
          <XCircle size={iconSizes[size]} />
          Rejected
        </span>
      );
    case 'CANCELLED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-[#E8E0D0] bg-[#F8F6F0] text-[#77736A] ${sizeClasses[size]}`}
        >
          <Ban size={iconSizes[size]} />
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-[#D8C9A8] bg-[#FBF9F3] text-[#555555] ${sizeClasses[size]}`}>
          {status}
        </span>
      );
  }
};
