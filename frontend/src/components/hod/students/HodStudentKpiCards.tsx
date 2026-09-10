import React from 'react';
import { Card } from '../../ui/Card';
import { GraduationCap, UserCheck, Layers, Users } from 'lucide-react';

interface HodStudentKpiCardsProps {
  totalStudents: number;
  activeStudents: number;
  programsCount: number;
  sectionsCount: number;
}

export const HodStudentKpiCards: React.FC<HodStudentKpiCardsProps> = ({
  totalStudents,
  activeStudents,
  programsCount,
  sectionsCount,
}) => {
  const cards = [
    {
      title: 'Department Students',
      value: totalStudents,
      subtitle: 'Enrolled across programs',
      icon: GraduationCap,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
    },
    {
      title: 'Active Students',
      value: activeStudents,
      subtitle: `${totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}% active status`,
      icon: UserCheck,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
    },
    {
      title: 'Academic Programs',
      value: programsCount,
      subtitle: 'Department degrees',
      icon: Layers,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    {
      title: 'Active Sections',
      value: sectionsCount,
      subtitle: 'Cohort divisions',
      icon: Users,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/20',
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
              <h3 className="text-2xl font-bold text-white mt-1">{card.value}</h3>
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
