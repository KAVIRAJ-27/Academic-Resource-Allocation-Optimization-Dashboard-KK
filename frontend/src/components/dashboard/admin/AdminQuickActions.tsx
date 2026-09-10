import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Layers, Hotel, FileText, Settings, BarChart3, GraduationCap, UserCheck, Briefcase, ShieldCheck, KeyRound, School } from 'lucide-react';
import { ActionCard, Badge } from '../../ui';
import { DashboardGrid } from '../../layout';

export const AdminQuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardGrid cols={3}>
      <ActionCard
        title="Academic Structure"
        description="Master hierarchy of departments, academic years, semesters, degree programs, subjects, and sections."
        icon={School}
        actionText="Manage Hierarchy"
        badge={<Badge variant="teal">Active</Badge>}
        onClick={() => navigate('/admin/academic')}
      />
      <ActionCard
        title="Faculty Management"
        description="Faculty appointments, designations, qualifications, and department associations."
        icon={UserCheck}
        actionText="Manage Faculty"
        badge={<Badge variant="teal">Active</Badge>}
        onClick={() => navigate('/admin/staff?tab=faculty')}
      />
      <ActionCard
        title="HOD Assignments"
        description="Department leadership appointments, tenures, and departmental delegation."
        icon={Briefcase}
        actionText="Manage HODs"
        badge={<Badge variant="purple">Active</Badge>}
        onClick={() => navigate('/admin/staff?tab=hod')}
      />
      <ActionCard
        title="Principal Office"
        description="Institutional executive appointment, governance authority, and assignment tenure."
        icon={ShieldCheck}
        actionText="Manage Principal"
        badge={<Badge variant="blue">Active</Badge>}
        onClick={() => navigate('/admin/staff?tab=principal')}
      />
      <ActionCard
        title="Hostel Wardens"
        description="Residential warden appointments and multi-hostel block supervisory assignments."
        icon={KeyRound}
        actionText="Manage Wardens"
        badge={<Badge variant="orange">Active</Badge>}
        onClick={() => navigate('/admin/staff?tab=warden')}
      />
      <ActionCard
        title="Student Master Registry"
        description="Manage student academic records, program enrollments, semester standings, and section assignments."
        icon={GraduationCap}
        actionText="Manage Students"
        badge={<Badge variant="teal">Active</Badge>}
        onClick={() => navigate('/admin/students')}
      />
      <ActionCard
        title="User & Identity Directory"
        description="Manage user credentials, institutional roles (Student, Faculty, HOD, Principal, Warden), and status."
        icon={Users}
        actionText="Open Directory"
        badge={<Badge variant="teal">Active</Badge>}
        onClick={() => navigate('/admin/users')}
      />
      <ActionCard
        title="Classrooms & Laboratories"
        description="Master inventory of lecture halls, smart projectors, computing clusters, and equipment."
        icon={Layers}
        actionText="Manage Inventory"
        badge={<Badge variant="teal">Active</Badge>}
        onClick={() => navigate('/admin/resources')}
      />
      <ActionCard
        title="Hostels & Residential Blocks"
        description="Residential catalog of buildings, wings, room capacities, beds, and facility amenities."
        icon={Hotel}
        actionText="View Hostels"
        badge={<Badge variant="orange">Hostel</Badge>}
        onClick={() => navigate('/admin/hostels')}
      />
      <ActionCard
        title="Institutional Audit Reports"
        description="System access logs, allocation compliance records, and accreditation data summaries."
        icon={FileText}
        actionText="View Reports"
        badge={<Badge variant="neutral">Audit</Badge>}
        onClick={() => navigate('/admin/reports')}
      />
      <ActionCard
        title="System Security Settings"
        description="Academic calendar terms, JWT token parameters, and notification channels."
        icon={Settings}
        actionText="System Config"
        badge={<Badge variant="blue">Config</Badge>}
        onClick={() => navigate('/admin/settings')}
      />
      <ActionCard
        title="Resource Utilization Telemetry"
        description="Cross-domain campus utilization rates and allocation throughput monitoring."
        icon={BarChart3}
        actionText="View Analytics"
        badge={<Badge variant="neutral">Analytics</Badge>}
        onClick={() => navigate('/admin/analytics')}
      />
    </DashboardGrid>
  );
};
