import React from 'react';
import { PrincipalKpiSummaryDto } from '../../../types/principal';
import { StatCard } from '../../ui';
import {
  Layers,
  GraduationCap,
  Users,
  BookOpen,
  FileSpreadsheet,
  Cpu,
  Clock,
  CheckCircle2,
  Building,
  Bed,
  CheckSquare,
} from 'lucide-react';

interface PrincipalKpiCardsProps {
  kpis: PrincipalKpiSummaryDto;
}

export const PrincipalKpiCards: React.FC<PrincipalKpiCardsProps> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
      <StatCard
        title="Departments"
        value={kpis.totalDepartments}
        icon={Layers}
        iconColor="teal"
        description="Active academic units"
      />

      <StatCard
        title="Total Students"
        value={kpis.totalStudents.toLocaleString()}
        icon={GraduationCap}
        iconColor="blue"
        description="Enrolled institutional body"
      />

      <StatCard
        title="Total Faculty"
        value={kpis.totalFaculty.toLocaleString()}
        icon={Users}
        iconColor="purple"
        description="Instructional personnel"
      />

      <StatCard
        title="Degree Programs"
        value={kpis.totalPrograms}
        icon={BookOpen}
        iconColor="teal"
        description="Accredited curricula"
      />

      <StatCard
        title="Curricular Subjects"
        value={kpis.totalSubjects}
        icon={FileSpreadsheet}
        iconColor="teal"
        description="Across all semesters"
      />

      <StatCard
        title="Academic Resources"
        value={kpis.academicResources}
        icon={Cpu}
        iconColor="blue"
        description="Classrooms, labs & gear"
      />

      <StatCard
        title="Pending Requests"
        value={kpis.pendingResourceRequests}
        icon={Clock}
        iconColor={kpis.pendingResourceRequests > 0 ? 'orange' : 'teal'}
        description="Awaiting allocation"
      />

      <StatCard
        title="Active Allocations"
        value={kpis.activeAllocations}
        icon={CheckCircle2}
        iconColor="emerald"
        description="Currently engaged"
      />

      <StatCard
        title="Hostels"
        value={kpis.totalHostels}
        icon={Building}
        iconColor="teal"
        description="Residential facilities"
      />

      <StatCard
        title="Hostel Beds"
        value={`${kpis.occupiedHostelBeds} / ${kpis.totalHostelBeds}`}
        icon={Bed}
        iconColor="blue"
        description="Occupied / Total capacity"
      />

      <StatCard
        title="Pending Approvals"
        value={kpis.pendingApprovals}
        icon={CheckSquare}
        iconColor={kpis.pendingApprovals > 0 ? 'rose' : 'teal'}
        description="Institutional reviews"
      />
    </div>
  );
};
