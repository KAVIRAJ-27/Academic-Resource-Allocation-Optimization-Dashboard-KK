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
  CheckSquare,
  Search,
  RefreshCw,
  Plus,
  Eye,
  LogOut,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  User,
  Clock,
} from 'lucide-react';
import { useWardenHostels } from '../../hooks/useWardenHostels';
import { useWardenAllocations } from '../../hooks/useWardenAllocations';
import { useWardenAllocationMutations } from '../../hooks/useWardenAllocationMutations';
import { HostelScopeSelector } from '../../components/warden/HostelScopeSelector';
import { AllocationStatus, WardenAllocationSummary } from '../../types/wardenAllocation';

export const WardenAllocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hostels, selectedHostelId, selectedHostel, selectHostel, loading: hostelsLoading } =
    useWardenHostels();

  const {
    allocations,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading: allocationsLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch,
  } = useWardenAllocations({ hostelId: selectedHostelId });

  const { releaseAllocation, submitting: releasing, error: releaseError, clearError } =
    useWardenAllocationMutations();

  // Selected allocation for release modal
  const [allocationToRelease, setAllocationToRelease] = useState<WardenAllocationSummary | null>(
    null
  );

  useEffect(() => {
    if (selectedHostelId !== filters.hostelId) {
      updateFilters({ hostelId: selectedHostelId });
    }
  }, [selectedHostelId, filters.hostelId, updateFilters]);

  const handleConfirmRelease = async () => {
    if (!allocationToRelease) return;
    try {
      await releaseAllocation(allocationToRelease.id);
      setAllocationToRelease(null);
      refetch();
    } catch (e) {
      // Error handled by hook
    }
  };

  const activeStatusTab = filters.status || 'ALL';

  return (
    <PageContainer>
      <PageHeader
        title="Student Hostel Allocations"
        description="Operational hostel registry managing active student bed placements, intake allocations, historical checkouts, and auditable residency lifecycles."
        badge={<Badge variant="orange" dot>RESIDENCY REGISTRY</Badge>}
        primaryAction={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/warden/allocations/new')}
          >
            New Allocation
          </Button>
        }
        secondaryAction={
          <div className="flex items-center gap-3">
            <HostelScopeSelector
              hostels={hostels}
              selectedHostelId={selectedHostelId}
              onSelectHostel={selectHostel}
              loading={hostelsLoading}
            />
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* 1. Stat Cards */}
      <ContentSection>
        <DashboardGrid variant="stats">
          <StatCard
            title="Total Registry Records"
            value={totalElements}
            description="Lifetime allocation records"
            icon={CheckSquare}
            badge={<Badge variant="orange">History</Badge>}
            trend={{ direction: 'neutral', label: 'Archived permanently' }}
            footerText="Auditable ledger active"
          />
          <StatCard
            title="Occupied Bed Frames"
            value={selectedHostel ? selectedHostel.occupiedBeds : '--'}
            description="Currently checked-in students"
            icon={BedDouble}
            badge={<Badge variant="warning">Active</Badge>}
            trend={{ direction: 'neutral', label: 'Residents registered' }}
            footerText="One active bed per student"
          />
          <StatCard
            title="Vacant Bed Units"
            value={selectedHostel ? selectedHostel.availableBeds : '--'}
            description="Ready for allocation"
            icon={Clock}
            badge={<Badge variant="teal">Available</Badge>}
            trend={{ direction: 'neutral', label: 'Available now' }}
            footerText="Immediate intake ready"
          />
          <StatCard
            title="Hostel Capacity"
            value={selectedHostel ? selectedHostel.capacity : '--'}
            description="Total facility quota"
            icon={CheckSquare}
            badge={<Badge variant="neutral">Capacity</Badge>}
            trend={{ direction: 'neutral', label: 'Maximum residents' }}
            footerText="Institution capacity cap"
          />
        </DashboardGrid>
      </ContentSection>

      {/* 2. Allocations Table */}
      <ContentSection
        title="Hostel Allocation Records"
        subtitle="Manage active residencies and audit historical room placements"
      >
        <Card>
          <CardHeader className="border-b border-slate-200 pb-4">
            <div className="flex flex-col gap-4">
              {/* Status Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/60 pb-3">
                {(
                  [
                    { label: 'All Allocations', value: 'ALL' },
                    { label: 'Active Residencies', value: 'ACTIVE' },
                    { label: 'Completed', value: 'COMPLETED' },
                    { label: 'Cancelled', value: 'CANCELLED' },
                  ] as const
                ).map((tab) => {
                  const isActive = activeStatusTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() =>
                        updateFilters({
                          status:
                            tab.value === 'ALL'
                              ? undefined
                              : (tab.value as AllocationStatus),
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 font-semibold shadow-sm'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-slate-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative min-w-[240px] flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search student, reg no, room or bed..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="text-xs text-gray-400 font-mono">
                  Showing {allocations.length} of {totalElements} allocations
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {allocationsLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
                Loading allocation ledger...
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-200">Error loading allocations</p>
                <p className="text-xs text-gray-400 mt-1">{error}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : allocations.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No allocation records found"
                  description={
                    hostels.length === 0
                      ? 'No hostel has been assigned to your warden account.'
                      : 'No student allocations match the selected criteria.'
                  }
                  icon={CheckSquare}
                >
                  {filters.search || filters.status ? (
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-3.5 h-3.5" />}
                      onClick={() => navigate('/warden/allocations/new')}
                    >
                      Create First Allocation
                    </Button>
                  )}
                </EmptyState>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-white text-[11px] font-mono text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Allocation ID</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Hostel & Block</th>
                      <th className="py-3 px-4">Room & Bed</th>
                      <th className="py-3 px-4">Dates</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {allocations.map((alloc) => {
                      const isActive = alloc.status === 'ACTIVE';

                      return (
                        <tr
                          key={alloc.id}
                          className="hover:bg-slate-50/60 transition-colors group"
                        >
                          <td className="py-3 px-4 font-mono text-slate-600 font-medium font-semibold">
                            #{alloc.id}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-gray-100">
                              {alloc.studentName}
                            </div>
                            <div className="text-[11px] font-mono text-orange-400">
                              {alloc.registerNumber}
                            </div>
                            <div className="text-[10px] text-slate-600 font-medium truncate max-w-[180px]">
                              {alloc.departmentName}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-800 font-medium">{alloc.hostelName}</div>
                            <div className="text-[11px] text-slate-600 font-medium font-mono">
                              {alloc.blockName} • Floor {alloc.floorNumber}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <div className="text-slate-800 font-medium font-semibold">
                              Room {alloc.roomNumber}
                            </div>
                            <div className="text-[11px] text-teal-400">
                              Bed {alloc.bedNumber}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-700 font-medium">
                            <div>From: {alloc.startDate}</div>
                            <div className="text-slate-600 font-medium">
                              {alloc.endDate ? `To: ${alloc.endDate}` : 'Ongoing'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                isActive
                                  ? 'teal'
                                  : alloc.status === 'COMPLETED'
                                  ? 'neutral'
                                  : 'warning'
                              }
                              size="sm"
                              dot
                            >
                              {alloc.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="xs"
                                leftIcon={<Eye className="w-3 h-3" />}
                                onClick={() => navigate(`/warden/allocations/${alloc.id}`)}
                              >
                                View
                              </Button>

                              {isActive && (
                                <Button
                                  variant="danger"
                                  size="xs"
                                  leftIcon={<LogOut className="w-3 h-3" />}
                                  onClick={() => setAllocationToRelease(alloc)}
                                >
                                  Release
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-white">
                <div className="text-xs text-gray-400 font-mono">
                  Page {currentPage + 1} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    leftIcon={<ChevronLeft className="w-3 h-3" />}
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    rightIcon={<ChevronRight className="w-3 h-3" />}
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </ContentSection>

      {/* 3. Release Bed Confirmation Modal */}
      {allocationToRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-orange-400">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-100">Release Bed Allocation</h3>
                <p className="text-xs text-gray-400">Checkout resident student</p>
              </div>
            </div>

            {releaseError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                {releaseError}
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Student:</span>
                <span className="font-semibold text-gray-200">
                  {allocationToRelease.studentName} ({allocationToRelease.registerNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hostel & Room:</span>
                <span className="text-gray-200">
                  {allocationToRelease.hostelName} • Room {allocationToRelease.roomNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bed Number:</span>
                <span className="font-mono text-teal-400 font-bold">
                  {allocationToRelease.bedNumber}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Confirming release will mark this allocation status as{' '}
              <span className="text-gray-200 font-mono font-semibold">COMPLETED</span> and immediately
              return bed frame{' '}
              <span className="text-teal-400 font-mono font-semibold">
                {allocationToRelease.bedNumber}
              </span>{' '}
              to <span className="text-teal-400 font-semibold">AVAILABLE</span> status. Historical
              records are permanently preserved in the audit ledger.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAllocationToRelease(null);
                  clearError();
                }}
                disabled={releasing}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={releasing}
                onClick={handleConfirmRelease}
              >
                Confirm Release & Checkout
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
