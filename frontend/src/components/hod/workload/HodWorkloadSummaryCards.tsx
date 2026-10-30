import React from 'react';
import { Card } from '../../ui/Card';
import { Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface HodWorkloadSummaryCardsProps {
  totalFaculty: number;
  facultyWithWorkload: number;
  avgTeachingHours: number;
  overloadCount: number;
}

export const HodWorkloadSummaryCards: React.FC<HodWorkloadSummaryCardsProps> = ({
  totalFaculty,
  facultyWithWorkload,
  avgTeachingHours,
  overloadCount,
}) => {
  const cards = [
    {
      title: 'Total Faculty',
      value: totalFaculty,
      subtitle: 'Department teaching staff',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Workload Logged',
      value: facultyWithWorkload,
      subtitle: `${totalFaculty > 0 ? Math.round((facultyWithWorkload / totalFaculty) * 100) : 0}% faculty recorded`,
      icon: CheckCircle2,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
    },
    {
      title: 'Avg. Teaching Hours',
      value: `${avgTeachingHours.toFixed(1)} hrs`,
      subtitle: 'Per faculty member / week',
      icon: Clock,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Overloaded Faculty',
      value: overloadCount,
      subtitle: overloadCount > 0 ? 'Exceeding standard threshold' : 'Optimal distribution',
      icon: AlertTriangle,
      color: overloadCount > 0 ? 'text-amber-400' : 'text-emerald-400',
      bgColor: overloadCount > 0 ? 'bg-amber-500/10' : 'bg-emerald-500/10',
      borderColor: overloadCount > 0 ? 'border-amber-500/20' : 'border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="p-5 border border-gray-800 bg-gray-900/40 rounded-2xl flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-gray-400">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
              <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.bgColor} ${card.color} border ${card.borderColor}`}>
              <Icon className="w-5 h-5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
