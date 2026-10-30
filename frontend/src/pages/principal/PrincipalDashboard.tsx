import React from 'react';
import { usePrincipalDashboard } from '../../hooks/usePrincipalDashboard';
import {
  PrincipalInstitutionHeader,
  PrincipalKpiCards,
  PrincipalDepartmentTable,
  PrincipalAcademicCharts,
  PrincipalHostelOverviewCard,
  PrincipalApprovalsActivityCards,
} from '../../components/principal/dashboard';
import {
  PageContainer,
} from '../../components/layout';
import {
  Skeleton,
  Card,
  CardContent,
  Alert,
  Button,
} from '../../components/ui';
import { RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';

export const PrincipalDashboard: React.FC = () => {
  const { data, loading, error, refetch } = usePrincipalDashboard();

  if (loading && !data) {
    return (
      <PageContainer>
        <div className="space-y-6 animate-pulse">
          {/* Institution Header Skeleton */}
          <div className="bg-white border border-[#D8C9A8] rounded-xl p-6 shadow-none">
            <div className="flex justify-between items-center mb-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-72 rounded-lg" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#E8E0D0]">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>

          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 11 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>

          {/* Department Table Skeleton */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-56 rounded" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </CardContent>
          </Card>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error && !data) {
    const is403 = error.toLowerCase().includes('permission') || error.toLowerCase().includes('authorized');
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded-xl border border-[#D8C9A8] text-center shadow-none">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FBF0F0] border border-[#EBBABA] flex items-center justify-center text-[#B44747]">
            {is403 ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-serif font-bold text-[#202020] mb-2">
            {is403 ? 'Access Restricted' : 'Failed to Load Dashboard'}
          </h2>
          <p className="text-sm text-[#555555] mb-6">
            {error}
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={refetch}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry Connection
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <PageContainer>
      {/* Top Banner Alert if any soft error happened during refresh */}
      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Telemetry Warning">
            {error}
          </Alert>
        </div>
      )}

      {/* 1. Institution Profile Header */}
      <PrincipalInstitutionHeader
        institution={data.institution}
        onRefresh={refetch}
        isRefreshing={loading}
      />

      {/* 2. Primary KPI Telemetry Cards */}
      <PrincipalKpiCards kpis={data.kpiSummary} />

      {/* 3. Department Overview & Multi-Metric Comparison */}
      <PrincipalDepartmentTable departments={data.departments} />

      {/* 4. Academic Charts (Zero Fake Data) */}
      <PrincipalAcademicCharts
        students={data.students}
        resources={data.academicResources}
        requests={data.resourceRequests}
      />

      {/* 5. Hostel & Bed Occupancy Overview */}
      <PrincipalHostelOverviewCard hostel={data.hostel} />

      {/* 6. Pending Approvals & Safe Recent Activity */}
      <PrincipalApprovalsActivityCards
        approvals={data.approvals}
        recentActivity={data.recentActivity}
      />
    </PageContainer>
  );
};
export default PrincipalDashboard;
