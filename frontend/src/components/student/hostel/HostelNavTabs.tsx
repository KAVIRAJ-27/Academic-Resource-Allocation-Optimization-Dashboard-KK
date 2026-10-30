import React from 'react';
import { NavLink } from 'react-router-dom';
import { Hotel, FileText, AlertTriangle } from 'lucide-react';

interface HostelNavTabsProps {
  pendingRequestsCount?: number;
  openComplaintsCount?: number;
}

export const HostelNavTabs: React.FC<HostelNavTabsProps> = ({
  pendingRequestsCount,
  openComplaintsCount,
}) => {
  const tabs = [
    {
      to: '/student/hostel',
      label: 'Hostel Overview',
      icon: Hotel,
      badge: null,
      exact: true,
    },
    {
      to: '/student/hostel/requests',
      label: 'Hostel Requests',
      icon: FileText,
      badge: pendingRequestsCount && pendingRequestsCount > 0 ? pendingRequestsCount : null,
      exact: false,
    },
    {
      to: '/student/hostel/complaints',
      label: 'Complaints & Maintenance',
      icon: AlertTriangle,
      badge: openComplaintsCount && openComplaintsCount > 0 ? openComplaintsCount : null,
      exact: false,
    },
  ];

  return (
    <div className="flex items-center space-x-1 border-b border-slate-200 pb-2 mb-6 overflow-x-auto scrollbar-none">
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
                  : 'text-gray-400 hover:text-gray-200 hover:bg-slate-50 border border-transparent'
              }`
            }
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.badge !== null && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {tab.badge}
              </span>
            )}
          </NavLink>
        );
      })}
    </div>
  );
};
