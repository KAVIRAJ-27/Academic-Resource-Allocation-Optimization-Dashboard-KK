import React from 'react';
import { Card } from '../../ui/Card';
import { HodResourceAllocationOverviewKpi } from '../../../types/hod';
import {
  Layers,
  CheckCircle2,
  Clock,
  CheckSquare,
} from 'lucide-react';

interface HodAllocationSummaryCardsProps {
  kpi: HodResourceAllocationOverviewKpi | null;
  loading: boolean;
}

export const HodAllocationSummaryCards: React.FC<HodAllocationSummaryCardsProps> = ({ kpi, loading }) => {
  if (loading && !kpi) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-900/40 border border-gray-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  const total = kpi?.totalAllocations ?? 0;
  const active = kpi?.activeAllocations ?? 0;
  const pending = kpi?.pendingAllocations ?? 0;
  const completed = kpi?.completedAllocations ?? 0;

  const cards = [
    {
      title: 'Total Allocations',
      value: total,
      subtitle: 'Department resource assignments',
      icon: Layers,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Active Allocations',
      value: active,
      subtitle: `${total > 0 ? Math.round((active / total) * 100) : 0}% currently operational`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Pending Start',
      value: pending,
      subtitle: 'Scheduled upcoming allocations',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Completed',
      value: completed,
      subtitle: 'Past completed sessions',
      icon: CheckSquare,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className={`p-5 border ${card.borderColor} bg-gray-900/40 rounded-2xl flex items-center justify-between shadow-sm backdrop-blur-sm`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{card.title}</p>
              <h3 className="text-2xl font-bold text-white mt-1">{card.value}</h3>
              <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bgColor} ${card.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
