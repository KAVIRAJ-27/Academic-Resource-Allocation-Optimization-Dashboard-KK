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
  Hotel,
  BedDouble,
  Users,
  AlertTriangle,
  Wrench,
  BarChart2,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Wifi,
} from 'lucide-react';
import { useWardenOverview } from '../../hooks/useWardenOverview';

export const WardenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { overview, loading, refetch } = useWardenOverview();

  const occupancyRate =
    overview && overview.totalBeds > 0
      ? Math.round((overview.occupiedBeds / overview.totalBeds) * 100)
      : 0;

  return (
    <PageContainer>
      <PageHeader
        title="Hostel & Residential Operations Command"
        description="Authorized hostel block administration, real-time bed occupancy telemetry, student room allocation, digital maintenance ticketing, and residential facilities coordination."
        badge={<Badge variant="orange" dot>WARDEN DESK</Badge>}
        primaryAction={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/warden/allocations/new')}
          >
            Allocate Bed
          </Button>
        }
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={loading}
          >
            Refresh Telemetry
          </Button>
        }
      />

      {/* 1. Residential Telemetry Stats (Live Scoped Data) */}
      <ContentSection
        title="Residential Operations Indicators"
        subtitle="Current occupancy, resident student headcounts, and active work orders"
      >
        <DashboardGrid variant="stats">
          <StatCard
            title="Total Bed Capacity"
            value={overview ? overview.totalBeds.toString() : '--'}
            description={
              overview
                ? `${overview.occupiedBeds} occupied / ${overview.availableBeds} vacant`
                : 'Assigned hostel blocks'
            }
            icon={BedDouble}
            badge={<Badge variant="orange">{occupancyRate}% Occupied</Badge>}
            trend={{ direction: 'neutral', label: 'Beds online' }}
            footerText="Hostel block registry active"
          />
          <StatCard
            title="Resident Students"
            value={overview ? overview.residentStudents.toString() : '--'}
            description="Checked-in student residents"
            icon={Users}
            badge={<Badge variant="teal">Residents</Badge>}
            trend={{ direction: 'neutral', label: 'Active check-ins' }}
            footerText="Resident registry nominal"
          />
          <StatCard
            title="Open Work Orders"
            value={overview ? overview.openMaintenance.toString() : '--'}
            description={
              overview
                ? `${overview.inProgressMaintenance} in progress (${overview.completedMaintenance} done)`
                : 'Plumbing, electrical & carpentry'
            }
            icon={Wrench}
            badge={
              overview && overview.openMaintenance > 0 ? (
                <Badge variant="danger" dot>Action Required</Badge>
              ) : (
                <Badge variant="neutral">Nominal</Badge>
              )
            }
            trend={{ direction: 'neutral', label: 'Dispatch queue' }}
            footerText="Technician dispatch service ready"
          />
          <StatCard
            title="Student Grievances"
            value={overview ? overview.openComplaints.toString() : '--'}
            description={
              overview
                ? `${overview.inProgressComplaints} under review (${overview.resolvedComplaints} resolved)`
                : 'Incoming resident grievances'
            }
            icon={AlertTriangle}
            badge={
              overview && overview.openComplaints > 0 ? (
                <Badge variant="warning" dot>Pending</Badge>
              ) : (
                <Badge variant="neutral">All clear</Badge>
              )
            }
            trend={{ direction: 'neutral', label: 'Grievance desk' }}
            footerText="Student care portal active"
          />
        </DashboardGrid>
      </ContentSection>

      {/* 2. Residential Analytics Charts */}
      <ContentSection
        title="Hostel Capacity & Maintenance Velocity"
        subtitle="Block-wise bed occupancy and maintenance resolution metrics"
      >
        <DashboardGrid variant="charts">
          <ChartCard
            title="Hostel Bed Capacity Telemetry"
            subtitle="Aggregated occupied, vacant, and total bed inventory"
            icon={BarChart2}
            emptyTitle={overview ? `${overview.occupiedBeds} Beds Occupied of ${overview.totalBeds}` : 'No occupancy telemetry recorded'}
            emptyDescription={
              overview && overview.totalBeds > 0
                ? `Current occupancy is at ${occupancyRate}%. ${overview.availableBeds} beds remain vacant across your assigned hostel blocks.`
                : 'Bed utilization trends will render once rooms and beds are populated in your assigned hostel.'
            }
          />
          <ChartCard
            title="Facilities & Amenities Health"
            subtitle="Active amenities, water purifiers, Wi-Fi points, and maintenance tickets"
            icon={Wifi}
            emptyTitle={overview ? `${overview.activeFacilities} of ${overview.totalFacilities} Facilities Active` : 'No facility telemetry available'}
            emptyDescription={
              overview && overview.totalFacilities > 0
                ? `${overview.activeFacilities} hostel facilities are operational. ${overview.openMaintenance + overview.inProgressMaintenance} repair orders are currently ongoing.`
                : 'Facility health statistics will display as hostel amenities and infrastructure are registered.'
            }
          />
        </DashboardGrid>
      </ContentSection>

      {/* 3. Warden Workspaces & Maintenance Dispatch Split */}
      <DashboardGrid variant="split">
        <GridCol span={2}>
          <ContentSection
            title="Residential Workspaces"
            subtitle="Direct navigation to block management, bed matrices, complaints, and work orders"
          >
            <DashboardGrid cols={2}>
              <ActionCard
                title="Bed Occupancy Matrix"
                description="Visual floor-by-floor bed grid showing vacant, occupied, and blocked spaces."
                icon={BedDouble}
                badge={<Badge variant="orange">Matrix</Badge>}
                onClick={() => navigate('/warden/beds')}
              />
              <ActionCard
                title="Resident Allocations"
                description="Manage room allocations, check-ins, and bed assignments for enrolled students."
                icon={Users}
                badge={<Badge variant="teal">Allocations</Badge>}
                onClick={() => navigate('/warden/allocations')}
              />
              <ActionCard
                title="Maintenance Work Orders"
                description="Dispatch service technicians for verified electrical, plumbing, and carpentry repairs."
                icon={Wrench}
                badge={
                  overview && overview.openMaintenance > 0 ? (
                    <Badge variant="warning">{overview.openMaintenance} Open</Badge>
                  ) : (
                    <Badge variant="neutral">Repairs</Badge>
                  )
                }
                onClick={() => navigate('/warden/maintenance')}
              />
              <ActionCard
                title="Hostel Facilities & Amenities"
                description="Inventory of water purifiers, Wi-Fi routers, study rooms, and recreation equipment."
                icon={Hotel}
                badge={
                  overview ? (
                    <Badge variant="neutral">{overview.totalFacilities} Items</Badge>
                  ) : (
                    <Badge variant="neutral">Assets</Badge>
                  )
                }
                onClick={() => navigate('/warden/resources')}
              />
              <ActionCard
                title="Resident Grievances"
                description="Track student complaints, investigate room issues, and log resolutions."
                icon={AlertTriangle}
                badge={
                  overview && overview.openComplaints > 0 ? (
                    <Badge variant="danger">{overview.openComplaints} Open</Badge>
                  ) : (
                    <Badge variant="neutral">Complaints</Badge>
                  )
                }
                onClick={() => navigate('/warden/complaints')}
              />
              <ActionCard
                title="Room Directory"
                description="Inspect floor layouts, capacities, room statuses, and bed counts."
                icon={Hotel}
                badge={<Badge variant="neutral">Directory</Badge>}
                onClick={() => navigate('/warden/rooms')}
              />
            </DashboardGrid>
          </ContentSection>
        </GridCol>

        <GridCol span={1}>
          <ContentSection
            title="Dispatch Queue"
            subtitle="Maintenance technician assignments"
          >
            <Card className="h-full min-h-[260px] flex flex-col justify-between">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-serif font-bold text-[#202020]">
                    <Wrench className="w-4 h-4 text-[#A87928]" />
                    Technician Dispatch
                  </CardTitle>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      overview && overview.openMaintenance > 0 ? 'bg-[#A87928] animate-pulse' : 'bg-[#3F7655]'
                    }`}
                  />
                </div>
                <CardDescription className="text-xs text-[#77736A]">
                  {overview && overview.openMaintenance > 0
                    ? `${overview.openMaintenance} work order(s) awaiting dispatch`
                    : 'Residential repair tickets status'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
                {overview && overview.openMaintenance > 0 ? (
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#E8D8BA] flex items-center justify-center mx-auto text-[#A87928]">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-[#202020]">
                        {overview.openMaintenance} Urgent Orders
                      </h4>
                      <p className="text-xs text-[#555555] max-w-xs mx-auto">
                        New maintenance requests require technician assignment.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Wrench className="w-3.5 h-3.5" />}
                      onClick={() => navigate('/warden/maintenance')}
                    >
                      View Dispatch Queue
                    </Button>
                  </div>
                ) : (
                  <EmptyState
                    title="No urgent dispatches"
                    description="All residential maintenance tickets have been investigated or resolved."
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
