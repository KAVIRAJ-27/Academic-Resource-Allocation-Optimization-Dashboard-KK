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
  StatCard,
  ChartCard,
  ActionCard,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  EmptyState,
} from '../../components/ui';
import {
  BookOpen,
  Clock,
  Hotel,
  AlertCircle,
  Layers,
  User,
  BedDouble,
  RefreshCw,
  Plus,
  CheckCircle2,
  Calendar,
  Activity,
  Hash,
} from 'lucide-react';
import { useStudentDashboard } from '../../hooks/useStudentDashboard';
import { StudentProfileSkeleton } from '../../components/student/profile/StudentProfileSkeleton';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { dashboard, loading, error, refresh } = useStudentDashboard();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading && !dashboard) {
    return (
      <PageContainer>
        <PageHeader
          title="Student Academic & Hostel Portal"
          description="Unified hub for enrolled course schedules, classroom directions, academic resource reservations, hostel room assignment, and maintenance tickets."
          badge={<Badge variant="teal" dot>STUDENT DESK</Badge>}
        />
        <StudentProfileSkeleton />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Student Academic & Hostel Portal"
        description="Unified hub for enrolled course schedules, classroom directions, academic resource reservations, hostel room assignment, and maintenance tickets."
        badge={<Badge variant="teal" dot>STUDENT DESK</Badge>}
        primaryAction={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<User className="w-3.5 h-3.5" />}
            onClick={() => navigate('/student/profile')}
          >
            My Profile
          </Button>
        }
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={refresh}
            isLoading={loading}
          >
            Refresh Data
          </Button>
        }
      />

      {/* 1. Student Personal Welcome Banner */}
      {dashboard && (
        <Card className="p-5 bg-gradient-to-r from-[#11141C] via-[#141824] to-[#11141C] border-[#1E2330]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 shadow-card">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {getGreeting()}, {dashboard.student?.name || 'Student'}
                  </h2>
                  <Badge
                    variant={dashboard.student?.status === 'ACTIVE' ? 'teal' : 'neutral'}
                    dot
                    size="sm"
                  >
                    {dashboard.student?.status || 'ACTIVE'}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap font-mono">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                    {dashboard.student?.registerNumber}
                  </span>
                  {dashboard.academic?.programName && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>{dashboard.academic.programName}</span>
                    </>
                  )}
                  {dashboard.academic?.currentSemester && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>Sem {dashboard.academic.currentSemester}</span>
                    </>
                  )}
                  {dashboard.academic?.sectionName && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>Sec {dashboard.academic.sectionName}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                onClick={() => navigate('/student/profile')}
              >
                View Profile
              </Button>
              <Button
                variant="outline"
                size="xs"
                onClick={() => navigate('/student/academics')}
              >
                Academics
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 2. Real Database Telemetry Indicators (No Fake Data) */}
      <ContentSection
        title="Academic & Residential Status"
        subtitle="Current semester registration and designated residential accommodations"
      >
        <DashboardGrid variant="stats">
          <StatCard
            title="Enrolled Courses"
            value={dashboard ? dashboard.metrics.enrolledCoursesCount.toString() : '--'}
            description="Active semester subjects"
            icon={BookOpen}
            badge={<Badge variant="teal">Registered</Badge>}
            trend={{ direction: 'neutral', label: 'Semester active' }}
            footerText={
              dashboard?.academic?.programCode
                ? `Program: ${dashboard.academic.programCode}`
                : 'Verified course load'
            }
          />
          <StatCard
            title="Class Hours / Wk"
            value={
              dashboard
                ? `${dashboard.metrics.weeklyClassHours} hrs`
                : '--'
            }
            description="Scheduled lectures & labs"
            icon={Clock}
            badge={<Badge variant="blue">Schedule</Badge>}
            trend={{ direction: 'neutral', label: 'Timetable synced' }}
            footerText={
              dashboard?.academic?.sectionName
                ? `Section ${dashboard.academic.sectionName}`
                : 'Attendance active'
            }
          />
          <StatCard
            title="Hostel Bed Space"
            value={
              dashboard?.hostel?.allocated
                ? `Rm ${dashboard.hostel.roomNumber} (${dashboard.hostel.bedNumber})`
                : 'Day Scholar'
            }
            description={
              dashboard?.hostel?.allocated
                ? `${dashboard.hostel.hostelName || 'Hostel'} • ${dashboard.hostel.blockName || 'Block'}`
                : 'No residential allocation'
            }
            icon={BedDouble}
            badge={
              <Badge variant={dashboard?.hostel?.allocated ? 'orange' : 'neutral'}>
                {dashboard?.hostel?.allocated ? 'Allocated' : 'Day Scholar'}
              </Badge>
            }
            trend={{ direction: 'neutral', label: 'Verified status' }}
            footerText="Hostel registry synced"
          />
          <StatCard
            title="Active Allocations"
            value={dashboard ? dashboard.metrics.activeAllocationsCount.toString() : '0'}
            description="Assigned resources / items"
            icon={AlertCircle}
            badge={<Badge variant="success">All Clear</Badge>}
            trend={{ direction: 'neutral', label: 'Active records' }}
            footerText="Resource allocation desk"
          />
        </DashboardGrid>
      </ContentSection>

      {/* 3. Portals & Recent Activity Split */}
      <DashboardGrid variant="split">
        <GridCol span={2}>
          <ContentSection
            title="Student Portals"
            subtitle="Quick access to profile, academic courses, timetables, and housing"
          >
            <DashboardGrid cols={2}>
              <ActionCard
                title="Student Profile"
                description="View verified enrollment details, change contact phone, and view credentials."
                icon={User}
                badge={<Badge variant="teal">Profile</Badge>}
                onClick={() => navigate('/student/profile')}
              />
              <ActionCard
                title="Class Timetable"
                description="Daily class schedule with lecture hall and laboratory venue directions."
                icon={Clock}
                badge={<Badge variant="blue">Schedule</Badge>}
                onClick={() => navigate('/student/academics')}
              />
              <ActionCard
                title="Enrolled Subjects"
                description="Registered semester courses, instructors, and credit units catalog."
                icon={BookOpen}
                badge={<Badge variant="purple">Courses</Badge>}
                onClick={() => navigate('/student/academics')}
              />
              <ActionCard
                title="Residential Accommodation"
                description="Assigned hostel block, room number, floor, and bed status."
                icon={Hotel}
                badge={<Badge variant="orange">Housing</Badge>}
                onClick={() => navigate('/student/profile')}
              />
            </DashboardGrid>
          </ContentSection>
        </GridCol>

        <GridCol span={1}>
          <ContentSection
            title="Recent Activity"
            subtitle="Verified session and profile events"
          >
            <Card className="h-full min-h-[260px] flex flex-col justify-between bg-[#11141C] border-[#1E2330]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-100">
                    <Activity className="w-4 h-4 text-teal-400" />
                    Security & Event Log
                  </CardTitle>
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                </div>
                <CardDescription className="text-xs text-gray-400">
                  Audit trail for authenticated account
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-4">
                {dashboard?.recentActivities && dashboard.recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {dashboard.recentActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-2.5 rounded-xl bg-[#171A23] border border-[#222838] flex items-start gap-2.5"
                      >
                        <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 shrink-0 mt-0.5">
                          <Activity className="w-3 h-3" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-200 truncate">
                            {act.description || act.action}
                          </p>
                          <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                            {new Date(act.timestamp).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No recent activity yet"
                    description="Account events and verified profile modifications will be displayed here."
                    icon={CheckCircle2}
                    compact
                  />
                )}
              </CardContent>
            </Card>
          </ContentSection>
        </GridCol>
      </DashboardGrid>
    </PageContainer>
  );
};
