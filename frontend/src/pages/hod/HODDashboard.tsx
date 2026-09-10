import React from 'react';
import { PageContainer } from '../../components/layout';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { useHodDashboard } from '../../hooks/useHodDashboard';
import {
  HodDepartmentHeader,
  HodKpiGrid,
  HodStudentDistributionChart,
  HodFacultyWorkloadCard,
  HodPendingRequestsCard,
  HodActiveAllocationsCard,
  HodResourceUtilizationCard,
  HodRecentActivityCard,
  HodQuickActions,
  HodDashboardSkeleton,
} from '../../components/hod/dashboard';
import { RefreshCw, AlertCircle } from 'lucide-react';

export const HODDashboard: React.FC = () => {
  const { dashboard, loading, error, refresh } = useHodDashboard();

  if (loading && !dashboard) {
    return (
      <PageContainer>
        <HodDashboardSkeleton />
      </PageContainer>
    );
  }

  if (error && !dashboard) {
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto py-12">
          <Alert variant="error" title="Dashboard Telemetry Error">
            <div className="space-y-4">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Retry Connecting
              </Button>
            </div>
          </Alert>
        </div>
      </PageContainer>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <PageContainer>
      <div className="space-y-6 pb-12">
        {/* Live Department & Active HOD Header */}
        <HodDepartmentHeader
          department={dashboard.department}
          onRefresh={refresh}
          isRefreshing={loading}
        />

        {/* 8-Card KPI Grid */}
        <HodKpiGrid kpi={dashboard.summary} />

        {/* Primary 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols on large screens) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Student Enrollment Distribution Recharts Card */}
            <HodStudentDistributionChart distribution={dashboard.studentDistribution} />

            {/* Department Faculty Workload Table */}
            <HodFacultyWorkloadCard facultyList={dashboard.facultyWorkloads} />

            {/* Pending Resource Requests Card */}
            <HodPendingRequestsCard pendingRequests={dashboard.pendingRequests} />
          </div>

          {/* Right Column (5 cols on large screens) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Active Resource Allocations Card */}
            <HodActiveAllocationsCard allocations={dashboard.activeAllocations} />

            {/* Department Resource Utilization Breakdown */}
            <HodResourceUtilizationCard utilization={dashboard.resourceUtilization} />

            {/* Recent Department Activity Feed */}
            <HodRecentActivityCard activities={dashboard.recentActivities} />
          </div>
        </div>

        {/* Bottom Section: Quick Actions */}
        <div className="pt-2">
          <HodQuickActions />
        </div>
      </div>
    </PageContainer>
  );
};
