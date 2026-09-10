import React from 'react';
import { StatCard } from '../../ui/StatCard';
import { HodDepartmentSummaryKpi } from '../../../types/hod';
import {
  GraduationCap,
  Users,
  BookOpen,
  Layers,
  CalendarRange,
  Clock,
  CheckCircle2,
  Box,
} from 'lucide-react';

interface HodKpiGridProps {
  kpi: HodDepartmentSummaryKpi;
}

export const HodKpiGrid: React.FC<HodKpiGridProps> = ({ kpi }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Students"
        value={kpi.totalStudents}
        icon={GraduationCap}
        iconColor="teal"
        description="Enrolled in department programs"
      />

      <StatCard
        title="Total Faculty"
        value={kpi.totalFaculty}
        icon={Users}
        iconColor="purple"
        description="Department teaching faculty"
      />

      <StatCard
        title="Programs / Degrees"
        value={kpi.totalPrograms}
        icon={BookOpen}
        iconColor="blue"
        description="Active departmental curriculums"
      />

      <StatCard
        title="Total Subjects"
        value={kpi.totalSubjects}
        icon={Layers}
        iconColor="emerald"
        description="Curriculum subject offerings"
      />

      <StatCard
        title="Active Sections"
        value={kpi.activeSections}
        icon={CalendarRange}
        iconColor="teal"
        description="Ongoing class cohorts"
      />

      <StatCard
        title="Pending Resource Requests"
        value={kpi.pendingResourceRequests}
        icon={Clock}
        iconColor={kpi.pendingResourceRequests > 0 ? 'orange' : 'teal'}
        badgeText={kpi.pendingResourceRequests > 0 ? 'Needs Attention' : 'All Clear'}
        description="Awaiting faculty requests"
      />

      <StatCard
        title="Active Allocations"
        value={kpi.activeResourceAllocations}
        icon={CheckCircle2}
        iconColor="purple"
        description="Currently reserved resources"
      />

      <StatCard
        title="Department Resources"
        value={kpi.totalDepartmentResources}
        icon={Box}
        iconColor="rose"
        description="Assigned labs, halls & equipment"
      />
    </div>
  );
};
