import React from 'react';
import { Card } from '../../ui/Card';
import { HodResourceRequestOverviewKpi } from '../../../types/hod';
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Layers,
  CheckSquare,
  CalendarCheck,
  AlertTriangle,
} from 'lucide-react';

interface HodRequestSummaryCardsProps {
  kpi: HodResourceRequestOverviewKpi | null;
  loading: boolean;
}

export const HodRequestSummaryCards: React.FC<HodRequestSummaryCardsProps> = ({ kpi, loading }) => {
  if (loading && !kpi) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-900/40 border border-gray-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  const pending = kpi?.pendingCount ?? 0;
  const approved = kpi?.approvedCount ?? 0;
  const rejected = kpi?.rejectedCount ?? 0;
  const totalRequests = kpi?.totalRequestsCount ?? 0;

  const totalRes = kpi?.totalResources ?? 0;
  const availRes = kpi?.availableResources ?? 0;
  const allocRes = kpi?.allocatedResources ?? 0;
  const maintRes = (kpi?.maintenanceResources ?? 0) + (kpi?.inactiveResources ?? 0);

  const requestCards = [
    {
      title: 'Pending Requests',
      value: pending,
      subtitle: pending > 0 ? 'Requires HOD review' : 'No backlog',
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
    },
    {
      title: 'Approved Requests',
      value: approved,
      subtitle: `${totalRequests > 0 ? Math.round((approved / totalRequests) * 100) : 0}% approval rate`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Rejected Requests',
      value: rejected,
      subtitle: `${totalRequests > 0 ? Math.round((rejected / totalRequests) * 100) : 0}% declined`,
      icon: XCircle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
    },
    {
      title: 'Total Requests',
      value: totalRequests,
      subtitle: 'Department requests logged',
      icon: FileText,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20',
    },
  ];

  const resourceCards = [
    {
      title: 'Dept Resources',
      value: totalRes,
      subtitle: 'Classrooms & Labs',
      icon: Layers,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Available Resources',
      value: availRes,
      subtitle: `${totalRes > 0 ? Math.round((availRes / totalRes) * 100) : 0}% ready for use`,
      icon: CheckSquare,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
    },
    {
      title: 'Allocated Resources',
      value: allocRes,
      subtitle: 'Currently in active use',
      icon: CalendarCheck,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Maintenance / Inactive',
      value: maintRes,
      subtitle: 'Under service or offline',
      icon: AlertTriangle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Request Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {requestCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              className={`p-5 border ${card.borderColor} bg-gray-900/40 rounded-2xl flex items-center justify-between shadow-sm backdrop-blur-sm`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600 font-bold">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bgColor} ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Resource Inventory Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resourceCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              className={`p-4 border ${card.borderColor} bg-gray-900/30 rounded-2xl flex items-center justify-between shadow-sm backdrop-blur-sm`}
            >
              <div>
                <p className="text-xs font-medium text-gray-400">{card.title}</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">{card.value}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{card.subtitle}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bgColor} ${card.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
