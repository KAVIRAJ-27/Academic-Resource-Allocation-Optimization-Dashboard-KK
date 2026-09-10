import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building2, Layers, Hotel } from 'lucide-react';
import { StatCard, Badge } from '../../ui';
import { DashboardGrid } from '../../layout';
import { AdminDashboardOverview } from '../../../types/dashboard';
import { SkeletonCard } from '../../common/SkeletonCard';

interface AdminKpiGridProps {
  data: AdminDashboardOverview | null;
  loading: boolean;
}

export const AdminKpiGrid: React.FC<AdminKpiGridProps> = ({ data, loading }) => {
  const navigate = useNavigate();

  if (loading || !data) {
    return (
      <DashboardGrid variant="stats">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </DashboardGrid>
    );
  }

  const userSubtext = `${data.userDistribution.studentCount} Students · ${data.userDistribution.facultyCount} Faculty`;
  const deptSubtext = `${data.activeDepartments} Active · ${data.totalDepartments - data.activeDepartments} Inactive`;
  const acadSubtext = `${data.academicResourceOverview.available} Available · ${data.academicResourceOverview.allocated} Allocated`;
  const hostelSubtext = `${data.hostelResourceOverview.totalRooms} Rooms · ${data.hostelResourceOverview.totalBeds} Beds`;

  return (
    <DashboardGrid variant="stats">
      <div onClick={() => navigate('/admin/users')} className="cursor-pointer" role="button" tabIndex={0}>
        <StatCard
          title="Total Registered Users"
          value={data.totalUsers}
          description={userSubtext}
          icon={Users}
          iconColor="teal"
          badge={<Badge variant="teal">RBAC Verified</Badge>}
          footerText={`Admin: ${data.userDistribution.adminCount} · HOD: ${data.userDistribution.hodCount}`}
          className="hover:border-teal-500/40 transition-colors"
        />
      </div>
      <StatCard
        title="Academic Departments"
        value={data.totalDepartments}
        description={deptSubtext}
        icon={Building2}
        iconColor="blue"
        badge={<Badge variant="blue">Curriculum</Badge>}
        footerText="Institutional academic divisions"
      />
      <StatCard
        title="Academic Resources"
        value={data.totalAcademicResources}
        description={acadSubtext}
        icon={Layers}
        iconColor="purple"
        badge={<Badge variant="purple">Master</Badge>}
        footerText={`Utilization: ${data.academicResourceOverview.utilizationRate}%`}
      />
      <StatCard
        title="Hostel Infrastructure"
        value={data.totalHostels}
        description={hostelSubtext}
        icon={Hotel}
        iconColor="orange"
        badge={<Badge variant="orange">Residential</Badge>}
        footerText={`Occupancy: ${data.hostelResourceOverview.occupancyRate}%`}
      />
    </DashboardGrid>
  );
};
