import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrincipalMonitoring } from '../../hooks/usePrincipalMonitoring';
import { PageContainer } from '../../components/layout';
import {
  Skeleton,
  Card,
  CardContent,
  Button,
  Badge,
} from '../../components/ui';
import {
  RefreshCw,
  Building2,
  Users,
  GraduationCap,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Home,
  CheckCircle,
  XCircle,
  Search,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';

export const PrincipalMonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = usePrincipalMonitoring();

  const [deptSearch, setDeptSearch] = useState('');
  const [deptStatusFilter, setDeptStatusFilter] = useState('ALL');

  const filteredDepartments = useMemo(() => {
    if (!data?.departments) return [];
    return data.departments.filter((dept) => {
      const matchSearch =
        dept.departmentName.toLowerCase().includes(deptSearch.toLowerCase()) ||
        dept.departmentCode.toLowerCase().includes(deptSearch.toLowerCase()) ||
        (dept.hodName && dept.hodName.toLowerCase().includes(deptSearch.toLowerCase()));
      const matchStatus = deptStatusFilter === 'ALL' || dept.status === deptStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [data?.departments, deptSearch, deptStatusFilter]);

  if (loading && !data) {
    return (
      <PageContainer>
        <div className="space-y-6 animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-4 w-96 rounded" />
            </div>
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (error && !data) {
    const is403 = error.toLowerCase().includes('permission') || error.toLowerCase().includes('authorized');
    return (
      <PageContainer>
        <div className="max-w-2xl mx-auto mt-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
            {is403 ? <ShieldAlert className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {is403 ? 'Access Restricted' : 'Failed to Load Monitoring Overview'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <Button variant="primary" size="sm" onClick={refetch} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Retry Connection
          </Button>
        </div>
      </PageContainer>
    );
  }

  const summary = data?.summary;

  return (
    <PageContainer>
      <div className="space-y-8 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Institution Operational Monitoring
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live institution-wide operational monitoring, department statistics, hostel capacities, and approval status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/principal/approvals')}
              leftIcon={<Clock className="w-4 h-4 text-amber-500" />}
            >
              Approvals ({summary?.pendingApprovals ?? 0})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/principal/resource-requests')}
              leftIcon={<Layers className="w-4 h-4 text-blue-500" />}
            >
              Requests ({summary?.pendingRequests ?? 0})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/principal/allocations')}
              leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            >
              Allocations ({summary?.activeAllocations ?? 0})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refetch}
              disabled={loading}
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Institution Monitoring Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Departments</span>
              <Building2 className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {summary?.totalDepartments ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Academic Units</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Students</span>
              <GraduationCap className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {summary?.totalStudents?.toLocaleString() ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Enrolled Total</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Faculty</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {summary?.totalFaculty ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Teaching Staff</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Available</span>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary?.availableResources ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ready to Allocate</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Maintenance</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {summary?.maintenanceResources ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">In Service/Repair</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Appr.</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              {summary?.pendingApprovals ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Require Action</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Requests</span>
              <Layers className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {summary?.pendingRequests ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Pending Review</div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Allocations</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary?.activeAllocations ?? 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Active In-Use</div>
          </div>
        </div>

        {/* Department Monitoring Table */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  Department Operational Monitoring
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Academic, student, faculty, and resource request breakdown across institution departments
                </p>
              </div>

              {/* Department Filters */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search department, code, HOD..."
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-52"
                  />
                </div>

                <select
                  value={deptStatusFilter}
                  onChange={(e) => setDeptStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Head of Dept (HOD)</th>
                    <th className="py-3 px-4 text-center">Students</th>
                    <th className="py-3 px-4 text-center">Faculty</th>
                    <th className="py-3 px-4 text-center">Programs / Subjects</th>
                    <th className="py-3 px-4 text-center">Resource Requests</th>
                    <th className="py-3 px-4 text-center">Active Allocations</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDepartments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No department monitoring records match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDepartments.map((dept) => (
                      <tr
                        key={dept.departmentId}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          <div>{dept.departmentName}</div>
                          <span className="text-[11px] font-mono text-slate-400 uppercase">
                            {dept.departmentCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {dept.hodName || (
                            <span className="text-slate-400 italic">Not Assigned</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-slate-900 dark:text-white">
                          {dept.studentCount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-slate-900 dark:text-white">
                          {dept.facultyCount}
                        </td>
                        <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {dept.programCount}
                          </span>{' '}
                          progs /{' '}
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {dept.subjectCount}
                          </span>{' '}
                          subjs
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                              {dept.pendingRequests} pend
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                              {dept.approvedRequests} appr
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                              {dept.rejectedRequests} rej
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-emerald-600 dark:text-emerald-400">
                          {dept.activeAllocations}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={dept.status === 'ACTIVE' ? 'success' : 'neutral'}
                            size="sm"
                          >
                            {dept.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Hostel Monitoring Overview Table */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Home className="w-4 h-4 text-teal-500" />
                  Institution Hostel Monitoring
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Hostel block room counts, total beds, occupancy distribution, and current occupancy rate
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Hostel</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-center">Rooms</th>
                    <th className="py-3 px-4 text-center">Total Beds</th>
                    <th className="py-3 px-4 text-center">Occupied</th>
                    <th className="py-3 px-4 text-center">Available</th>
                    <th className="py-3 px-4 text-center">Maintenance</th>
                    <th className="py-3 px-4 text-center">Reserved</th>
                    <th className="py-3 px-4 text-center">Occupancy Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(!data?.hostels || data.hostels.length === 0) ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No hostel data available for this institution.
                      </td>
                    </tr>
                  ) : (
                    data.hostels.map((h) => (
                      <tr
                        key={h.hostelId}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                          <div>{h.hostelName}</div>
                          <span className="text-[11px] font-mono text-slate-400 uppercase">
                            {h.hostelCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          <span className="capitalize">{h.gender ? h.gender.toLowerCase() : 'Co-ed'}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-slate-900 dark:text-white">
                          {h.totalRooms}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-slate-900 dark:text-white">
                          {h.totalBeds}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-blue-600 dark:text-blue-400">
                          {h.occupiedBeds}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                          {h.availableBeds}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-amber-600 dark:text-amber-400">
                          {h.maintenanceBeds}
                        </td>
                        <td className="py-3 px-4 text-center font-medium text-purple-600 dark:text-purple-400">
                          {h.reservedBeds}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${Math.min(h.occupancyRate ?? 0, 100)}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {h.occupancyRate != null ? `${h.occupancyRate}%` : 'N/A'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Operational Activity Feed */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              Recent Operational Activity
            </h2>
            {(!data?.recentActivity || data.recentActivity.length === 0) ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No recent activity recorded for this institution.
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentActivity.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {act.action}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {act.details || `${act.entityType} #${act.entityId ?? ''}`}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        By: <span className="font-medium text-slate-600 dark:text-slate-300">{act.userName}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};
