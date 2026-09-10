import React from 'react';
import { Card } from '../../ui/Card';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../../../constants/routes';
import {
  Users,
  GraduationCap,
  CalendarRange,
  Box,
  Layers,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';

export const HodQuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Department Faculty',
      description: 'Manage staff, workload & subject assignments',
      icon: Users,
      color: 'teal',
      route: APP_ROUTES.HOD.FACULTY,
      iconBg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    },
    {
      title: 'Student Cohorts',
      description: 'View enrolled students, sections & programs',
      icon: GraduationCap,
      color: 'purple',
      route: APP_ROUTES.HOD.STUDENTS,
      iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    {
      title: 'Academic Allocations',
      description: 'Review active resource bookings & requests',
      icon: CalendarRange,
      color: 'blue',
      route: APP_ROUTES.HOD.ALLOCATIONS,
      iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    {
      title: 'Department Resources',
      description: 'Laboratories, smart rooms & equipment inventory',
      icon: Box,
      color: 'rose',
      route: APP_ROUTES.HOD.RESOURCES,
      iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    },
    {
      title: 'Department Timetables',
      description: 'Weekly schedule synthesis & lecture time slots',
      icon: Calendar,
      color: 'emerald',
      route: APP_ROUTES.HOD.TIMETABLE,
      iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Programs & Subjects',
      description: 'Degree offerings, curriculums & syllabus structure',
      icon: Layers,
      color: 'orange',
      route: APP_ROUTES.HOD.COURSES,
      iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Department Quick Actions</h3>
        <span className="text-xs text-gray-400">Direct navigation</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Card
              key={act.title}
              onClick={() => navigate(act.route)}
              className="p-4 border border-gray-800 bg-gray-900/40 rounded-xl hover:border-gray-700 hover:bg-gray-800/40 transition-all cursor-pointer group flex items-start justify-between"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl border shrink-0 ${act.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{act.description}</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
            </Card>
          );
        })}
      </div>
    </div>
  );
};
