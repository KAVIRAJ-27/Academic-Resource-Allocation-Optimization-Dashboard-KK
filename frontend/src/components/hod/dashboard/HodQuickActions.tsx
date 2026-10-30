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
      route: APP_ROUTES.HOD.FACULTY,
      iconBg: 'bg-[#F4F0E6] text-[#B8A16A] border-[#D8C9A8]',
    },
    {
      title: 'Student Cohorts',
      description: 'View enrolled students, sections & programs',
      icon: GraduationCap,
      route: APP_ROUTES.HOD.STUDENTS,
      iconBg: 'bg-[#F0F5F2] text-[#3F7655] border-[#B6D1C1]',
    },
    {
      title: 'Academic Allocations',
      description: 'Review active resource bookings & requests',
      icon: CalendarRange,
      route: APP_ROUTES.HOD.ALLOCATIONS,
      iconBg: 'bg-[#FAF7F0] text-[#A87928] border-[#E8DEC8]',
    },
    {
      title: 'Department Resources',
      description: 'Laboratories, smart rooms & equipment inventory',
      icon: Box,
      route: APP_ROUTES.HOD.RESOURCES,
      iconBg: 'bg-[#EFF3F6] text-[#657C91] border-[#C2D1DD]',
    },
    {
      title: 'Department Timetables',
      description: 'Weekly schedule synthesis & lecture time slots',
      icon: Calendar,
      route: APP_ROUTES.HOD.TIMETABLE,
      iconBg: 'bg-[#F0F5F2] text-[#3F7655] border-[#B6D1C1]',
    },
    {
      title: 'Programs & Subjects',
      description: 'Degree offerings, curriculums & syllabus structure',
      icon: Layers,
      route: APP_ROUTES.HOD.COURSES,
      iconBg: 'bg-[#F4F0E6] text-[#B8A16A] border-[#D8C9A8]',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-serif font-bold text-[#202020]">Department Quick Actions</h3>
        <span className="text-xs text-[#77736A]">Direct navigation</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Card
              key={act.title}
              onClick={() => navigate(act.route)}
              className="p-4 border border-[#D8C9A8] bg-white shadow-none rounded-xl hover:border-[#B8A16A] hover:bg-[#FBF9F3] transition-all cursor-pointer group flex items-start justify-between"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded border shrink-0 ${act.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#202020] group-hover:text-[#B8A16A] transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-xs text-[#77736A] mt-0.5 line-clamp-1">{act.description}</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#77736A] group-hover:text-[#B8A16A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
            </Card>
          );
        })}
      </div>
    </div>
  );
};
