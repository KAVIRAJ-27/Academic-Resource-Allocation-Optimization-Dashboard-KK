import React, { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../../services/api/analyticsApi';
import {
  AnalyticsFilterParams,
  AnalyticsOverview,
  AcademicUtilizationAnalytics,
  ClassroomAnalytics,
  LaboratoryAnalytics,
  EquipmentAnalytics,
  AllocationAnalytics,
  RequestAnalytics,
  ConflictAnalytics,
  FacultyWorkloadAnalytics,
  DepartmentAnalytics,
  HostelOccupancyAnalytics,
  RoomUtilization,
  HostelComplaintAnalytics,
  MaintenanceAnalytics,
} from '../../types/analytics';
import {
  MetricCard,
  AnalyticsFilterBar,
  UtilizationChart,
  AllocationChart,
  RequestStatusChart,
  TrendChart,
  DepartmentComparisonChart,
  HostelOccupancyChart,
  WorkloadChart,
  ConflictChart,
  TopBottomUtilizationTable,
  ReportToolbar,
} from '../../components/analytics';
import { useToast } from '../../components/ui/Toast';
import {
  BarChart3,
  Layers,
  CalendarRange,
  Hotel,
  Users,
  AlertTriangle,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  Wrench,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react';

interface AnalyticsDashboardPageProps {
  initialTab?: string;
}

export const AnalyticsDashboardPage: React.FC<AnalyticsDashboardPageProps> = ({
  initialTab = 'overview',
}) => {
  const { error, success } = useToast();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [filters, setFilters] = useState<AnalyticsFilterParams>({ preset: 'ALL' });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Analytical State
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [academicUtil, setAcademicUtil] = useState<AcademicUtilizationAnalytics | null>(null);
  const [classrooms, setClassrooms] = useState<ClassroomAnalytics | null>(null);
  const [laboratories, setLaboratories] = useState<LaboratoryAnalytics | null>(null);
  const [equipment, setEquipment] = useState<EquipmentAnalytics | null>(null);
  const [allocations, setAllocations] = useState<AllocationAnalytics | null>(null);
  const [requests, setRequests] = useState<RequestAnalytics | null>(null);
  const [conflicts, setConflicts] = useState<ConflictAnalytics | null>(null);
  const [workload, setWorkload] = useState<FacultyWorkloadAnalytics | null>(null);
  const [departments, setDepartments] = useState<DepartmentAnalytics | null>(null);
  const [hostelOccupancy, setHostelOccupancy] = useState<HostelOccupancyAnalytics | null>(null);
  const [roomUtil, setRoomUtil] = useState<RoomUtilization | null>(null);
  const [complaints, setComplaints] = useState<HostelComplaintAnalytics | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceAnalytics | null>(null);

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await analyticsApi.getOverview(filters);
        setOverview(data);
      } else if (activeTab === 'academic') {
        const [utilData, classData, labData, eqData] = await Promise.all([
          analyticsApi.getAcademicUtilization(filters),
          analyticsApi.getClassroomAnalytics(filters),
          analyticsApi.getLaboratoryAnalytics(filters),
          analyticsApi.getEquipmentAnalytics(filters),
        ]);
        setAcademicUtil(utilData);
        setClassrooms(classData);
        setLaboratories(labData);
        setEquipment(eqData);
      } else if (activeTab === 'allocations') {
        const [allocData, reqData, confData] = await Promise.all([
          analyticsApi.getAllocationAnalytics(filters),
          analyticsApi.getRequestAnalytics(filters),
          analyticsApi.getConflictAnalytics(filters),
        ]);
        setAllocations(allocData);
        setRequests(reqData);
        setConflicts(confData);
      } else if (activeTab === 'hostel') {
        const [hostelData, roomData] = await Promise.all([
          analyticsApi.getHostelOccupancy(filters),
          analyticsApi.getRoomUtilization(filters),
        ]);
        setHostelOccupancy(hostelData);
        setRoomUtil(roomData);
      } else if (activeTab === 'workload') {
        const [workData, deptData] = await Promise.all([
          analyticsApi.getFacultyWorkloadAnalytics(filters),
          analyticsApi.getDepartmentAnalytics(filters),
        ]);
        setWorkload(workData);
        setDepartments(deptData);
      } else if (activeTab === 'operations') {
        const [compData, maintData] = await Promise.all([
          analyticsApi.getHostelComplaints(filters),
          analyticsApi.getMaintenanceAnalytics(filters),
        ]);
        setComplaints(compData);
        setMaintenance(maintData);
      }
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to load analytics data.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, filters, error]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleExportCsv = async (reportType: string) => {
    try {
      await analyticsApi.exportReport(reportType, filters);
      success('Report exported successfully.');
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to export CSV report.');
      throw err;
    }
  };

  const navTabs = [
    { id: 'overview', label: 'System Overview', icon: BarChart3 },
    { id: 'academic', label: 'Academic Resources', icon: Layers },
    { id: 'allocations', label: 'Allocations & Requests', icon: CalendarRange },
    { id: 'hostel', label: 'Hostel & Occupancy', icon: Hotel },
    { id: 'workload', label: 'Faculty & Workload', icon: Users },
    { id: 'operations', label: 'Grievances & Maintenance', icon: AlertTriangle },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-teal-400">
              Live Telemetry & Intelligence
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Institutional Utilization Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Real-time mathematical aggregation across physical infrastructure, academic allocations, hostel living, and operations.
          </p>
        </div>

        {/* Quick Report Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 rounded-xl border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-xs font-bold text-teal-300 transition hover:bg-teal-500/20 active:scale-95"
          >
            <FileText className="h-4 w-4" />
            <span>Generate Reports</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <AnalyticsFilterBar
        filters={filters}
        onChange={setFilters}
        onRefresh={fetchAnalyticsData}
        isLoading={isLoading}
      />

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-800/80 pb-2 text-xs font-medium">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 transition ${
                isActive
                  ? 'border border-teal-500/30 bg-teal-500/10 font-bold text-teal-300 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. SYSTEM OVERVIEW TAB                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Academic Utilization"
              value={`${overview?.overallResourceUtilization || 0}%`}
              subtitle={`${overview?.allocatedResources || 0} of ${overview?.totalResources || 0} active resources`}
              icon={Layers}
              accentColor="teal"
              badge="Capacity"
              badgeColor="teal"
              isLoading={isLoading}
            />
            <MetricCard
              title="Hostel Bed Occupancy"
              value={`${overview?.hostelOccupancyPercentage || 0}%`}
              subtitle={`${overview?.occupiedBeds || 0} occupied of ${overview?.totalBeds || 0} total beds`}
              icon={Hotel}
              accentColor="emerald"
              badge="Residential"
              badgeColor="emerald"
              isLoading={isLoading}
            />
            <MetricCard
              title="Active Allocations"
              value={overview?.activeAllocations || 0}
              subtitle={`${overview?.totalAllocations || 0} total lifetime bookings`}
              icon={CalendarRange}
              accentColor="blue"
              badge="Allocations"
              badgeColor="indigo"
              isLoading={isLoading}
            />
            <MetricCard
              title="Pending Requests"
              value={(overview?.pendingRequests || 0) + (overview?.pendingHostelRequests || 0)}
              subtitle={`${overview?.pendingRequests || 0} academic, ${overview?.pendingHostelRequests || 0} hostel`}
              icon={Clock}
              accentColor="amber"
              badge="Action Items"
              badgeColor="amber"
              isLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              title="Open Grievances"
              value={overview?.openComplaints || 0}
              subtitle="Hostel complaints requiring resolution"
              icon={AlertTriangle}
              accentColor="purple"
              isLoading={isLoading}
            />
            <MetricCard
              title="Pending Maintenance"
              value={overview?.pendingMaintenance || 0}
              subtitle="Open infrastructure work orders"
              icon={Wrench}
              accentColor="amber"
              isLoading={isLoading}
            />
            <MetricCard
              title="Detected Conflicts"
              value={overview?.totalConflictsDetected || 0}
              subtitle="Inter-schedule & scope collisions mitigated"
              icon={ShieldAlert}
              accentColor="teal"
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ACADEMIC RESOURCES TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'academic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MetricCard
              title="Classroom Utilization"
              value={`${classrooms?.classroomUtilizationPercentage || 0}%`}
              subtitle={`${classrooms?.allocatedClassrooms || 0} allocated of ${classrooms?.totalClassrooms || 0} total`}
              icon={Building2}
              accentColor="teal"
              isLoading={isLoading}
            />
            <MetricCard
              title="Classroom Capacity Load"
              value={`${classrooms?.averageCapacityUtilization || 0}%`}
              subtitle="Average student seat utilization rate"
              icon={GraduationCap}
              accentColor="blue"
              isLoading={isLoading}
            />
            <MetricCard
              title="Laboratory Utilization"
              value={`${laboratories?.laboratoryUtilizationPercentage || 0}%`}
              subtitle={`${laboratories?.allocatedLaboratories || 0} allocated of ${laboratories?.totalLaboratories || 0} labs`}
              icon={Layers}
              accentColor="purple"
              isLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <UtilizationChart
              categoryData={academicUtil?.resourcesByCategory}
              type="bar"
              title="Resource Counts by Category"
            />
            <UtilizationChart
              trends={academicUtil?.utilizationTrends}
              type="area"
              title="Resource Allocation Volume Over Time"
            />
          </div>

          <TopBottomUtilizationTable
            topResources={academicUtil?.topUtilizedResources || []}
            bottomResources={academicUtil?.lowestUtilizedResources || []}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ALLOCATIONS & REQUESTS TAB                                             */}
      {/* ========================================================================= */}
      {activeTab === 'allocations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <MetricCard
              title="Total Requests"
              value={requests?.totalRequests || 0}
              subtitle="Lifetime resource requests submitted"
              icon={FileText}
              accentColor="teal"
              isLoading={isLoading}
            />
            <MetricCard
              title="Approval Rate"
              value={`${requests?.approvalRate || 0}%`}
              subtitle={`${requests?.approvedRequests || 0} requests approved`}
              icon={CheckCircle2}
              accentColor="emerald"
              isLoading={isLoading}
            />
            <MetricCard
              title="Rejection Rate"
              value={`${requests?.rejectionRate || 0}%`}
              subtitle={`${requests?.rejectedRequests || 0} rejected with reasons`}
              icon={AlertTriangle}
              accentColor="purple"
              isLoading={isLoading}
            />
            <MetricCard
              title="Total Allocations"
              value={allocations?.totalAllocations || 0}
              subtitle={`${allocations?.activeAllocations || 0} currently active`}
              icon={CalendarRange}
              accentColor="blue"
              isLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <RequestStatusChart
              statusData={requests?.statusDistribution}
              title="Request Pipeline Status"
            />
            <AllocationChart
              statusData={allocations?.statusDistribution}
              type="pie"
              title="Allocation Status Distribution"
            />
            {conflicts && <ConflictChart conflicts={conflicts} />}
          </div>

          <TrendChart
            data={requests?.requestsOverTime || []}
            title="Monthly Requisition Volume Trends"
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. HOSTEL & OCCUPANCY TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'hostel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <MetricCard
              title="Campus Occupancy"
              value={`${hostelOccupancy?.occupancyPercentage || 0}%`}
              subtitle={`${hostelOccupancy?.occupiedBeds || 0} occupied beds`}
              icon={Hotel}
              accentColor="emerald"
              isLoading={isLoading}
            />
            <MetricCard
              title="Available Beds"
              value={hostelOccupancy?.availableBeds || 0}
              subtitle={`${hostelOccupancy?.availabilityPercentage || 0}% of active bed capacity`}
              icon={CheckCircle2}
              accentColor="teal"
              isLoading={isLoading}
            />
            <MetricCard
              title="Maintenance Beds"
              value={hostelOccupancy?.maintenanceBeds || 0}
              subtitle="Beds quarantined for repairs"
              icon={Wrench}
              accentColor="amber"
              isLoading={isLoading}
            />
            <MetricCard
              title="Total Hostels & Blocks"
              value={`${hostelOccupancy?.totalHostels || 0} Hostels`}
              subtitle={`${hostelOccupancy?.totalBlocks || 0} residential blocks`}
              icon={Building2}
              accentColor="purple"
              isLoading={isLoading}
            />
          </div>

          <HostelOccupancyChart
            hostels={hostelOccupancy?.hostelOccupancies || []}
            title="Hostel-Wise Bed Occupancy Breakdown"
          />

          {/* Room Inventory Sample */}
          {roomUtil && roomUtil.roomList.length > 0 && (
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-300">
                Sample Residential Room Occupancy (Top 20)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2.5 font-medium">Room Number</th>
                      <th className="pb-2.5 font-medium">Hostel & Block</th>
                      <th className="pb-2.5 font-medium">Floor</th>
                      <th className="pb-2.5 font-medium text-right">Capacity</th>
                      <th className="pb-2.5 font-medium text-right">Occupied</th>
                      <th className="pb-2.5 font-medium text-right">Available</th>
                      <th className="pb-2.5 font-medium text-right">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {roomUtil.roomList.slice(0, 20).map((r) => (
                      <tr key={r.roomId} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-semibold text-white">{r.roomNumber}</td>
                        <td className="py-2.5 text-slate-400">
                          {r.hostelName} - {r.blockName}
                        </td>
                        <td className="py-2.5">{r.floorNumber}</td>
                        <td className="py-2.5 text-right font-mono">{r.capacity}</td>
                        <td className="py-2.5 text-right font-mono text-emerald-400">
                          {r.occupiedBeds}
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-400">
                          {r.availableBeds}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold">
                          {r.utilizationPercentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. FACULTY & WORKLOAD TAB                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'workload' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <MetricCard
              title="Total Faculty"
              value={workload?.totalFaculty || 0}
              subtitle="Registered instructional staff"
              icon={Users}
              accentColor="teal"
              isLoading={isLoading}
            />
            <MetricCard
              title="Average Workload"
              value={`${workload?.averageWorkloadHours || 0} hrs`}
              subtitle="Weekly instruction and lab hours"
              icon={Clock}
              accentColor="blue"
              isLoading={isLoading}
            />
            <MetricCard
              title="Overloaded Staff"
              value={workload?.overloadedFacultyCount || 0}
              subtitle="Faculty exceeding threshold workload"
              icon={AlertTriangle}
              accentColor="purple"
              isLoading={isLoading}
            />
            <MetricCard
              title="Balanced Staff"
              value={workload?.balancedFacultyCount || 0}
              subtitle="Faculty within healthy load parameters"
              icon={CheckCircle2}
              accentColor="emerald"
              isLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <WorkloadChart statusDistribution={workload?.workloadStatusDistribution} />
            {departments && (
              <DepartmentComparisonChart departments={departments.departments} />
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. GRIEVANCES & MAINTENANCE TAB                                          */}
      {/* ========================================================================= */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <MetricCard
              title="Total Grievances"
              value={complaints?.totalComplaints || 0}
              subtitle="Student complaints logged"
              icon={AlertTriangle}
              accentColor="purple"
              isLoading={isLoading}
            />
            <MetricCard
              title="Grievance Resolution Rate"
              value={`${complaints?.resolutionRate || 0}%`}
              subtitle={`${(complaints?.resolvedComplaints || 0) + (complaints?.closedComplaints || 0)} complaints closed`}
              icon={CheckCircle2}
              accentColor="emerald"
              isLoading={isLoading}
            />
            <MetricCard
              title="Maintenance Tickets"
              value={maintenance?.totalMaintenanceRequests || 0}
              subtitle="Facility work orders issued"
              icon={Wrench}
              accentColor="teal"
              isLoading={isLoading}
            />
            <MetricCard
              title="Maintenance Completion"
              value={`${maintenance?.completionRate || 0}%`}
              subtitle={`${maintenance?.completedMaintenance || 0} tickets resolved`}
              icon={CheckCircle2}
              accentColor="blue"
              isLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RequestStatusChart
              statusData={complaints?.complaintsByStatus}
              title="Hostel Complaint Status Distribution"
            />
            <RequestStatusChart
              statusData={maintenance?.maintenanceByStatus}
              title="Maintenance Work Order Status Distribution"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. REPORTS & EXPORT TAB                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <ReportToolbar onExport={handleExportCsv} filters={filters} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Export Format
              </h4>
              <p className="mt-2 text-xs text-slate-400">
                Standard RFC-4180 UTF-8 CSV format suitable for Microsoft Excel, Google Sheets, or data pipeline ingestion.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Audited & Governed
              </h4>
              <p className="mt-2 text-xs text-slate-400">
                Every exported file is automatically recorded in institutional audit logs with timestamp, actor, and row volume.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 backdrop-blur-md">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Scoped & Filtered
              </h4>
              <p className="mt-2 text-xs text-slate-400">
                Active date ranges and scope filters are strictly honored in the exported tabular data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
