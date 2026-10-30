import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, FileText, AlertTriangle } from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  ContentSection,
  DashboardGrid,
  GridCol,
} from '../../components/layout';
import { Button, Badge } from '../../components/ui';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import {
  AdminKpiGrid,
  AdminOperationalStats,
  AcademicUtilizationChart,
  HostelOccupancyChart,
  ResourceStatusBreakdown,
  OpenIssuesSummary,
  RecentActivityFeed,
  AdminQuickActions,
} from '../../components/dashboard/admin';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, refreshing, error, refresh } = useAdminDashboard();

  return (
    <PageContainer>
      {/* 1. Standard Page Header */}
      <PageHeader
        title="Central System Administration"
        description="Institution-wide operational command center for users, academic infrastructure, hostel living, resource requisitions, and allocations."
        badge={
          <Badge variant={error ? 'danger' : 'success'} dot>
            {error ? 'CONNECTION ISSUE' : 'SYSTEM NOMINAL'}
          </Badge>
        }
        primaryAction={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={refresh}
            disabled={loading || refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Telemetry'}
          </Button>
        }
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<FileText className="w-3.5 h-3.5" />}
            onClick={() => navigate('/admin/reports')}
          >
            System Reports
          </Button>
        }
      />

      {/* Error State Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FBF0F0] border border-[#EBBABA] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <AlertTriangle className="w-5 h-5 text-[#B44747] shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-[#B44747]">Telemetry Feed Error</h4>
              <p className="text-[11px] text-[#555555] truncate">{error}</p>
            </div>
          </div>
          <Button variant="danger" size="xs" onClick={refresh}>
            Retry
          </Button>
        </div>
      )}

      {/* 2. Key Institutional Statistics */}
      <ContentSection
        title="Institutional Key Statistics"
        subtitle="Master entity totals derived directly from the institutional database"
      >
        <AdminKpiGrid data={data} loading={loading} />
      </ContentSection>

      {/* 3. Operational Queue Indicators */}
      <ContentSection
        title="Operational Queue & Approvals"
        subtitle="Real-time pending requests, active space allocations, and unresolved issues"
      >
        <AdminOperationalStats data={data} loading={loading} />
      </ContentSection>

      {/* 4. Telemetry Analytics Charts (Academic Utilization & Hostel Occupancy) */}
      <ContentSection
        title="Utilization & Occupancy Analytics"
        subtitle="Real status distribution across physical classrooms, laboratories, and residential beds"
      >
        <DashboardGrid variant="charts">
          <AcademicUtilizationChart
            overview={data?.academicResourceOverview ?? null}
            loading={loading}
          />
          <HostelOccupancyChart
            overview={data?.hostelResourceOverview ?? null}
            loading={loading}
          />
        </DashboardGrid>
      </ContentSection>

      {/* 5. Resource Lifecycle Breakdown */}
      <ContentSection
        title="Resource Lifecycle & Pipeline"
        subtitle="Requisition status pipeline and allocation active lifecycle breakdown"
      >
        <ResourceStatusBreakdown
          requestSummary={data?.requestSummary ?? null}
          allocationSummary={data?.allocationSummary ?? null}
          loading={loading}
        />
      </ContentSection>

      {/* 6. Open Issues & Recent Audit Activity Split */}
      <DashboardGrid variant="split">
        <GridCol span={1}>
          <ContentSection
            title="Open Issues"
            subtitle="Grievance & maintenance alerts"
          >
            <OpenIssuesSummary
              openComplaints={data?.openComplaints ?? 0}
              openMaintenance={data?.openMaintenanceRequests ?? 0}
              loading={loading}
            />
          </ContentSection>
        </GridCol>

        <GridCol span={2}>
          <ContentSection
            title="Recent Activity"
            subtitle="Immutable audit trail from authentication & system actions"
          >
            <RecentActivityFeed
              activities={data?.recentActivities ?? []}
              loading={loading}
            />
          </ContentSection>
        </GridCol>
      </DashboardGrid>

      {/* 7. Admin Quick Actions */}
      <ContentSection
        title="Administrative Quick Actions"
        subtitle="Direct navigation to core institutional management consoles"
      >
        <AdminQuickActions />
      </ContentSection>
    </PageContainer>
  );
};
