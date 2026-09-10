import React from 'react';
import { ComplaintStatus } from '../../../../types/studentHostelComplaint';
import { PriorityLevel } from '../../../../types/studentResourceRequest';
import { Badge } from '../../../ui';

interface ComplaintStatusBadgeProps {
  status: ComplaintStatus;
}

export const ComplaintStatusBadge: React.FC<ComplaintStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return (
        <Badge variant="warning" dot>
          Open
        </Badge>
      );
    case 'IN_PROGRESS':
      return (
        <Badge variant="blue" dot>
          In Progress
        </Badge>
      );
    case 'RESOLVED':
      return (
        <Badge variant="success" dot>
          Resolved
        </Badge>
      );
    case 'CLOSED':
      return (
        <Badge variant="gray" dot>
          Closed
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant="danger" dot>
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="gray">{status}</Badge>;
  }
};

interface ComplaintPriorityBadgeProps {
  priority: PriorityLevel;
}

export const ComplaintPriorityBadge: React.FC<ComplaintPriorityBadgeProps> = ({ priority }) => {
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

interface ComplaintCategoryBadgeProps {
  category: string;
}

export const ComplaintCategoryBadge: React.FC<ComplaintCategoryBadgeProps> = ({ category }) => {
  const cat = category.toUpperCase();
  switch (cat) {
    case 'ELECTRICAL':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/25">
          ⚡ Electrical
        </span>
      );
    case 'PLUMBING':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
          💧 Plumbing
        </span>
      );
    case 'ROOM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/25">
          🛏️ Room / Furniture
        </span>
      );
    case 'CLEANLINESS':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-teal-500/10 text-teal-300 border border-teal-500/25">
          🧹 Cleanliness
        </span>
      );
    case 'INTERNET':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
          📶 Wi-Fi / Internet
        </span>
      );
    case 'SECURITY':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/25">
          🛡️ Security
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-500/10 text-gray-300 border border-gray-500/25">
          {category}
        </span>
      );
  }
};
