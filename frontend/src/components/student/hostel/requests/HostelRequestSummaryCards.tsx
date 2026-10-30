import React from 'react';
import { Card } from '../../../ui';
import { StudentHostelRequestSummaryCounts } from '../../../../types/studentHostelRequest';
import { Clock, CheckCircle2, XCircle, Ban, Layers, CheckCheck } from 'lucide-react';

interface Props {
  counts: StudentHostelRequestSummaryCounts;
  loading: boolean;
  activeStatus?: string;
  onSelectStatus?: (status: any) => void;
}

export const HostelRequestSummaryCards: React.FC<Props> = ({
  counts,
  loading,
  activeStatus,
  onSelectStatus,
}) => {
  const cards = [
    {
      id: 'ALL',
      label: 'Total Requests',
      count: counts.total,
      icon: Layers,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      activeBg: 'ring-2 ring-blue-500/50 bg-blue-500/15',
    },
    {
      id: 'PENDING',
      label: 'Pending Review',
      count: counts.pending,
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      activeBg: 'ring-2 ring-amber-500/50 bg-amber-500/15',
    },
    {
      id: 'APPROVED',
      label: 'Approved',
      count: counts.approved,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      activeBg: 'ring-2 ring-emerald-500/50 bg-emerald-500/15',
    },
    {
      id: 'REJECTED',
      label: 'Rejected',
      count: counts.rejected,
      icon: XCircle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      activeBg: 'ring-2 ring-rose-500/50 bg-rose-500/15',
    },
    {
      id: 'CANCELLED',
      label: 'Cancelled',
      count: counts.cancelled,
      icon: Ban,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10 border-gray-500/20',
      activeBg: 'ring-2 ring-gray-400/50 bg-gray-500/15',
    },
    {
      id: 'COMPLETED',
      label: 'Completed',
      count: counts.completed,
      icon: CheckCheck,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
      activeBg: 'ring-2 ring-teal-500/50 bg-teal-500/15',
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
            onClick={() => onSelectStatus?.(card.id)}
            disabled={loading}
            className={`text-left transition-all duration-200 rounded-xl outline-none focus:outline-none ${
              isActive ? card.activeBg : ''
            }`}
          >
            <Card className="p-3.5 bg-white border-slate-200 hover:border-[#2A3245] transition-colors h-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-600 font-bold uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-lg border ${card.bgColor}`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>

              <div className="flex items-baseline gap-1.5">
                {loading ? (
                  <div className="h-6 w-10 bg-[#1E2330] rounded animate-pulse" />
                ) : (
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    {card.count}
                  </span>
                )}
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
};
