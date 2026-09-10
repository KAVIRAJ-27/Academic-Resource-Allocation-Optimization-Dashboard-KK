import React from 'react';
import { RequestStatus, PriorityLevel } from '../../../../types/studentResourceRequest';
import { Badge } from '../../../ui';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md';
}

export const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="warning" dot>
          Pending Review
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge variant="success" dot>
          Approved
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="danger" dot>
          Rejected
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="gray" dot>
          Cancelled
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="blue" dot>
          Completed
        </Badge>
      );
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
};

interface RequestPriorityBadgeProps {
  priority: PriorityLevel;
}

export const RequestPriorityBadge: React.FC<RequestPriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'URGENT':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/25">
          Urgent
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
          High
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25">
          Medium
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/25">
          Low
        </span>
      );
    default:
      return <span>{priority}</span>;
  }
};

interface RequestTypeBadgeProps {
  type: string;
}

export const RequestTypeBadge: React.FC<RequestTypeBadgeProps> = ({ type }) => {
  const formatted = type.replace(/_/g, ' ');
  switch (type.toUpperCase()) {
    case 'ROOM_CHANGE':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/25">
          Room Change
        </span>
      );
    case 'MAINTENANCE':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25">
          Maintenance
        </span>
      );
    case 'FACILITY':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-teal-500/10 text-teal-300 border border-teal-500/25">
          Facility
        </span>
      );
    case 'GENERAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/25">
          General
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-500/10 text-gray-300 border border-gray-500/25">
          {formatted}
        </span>
      );
  }
};
