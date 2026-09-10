import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageContainer,
  PageHeader,
  ContentSection,
  DashboardGrid,
  GridCol,
} from '../../components/layout';
import {
  Button,
  Badge,
  Alert,
  ActionCard,
} from '../../components/ui';
import {
  FacultyDashboardSkeleton,
  FacultyProfileCard,
  FacultyKpiCards,
  FacultyWorkloadCard,
  FacultySubjectsCard,
  FacultyTimetableCard,
  FacultyRequisitionsCard,
  FacultyActivityCard,
} from '../../components/faculty/dashboard';
import { useFacultyDashboard } from '../../hooks/useFacultyDashboard';
import {
  BookOpen,
  Clock,
  Activity,
  Layers,
  Send,
  User,
  RefreshCw,
  Plus,
  AlertCircle,
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dashboard, loading, error, refresh } = useFacultyDashboard();

  if (loading && !dashboard) {
    return (
      <PageContainer>
        <FacultyDashboardSkeleton />
      </PageContainer>
    );
  }

  const deptName = dashboard?.department?.departmentName || dashboard?.profile?.departmentName;

  return (
    <PageContainer>
      {error && (
        <Alert
          variant="error"
          title="Telemetry Synchronization Warning"
          className="mb-6"
        >
          <div className="flex items-center justify-between gap-4 mt-1">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={refresh}>
              Retry
            </Button>
          </div>
        </Alert>
      )}

      {/* Main Header */}
      <PageHeader
        title={
          dashboard?.profile?.fullName
            ? `Welcome, ${dashboard.profile.fullName}`
            : 'Faculty Academic Instruction Portal'
        }
        description={
          deptName
            ? `${deptName} &bull; Personal instructional schedule, assigned syllabus modules, workload metrics, and requisitions.`
            : 'Instructional schedule overview, assigned lecture halls and labs, personal teaching workload metrics, and resource requisitions.'
        }
        badge={
          <Badge variant="purple" dot>
            {dashboard?.profile?.designation || 'FACULTY DESK'}
          </Badge>
        }
        primaryAction={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/faculty/requests')}
          >
            New Requisition
          </Button>
        }
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={refresh}
            disabled={loading}
          >
            Refresh Telemetry
          </Button>
        }
      />

      {/* 1. Real Database KPI Metrics */}
      <ContentSection
        title="Instructional Telemetry Indicators"
        subtitle="Live metrics computed directly from institutional records"
      >
        <FacultyKpiCards metrics={dashboard?.metrics} />
      </ContentSection>

      {/* 2. Faculty Profile & Workload Split */}
      <DashboardGrid cols={3} className="gap-6">
        <GridCol span={1}>
          <FacultyProfileCard
            profile={dashboard?.profile}
            department={dashboard?.department}
          />
        </GridCol>
        <GridCol span={2}>
          <FacultyWorkloadCard workload={dashboard?.workloadSummary} />
        </GridCol>
      </DashboardGrid>

      {/* 3. Assigned Subjects & Timetable Schedule */}
      <DashboardGrid cols={2} className="gap-6">
        <GridCol span={1}>
          <FacultySubjectsCard subjects={dashboard?.assignedSubjects} />
        </GridCol>
        <GridCol span={1}>
          <FacultyTimetableCard timetable={dashboard?.timetableSummary} />
        </GridCol>
      </DashboardGrid>

      {/* 4. Requisitions & Recent Activity */}
      <DashboardGrid cols={2} className="gap-6">
        <GridCol span={1}>
          <FacultyRequisitionsCard requisitions={dashboard?.requisitionSummary} />
        </GridCol>
        <GridCol span={1}>
          <FacultyActivityCard activities={dashboard?.recentActivities} />
        </GridCol>
      </DashboardGrid>

      {/* 5. Academic Workspaces Navigation */}
      <ContentSection
        title="Faculty Workspaces & Quick Actions"
        subtitle="Direct navigation across instructional portals and resource planning"
      >
        <DashboardGrid cols={3} className="gap-4">
          <ActionCard
            title="Assigned Courses"
            description="View registered subjects, student rosters, lecture plans, and milestones."
            icon={BookOpen}
            badge={<Badge variant="purple">Curriculum</Badge>}
            onClick={() => navigate('/faculty/courses')}
          />
          <ActionCard
            title="Instruction Timetable"
            description="Personal weekly matrix of classes, venue directions, and practical slots."
            icon={Clock}
            badge={<Badge variant="teal">Schedule</Badge>}
            onClick={() => navigate('/faculty/timetable')}
          />
          <ActionCard
            title="Teaching Workload"
            description="Detailed audit of credit hours, lecture quotas, and balance indicators."
            icon={Activity}
            badge={<Badge variant="blue">Metrics</Badge>}
            onClick={() => navigate('/faculty/workload')}
          />
          <ActionCard
            title="Lab & Room Access"
            description="Designated smart classrooms, specialized hardware setups, and network nodes."
            icon={Layers}
            badge={<Badge variant="teal">Venues</Badge>}
            onClick={() => navigate('/faculty/resources')}
          />
          <ActionCard
            title="Resource Requisitions"
            description="Request additional computing hours, specialized hardware, or hall bookings."
            icon={Send}
            badge={<Badge variant="warning">Requisitions</Badge>}
            onClick={() => navigate('/faculty/resource-requests')}
          />
          <ActionCard
            title="Academic Profile"
            description="Review employment records, qualifications, department lineage, and contact info."
            icon={User}
            badge={<Badge variant="purple">Credentials</Badge>}
            onClick={() => navigate('/faculty/profile')}
          />
        </DashboardGrid>
      </ContentSection>
    </PageContainer>
  );
};
