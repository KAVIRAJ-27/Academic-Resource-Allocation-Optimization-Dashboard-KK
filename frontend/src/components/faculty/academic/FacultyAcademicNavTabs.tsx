import React from 'react';
import { NavLink } from 'react-router-dom';
import { Layers, BookOpen, Clock } from 'lucide-react';

interface FacultyAcademicNavTabsProps {
  subjectsCount?: number;
  todayClassesCount?: number;
}

export const FacultyAcademicNavTabs: React.FC<FacultyAcademicNavTabsProps> = ({
  subjectsCount,
  todayClassesCount,
}) => {
  const tabs = [
    {
      to: '/faculty/academics',
      label: 'Academic Overview',
      icon: Layers,
      badge: null,
      exact: true,
    },
    {
      to: '/faculty/subjects',
      label: 'Assigned Subjects',
      icon: BookOpen,
      badge: subjectsCount !== undefined && subjectsCount > 0 ? subjectsCount : null,
      exact: false,
    },
    {
      to: '/faculty/timetable',
      label: 'Instruction Timetable',
      icon: Clock,
      badge: todayClassesCount !== undefined && todayClassesCount > 0 ? `${todayClassesCount} today` : null,
      exact: false,
    },
  ];

  return (
    <div className="flex items-center space-x-1 border-b border-[#1E2330] pb-2 mb-6 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.exact}
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-teal-500/10 text-teal-300 border border-teal-500/25 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#151923] border border-transparent'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge !== null && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {tab.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};
