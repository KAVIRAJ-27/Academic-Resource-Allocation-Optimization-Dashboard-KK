import React from 'react';
import { FacultyResourceRequestSummaryCounts } from '../../../types/faculty';
import { FileText, Clock, CheckCircle, XCircle, Ban, Award } from 'lucide-react';

interface FacultyRequestSummaryCardsProps {
  counts: FacultyResourceRequestSummaryCounts;
  activeStatus: string;
  onSelectStatus: (status: string) => void;
}

export const FacultyRequestSummaryCards: React.FC<FacultyRequestSummaryCardsProps> = ({
  counts,
  activeStatus,
  onSelectStatus,
}) => {
  const cards = [
    {
      id: 'ALL',
      label: 'All Requests',
      count: counts.total,
      icon: FileText,
      color: 'text-gray-400',
      activeBorder: 'border-gray-400',
      bgHover: 'hover:border-gray-500/50',
    },
    {
      id: 'PENDING',
      label: 'Pending',
      count: counts.pending,
      icon: Clock,
      color: 'text-amber-400',
      activeBorder: 'border-amber-500',
      bgHover: 'hover:border-amber-500/50',
    },
    {
      id: 'APPROVED',
      label: 'Approved',
      count: counts.approved,
      icon: CheckCircle,
      color: 'text-teal-400',
      activeBorder: 'border-teal-500',
      bgHover: 'hover:border-teal-500/50',
    },
    {
      id: 'REJECTED',
      label: 'Rejected',
      count: counts.rejected,
      icon: XCircle,
      color: 'text-rose-400',
      activeBorder: 'border-rose-500',
      bgHover: 'hover:border-rose-500/50',
    },
    {
      id: 'CANCELLED',
      label: 'Cancelled',
      count: counts.cancelled,
      icon: Ban,
      color: 'text-gray-500',
      activeBorder: 'border-gray-600',
      bgHover: 'hover:border-gray-600/50',
    },
    {
      id: 'COMPLETED',
      label: 'Completed',
      count: counts.completed,
      icon: Award,
      color: 'text-blue-400',
      activeBorder: 'border-blue-500',
      bgHover: 'hover:border-blue-500/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatus === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatus(card.id)}
            className={`p-4 rounded-xl text-left transition-all border ${
              isActive
                ? `bg-[#161B26] ${card.activeBorder} shadow-lg shadow-black/40 ring-1 ring-white/10`
                : `bg-[#11141C] border-[#1E2330] ${card.bgHover}`
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 truncate">{card.label}</span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="mt-2 text-2xl font-bold text-white">{card.count}</div>
          </button>
        );
      })}
    </div>
  );
};
