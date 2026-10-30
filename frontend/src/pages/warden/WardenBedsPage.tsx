import React, { useEffect } from 'react';
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
  BedDouble,
  Search,
  RefreshCw,
  Plus,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useWardenHostels } from '../../hooks/useWardenHostels';
import { useWardenBeds } from '../../hooks/useWardenBeds';
import { HostelScopeSelector } from '../../components/warden/HostelScopeSelector';
import { HostelBedStatus } from '../../types/wardenAllocation';

export const WardenBedsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hostels, selectedHostelId, selectedHostel, selectHostel, loading: hostelsLoading } =
    useWardenHostels();

  const {
    beds,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading: bedsLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch,
  } = useWardenBeds({ hostelId: selectedHostelId });

  useEffect(() => {
    if (selectedHostelId !== filters.hostelId) {
      updateFilters({ hostelId: selectedHostelId });
    }
  }, [selectedHostelId, filters.hostelId, updateFilters]);

  const totalBedsCount = selectedHostel ? selectedHostel.totalBeds : totalElements;
  const occupiedCount = selectedHostel ? selectedHostel.occupiedBeds : 0;
  const availableCount = selectedHostel ? selectedHostel.availableBeds : 0;

  return (
    <PageContainer>
      <PageHeader
        title="Bed Occupancy Matrix"
        description="Granular real-time telemetry across all student bed spaces in authorized hostel blocks. Track active residencies, vacancies, and maintenance holds."
        badge={<Badge variant="orange" dot>BED MANAGEMENT</Badge>}
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
            title="Total Bed Units"
            value={totalBedsCount > 0 ? totalBedsCount : '--'}
            description={selectedHostel ? selectedHostel.name : 'Authorized hostel scope'}
            icon={BedDouble}
            badge={<Badge variant="orange">Installed</Badge>}
            trend={{ direction: 'neutral', label: 'Frames registered' }}
            footerText="Hardware registry active"
          />
          <StatCard
            title="Occupied Beds"
            value={occupiedCount}
            description="Active resident allocations"
            icon={CheckCircle2}
            badge={<Badge variant="warning">Occupied</Badge>}
            trend={{ direction: 'neutral', label: 'Residents registered' }}
            footerText="One resident per bed invariant"
          />
          <StatCard
            title="Available Vacancies"
            value={availableCount}
            description="Immediate allocation ready"
            icon={Layers}
            badge={<Badge variant="teal">Available</Badge>}
            trend={{ direction: 'neutral', label: 'Zero conflict verified' }}
            footerText="Allocatable inventory"
          />
          <StatCard
            title="Bed Utilization"
            value={
              totalBedsCount > 0
                ? `${Math.round((occupiedCount / totalBedsCount) * 100)}%`
                : '--'
            }
            description="Active capacity coefficient"
            icon={BedDouble}
            badge={<Badge variant="neutral">Ratio</Badge>}
            trend={{ direction: 'neutral', label: 'Operational metric' }}
            footerText="Real-time occupancy rate"
          />
        </DashboardGrid>
      </ContentSection>

      {/* 2. Beds Table with Server-Side Filters */}
      <ContentSection
        title="Bed Units Directory"
        subtitle="Search by bed or room number and filter by occupancy status"
      >
        <Card>
          <CardHeader className="border-b border-slate-200 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 max-w-xs">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search bed or room number..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Floor filter */}
                <select
                  value={filters.floorNumber !== undefined ? String(filters.floorNumber) : ''}
                  onChange={(e) =>
                    updateFilters({
                      floorNumber: e.target.value !== '' ? Number(e.target.value) : undefined,
                    })
                  }
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Floors</option>
                  <option value="1">Floor 1</option>
                  <option value="2">Floor 2</option>
                  <option value="3">Floor 3</option>
                  <option value="4">Floor 4</option>
                </select>

                {/* Bed Status filter */}
                <select
                  value={filters.status || ''}
                  onChange={(e) =>
                    updateFilters({
                      status: (e.target.value as HostelBedStatus) || undefined,
                    })
                  }
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Bed Statuses</option>
                  <option value="AVAILABLE">AVAILABLE (Vacant)</option>
                  <option value="OCCUPIED">OCCUPIED (Resident)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Hold)</option>
                  <option value="RESERVED">RESERVED</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>

                {(filters.search || filters.floorNumber !== undefined || filters.status) && (
                  <Button variant="ghost" size="xs" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-400 font-mono">
                Showing {beds.length} of {totalElements} beds
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {bedsLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
                Loading bed occupancy matrix...
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-200">Error loading beds</p>
                <p className="text-xs text-gray-400 mt-1">{error}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : beds.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No beds found"
                  description={
                    hostels.length === 0
                      ? 'No hostel has been assigned to your warden account.'
                      : 'No beds match your active search or filter criteria.'
                  }
                  icon={BedDouble}
                >
                  {(filters.search || filters.status || filters.floorNumber !== undefined) && (
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  )}
                </EmptyState>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="bg-white text-[11px] font-mono text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Bed Number</th>
                      <th className="py-3 px-4">Room & Block</th>
                      <th className="py-3 px-4">Floor</th>
                      <th className="py-3 px-4">Bed Status</th>
                      <th className="py-3 px-4">Current Resident</th>
                      <th className="py-3 px-4">Allocation Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {beds.map((bed) => {
                      const isOccupied = bed.status === 'OCCUPIED' && bed.currentStudent;
                      const isAvailable = bed.status === 'AVAILABLE';

                      return (
                        <tr
                          key={bed.id}
                          className="hover:bg-slate-50/60 transition-colors group"
                        >
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800 font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                                  isAvailable
                                    ? 'bg-teal-500/10 text-teal-400'
                                    : isOccupied
                                    ? 'bg-orange-500/10 text-orange-400'
                                    : 'bg-yellow-500/10 text-yellow-400'
                                }`}
                              >
                                <BedDouble className="w-3.5 h-3.5" />
                              </div>
                              <span>{bed.bedNumber}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className="text-slate-800 font-medium font-medium hover:text-orange-400 cursor-pointer transition-colors"
                              onClick={() => navigate(`/warden/rooms/${bed.roomId}`)}
                            >
                              Room {bed.roomNumber}
                            </span>
                            <div className="text-[11px] text-slate-600 font-medium font-mono">
                              {bed.blockName} ({bed.blockCode})
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-medium font-mono">
                            Floor {bed.floorNumber}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                isAvailable
                                  ? 'teal'
                                  : isOccupied
                                  ? 'orange'
                                  : bed.status === 'MAINTENANCE'
                                  ? 'warning'
                                  : 'neutral'
                              }
                              size="sm"
                              dot
                            >
                              {bed.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {isOccupied && bed.currentStudent ? (
                              <div>
                                <div className="font-semibold text-slate-800 font-medium">
                                  {bed.currentStudent.studentName}
                                </div>
                                <div className="text-[11px] font-mono text-orange-400">
                                  {bed.currentStudent.registerNumber}
                                </div>
                              </div>
                            ) : isAvailable ? (
                              <span className="text-slate-600 font-medium font-mono italic">Vacant</span>
                            ) : (
                              <span className="text-slate-600 font-medium font-mono italic">
                                {bed.status}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {isOccupied && bed.currentStudent ? (
                              <Badge variant="teal" size="sm">
                                ACTIVE
                              </Badge>
                            ) : (
                              <span className="text-slate-600 font-medium font-mono text-[11px]">NONE</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isAvailable ? (
                                <Button
                                  variant="primary"
                                  size="xs"
                                  leftIcon={<Plus className="w-3 h-3" />}
                                  onClick={() =>
                                    navigate(
                                      `/warden/allocations/new?hostelId=${bed.hostelId}&roomId=${bed.roomId}&bedId=${bed.id}`
                                    )
                                  }
                                >
                                  Allocate
                                </Button>
                              ) : isOccupied && bed.currentStudent ? (
                                <Button
                                  variant="outline"
                                  size="xs"
                                  rightIcon={<ExternalLink className="w-3 h-3" />}
                                  onClick={() =>
                                    navigate(
                                      `/warden/allocations/${bed.currentStudent?.allocationId}`
                                    )
                                  }
                                >
                                  View
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => navigate(`/warden/rooms/${bed.roomId}`)}
                                >
                                  Room
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
    </PageContainer>
  );
};
