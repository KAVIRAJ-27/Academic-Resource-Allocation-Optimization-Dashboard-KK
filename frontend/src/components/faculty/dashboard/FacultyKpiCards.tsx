import React from 'react';
import { DashboardGrid } from '../../layout';
import { StatCard, Badge } from '../../ui';
import { FacultyKpiMetrics } from '../../../types/faculty';
import { BookOpen, Activity, Clock, Send } from 'lucide-react';

interface FacultyKpiCardsProps {
  metrics?: FacultyKpiMetrics;
}

export const FacultyKpiCards: React.FC<FacultyKpiCardsProps> = ({ metrics }) => {
  const assignedCount = metrics?.assignedSubjectsCount ?? 0;
  const weeklyHours = metrics?.weeklyInstructionHours ?? 0;
  const upcomingClasses = metrics?.upcomingClassesCount ?? 0;
  const pendingReqs = metrics?.pendingRequisitionsCount ?? 0;

  return (
    <DashboardGrid variant="stats">
      <StatCard
        title="Assigned Subjects"
        value={String(assignedCount)}
        description="Active teaching courses this semester"
        icon={BookOpen}
        badge={<Badge variant="purple">Curriculum</Badge>}
        trend={{
          direction: assignedCount > 0 ? 'up' : 'neutral',
          label: assignedCount > 0 ? 'Assigned' : 'Unassigned',
        }}
        footerText="Syllabus and section roster mapped"
      />

      <StatCard
        title="Weekly Instruction Hours"
        value={`${weeklyHours} hrs`}
        description="Designated lecture & lab hours per week"
        icon={Activity}
        badge={<Badge variant="blue">Workload</Badge>}
        trend={{
          direction: weeklyHours > 0 ? 'neutral' : 'down',
          label: weeklyHours > 0 ? 'Calculated' : 'Pending',
        }}
        footerText="Fairness & allocation balance metric"
      />

      <StatCard
        title="Scheduled Classes"
        value={String(upcomingClasses)}
        description="Weekly timetable periods and labs"
        icon={Clock}
        badge={<Badge variant="teal">Timetable</Badge>}
        trend={{
          direction: upcomingClasses > 0 ? 'up' : 'neutral',
          label: upcomingClasses > 0 ? 'Active schedule' : 'No timetable',
        }}
        footerText="Venue and time slot designated"
      />

      <StatCard
        title="Pending Requisitions"
        value={String(pendingReqs)}
        description="Resource and facility requests under review"
        icon={Send}
        badge={<Badge variant="warning">Requisitions</Badge>}
        trend={{
          direction: pendingReqs > 0 ? 'down' : 'neutral',
          label: pendingReqs > 0 ? `${pendingReqs} pending` : 'All cleared',
        }}
        footerText="Department review queue"
      />
    </DashboardGrid>
  );
};
