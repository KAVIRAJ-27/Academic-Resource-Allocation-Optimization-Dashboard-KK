import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageContainer,
  PageHeader,
  ContentSection,
  DashboardGrid,
} from '../../components/layout';
import {
  StatCard,
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
  Wrench,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Building,
  Plus,
  UserCheck,
  Filter,
} from 'lucide-react';
import { useWardenHostels } from '../../hooks/useWardenHostels';
import { useWardenMaintenance } from '../../hooks/useWardenMaintenance';
import { HostelScopeSelector } from '../../components/warden/HostelScopeSelector';
import {
  MaintenanceStatus,
  PriorityLevel,
  WardenMaintenanceSummary,
} from '../../types/wardenOperations';

export const WardenMaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const { hostels, selectedHostelId, selectedHostel, selectHostel, loading: hostelsLoading } =
    useWardenHostels();

  const {
    maintenanceRequests,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading: maintenanceLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch,
  } = useWardenMaintenance({ hostelId: selectedHostelId });

  useEffect(() => {
    if (selectedHostelId !== filters.hostelId) {
      updateFilters({ hostelId: selectedHostelId });
    }
  }, [selectedHostelId, filters.hostelId, updateFilters]);

  const statusTabs: { key: MaintenanceStatus | ''; label: string }[] = [
    { key: '', label: 'All Orders' },
    { key: 'OPEN', label: 'Open' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="danger" dot>URGENT</Badge>;
      case 'HIGH':
        return <Badge variant="orange" dot>HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">MEDIUM</Badge>;
      case 'LOW':
        return <Badge variant="neutral">LOW</Badge>;
      default:
        return <Badge variant="neutral">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="danger">OPEN</Badge>;
      case 'ASSIGNED':
        return <Badge variant="warning">ASSIGNED</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="orange">IN PROGRESS</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">COMPLETED</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">CANCELLED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const openCount = maintenanceRequests.filter((m) => m.status === 'OPEN').length;
  const inProgressCount = maintenanceRequests.filter(
    (m) => m.status === 'ASSIGNED' || m.status === 'IN_PROGRESS'
  ).length;
  const completedCount = maintenanceRequests.filter((m) => m.status === 'COMPLETED').length;

  return (
    <PageContainer>
      <PageHeader
        title="Hostel Maintenance & Work Orders"
        description="Technician dispatch, work orders, electrical and plumbing repairs across authorized hostel infrastructure."
        badge={<Badge variant="orange" dot>WARDEN DISPATCH</Badge>}
        primaryAction={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/warden/maintenance/new')}
          >
            Report Issue
          </Button>
        }
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${maintenanceLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={maintenanceLoading}
          >
            Refresh
          </Button>
        }
      />

      {/* 1. HOSTEL SCOPE SELECTOR */}
      <HostelScopeSelector
        hostels={hostels}
        selectedHostelId={selectedHostelId}
        onSelectHostel={selectHostel}
        loading={hostelsLoading}
      />

      {/* 2. STATS OVERVIEW */}
      <ContentSection
        title="Maintenance Velocity Indicators"
        subtitle="Current status breakdown for repair orders in the selected hostel scope"
      >
        <DashboardGrid variant="stats">
          <StatCard
            title="Total Work Orders"
            value={totalElements.toString()}
            description="All maintenance tickets"
            icon={Wrench}
            badge={<Badge variant="orange">Total</Badge>}
            trend={{ direction: 'neutral', label: 'Registered orders' }}
            footerText="Scoped to authorized hostels"
          />
          <StatCard
            title="Awaiting Dispatch"
            value={openCount.toString()}
            description="Requires technician assignment"
            icon={Clock}
            badge={<Badge variant="danger">Open</Badge>}
            trend={{ direction: 'neutral', label: 'Needs assignment' }}
            footerText="Assign maintenance staff"
          />
          <StatCard
            title="Active Repairs"
            value={inProgressCount.toString()}
            description="Assigned or in progress"
            icon={Filter}
            badge={<Badge variant="warning">Active</Badge>}
            trend={{ direction: 'neutral', label: 'Work underway' }}
            footerText="Technicians dispatched"
          />
          <StatCard
            title="Repairs Completed"
            value={completedCount.toString()}
            description="Successfully fixed & closed"
            icon={CheckCircle2}
            badge={<Badge variant="teal">Completed</Badge>}
            trend={{ direction: 'neutral', label: 'Resolved orders' }}
            footerText="Facility uptime restored"
          />
        </DashboardGrid>
      </ContentSection>

      {/* 3. FILTER AND SEARCH BAR */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
              {statusTabs.map((tab) => {
                const isActive = (filters.status || '') === tab.key;
                return (
                  <button
                    key={tab.key || 'ALL'}
                    onClick={() =>
                      updateFilters({ status: (tab.key as MaintenanceStatus) || undefined })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input and Priority Filter */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, reporter, technician..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:border-indigo-500 shadow-2xs transition-colors"
                />
              </div>

              <select
                value={filters.priority || ''}
                onChange={(e) =>
                  updateFilters({ priority: (e.target.value as PriorityLevel) || undefined })
                }
                className="bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-bold py-2 px-3 focus:outline-none focus:border-indigo-500 shadow-2xs"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              {(filters.status || filters.priority || filters.search) && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. WORK ORDERS LIST TABLE */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-400" />
                Maintenance Work Orders Registry
              </CardTitle>
              <CardDescription>
                {selectedHostel
                  ? `Showing work orders for ${selectedHostel.name}`
                  : 'Showing work orders across all assigned hostels'}
              </CardDescription>
            </div>
            <Badge variant="neutral">{totalElements} Work Orders</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {maintenanceLoading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-400 mb-3" />
              <p>Loading maintenance orders registry...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-400">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <p>{error}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : maintenanceRequests.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No work orders found"
                description="There are currently no maintenance work orders matching your search or filters."
                icon={CheckCircle2}
                actionLabel="Report New Issue"
                onAction={() => navigate('/warden/maintenance/new')}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-semibold">ID / Priority</th>
                    <th className="py-3.5 px-4 font-semibold">Title & Facility</th>
                    <th className="py-3.5 px-4 font-semibold">Location</th>
                    <th className="py-3.5 px-4 font-semibold">Reported By</th>
                    <th className="py-3.5 px-4 font-semibold">Technician</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Reported Date</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {maintenanceRequests.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/warden/maintenance/${m.id}`)}
                    >
                      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-600 font-medium">#{m.id}</span>
                          {getPriorityBadge(m.priority)}
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-medium text-slate-200 text-xs truncate" title={m.title}>
                          {m.title}
                        </p>
                        {m.resourceName && (
                          <p className="text-[11px] text-orange-400/80 truncate">
                            Equipment: {m.resourceName}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-300">
                          <Building className="w-3.5 h-3.5 text-slate-600 font-medium" />
                          <span>{m.hostelName}</span>
                          {m.roomNumber && (
                            <Badge variant="neutral" className="text-[10px] py-0 px-1.5">
                              Rm {m.roomNumber}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-300">
                        {m.reportedByName || 'System'}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {m.assignedToName ? (
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                            <span>{m.assignedToName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(m.status)}</td>
                      <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                        {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5 text-slate-600 font-medium" />}
                          onClick={() => navigate(`/warden/maintenance/${m.id}`)}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>
                Page {currentPage + 1} of {totalPages} ({totalElements} total work orders)
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};
