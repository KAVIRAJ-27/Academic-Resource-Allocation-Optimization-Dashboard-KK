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
  Grid,
  BedDouble,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Building,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useWardenHostels } from '../../hooks/useWardenHostels';
import { useWardenRooms } from '../../hooks/useWardenRooms';
import { HostelScopeSelector } from '../../components/warden/HostelScopeSelector';

export const WardenRoomsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hostels, selectedHostelId, selectedHostel, selectHostel, loading: hostelsLoading } =
    useWardenHostels();

  const {
    rooms,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading: roomsLoading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch,
  } = useWardenRooms({ hostelId: selectedHostelId });

  // Synchronize hostel selection
  useEffect(() => {
    if (selectedHostelId !== filters.hostelId) {
      updateFilters({ hostelId: selectedHostelId });
    }
  }, [selectedHostelId, filters.hostelId, updateFilters]);

  const totalCapacity = selectedHostel ? selectedHostel.capacity : 0;
  const occupiedBeds = selectedHostel ? selectedHostel.occupiedBeds : 0;
  const availableBeds = selectedHostel ? selectedHostel.availableBeds : 0;
  const totalRoomsCount = selectedHostel ? selectedHostel.totalRooms : totalElements;

  return (
    <PageContainer>
      <PageHeader
        title="Hostel Room Inventory"
        description="Monitor residential room configurations, floor hierarchies, capacity quotas, and real-time bed utilization across authorized hostel blocks."
        badge={<Badge variant="orange" dot>ROOM OPERATIONS</Badge>}
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

      {/* 1. Key Metrics */}
      <ContentSection>
        <DashboardGrid variant="stats">
          <StatCard
            title="Total Configured Rooms"
            value={totalRoomsCount > 0 ? totalRoomsCount : '--'}
            description={selectedHostel ? selectedHostel.name : 'Authorized scope'}
            icon={Grid}
            badge={<Badge variant="orange">Rooms</Badge>}
            trend={{ direction: 'neutral', label: 'Inventory verified' }}
            footerText="All active wings online"
          />
          <StatCard
            title="Bed Capacity"
            value={totalCapacity > 0 ? totalCapacity : '--'}
            description="Designed student capacity"
            icon={BedDouble}
            badge={<Badge variant="teal">Capacity</Badge>}
            trend={{ direction: 'neutral', label: 'Quota nominal' }}
            footerText="Hostel structure nominal"
          />
          <StatCard
            title="Occupied Beds"
            value={occupiedBeds}
            description="Active resident allocations"
            icon={CheckCircle2}
            badge={<Badge variant="warning">Occupancy</Badge>}
            trend={{ direction: 'neutral', label: 'Residents registered' }}
            footerText="Real-time bed telemetry"
          />
          <StatCard
            title="Vacant Beds"
            value={availableBeds}
            description="Immediately allocatable spaces"
            icon={Layers}
            badge={<Badge variant="teal">Available</Badge>}
            trend={{ direction: 'neutral', label: 'Ready for allocation' }}
            footerText="No conflict detected"
          />
        </DashboardGrid>
      </ContentSection>

      {/* 2. Room Inventory Table with Server-Side Filters */}
      <ContentSection
        title="Room Registry & Occupancy Matrix"
        subtitle="Filter by floor, status, or search specific room numbers"
      >
        <Card>
          <CardHeader className="border-b border-[#1E2330] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search input */}
                <div className="relative min-w-[200px] flex-1 max-w-xs">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search room number..."
                    value={filters.search || ''}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="w-full bg-[#11141C] border border-[#1E2330] rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-orange-500"
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
                  className="bg-[#11141C] border border-[#1E2330] rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Floors</option>
                  <option value="1">Floor 1</option>
                  <option value="2">Floor 2</option>
                  <option value="3">Floor 3</option>
                  <option value="4">Floor 4</option>
                </select>

                {/* Status filter */}
                <select
                  value={filters.status || ''}
                  onChange={(e) => updateFilters({ status: e.target.value || undefined })}
                  className="bg-[#11141C] border border-[#1E2330] rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-orange-500"
                >
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied / Full</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>

                {(filters.search || filters.floorNumber !== undefined || filters.status) && (
                  <Button variant="ghost" size="xs" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>

              <div className="text-xs text-gray-400 font-mono">
                Showing {rooms.length} of {totalElements} rooms
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {roomsLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-400" />
                Loading room inventory...
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-200">Error loading rooms</p>
                <p className="text-xs text-gray-400 mt-1">{error}</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No rooms found"
                  description={
                    hostels.length === 0
                      ? 'No hostel has been assigned to your warden account.'
                      : 'No room records match your active search or filter criteria.'
                  }
                  icon={Grid}
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
                  <thead className="bg-[#11141C] text-[11px] font-mono text-gray-400 uppercase tracking-wider border-b border-[#1E2330]">
                    <tr>
                      <th className="py-3 px-4">Room</th>
                      <th className="py-3 px-4">Block & Floor</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Capacity</th>
                      <th className="py-3 px-4">Occupancy Status</th>
                      <th className="py-3 px-4">Room Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2330]">
                    {rooms.map((room) => {
                      const occupancyRate =
                        room.capacity > 0 ? (room.occupiedBeds / room.capacity) * 100 : 0;
                      const isFull = room.availableBeds <= 0;

                      return (
                        <tr
                          key={room.id}
                          className="hover:bg-[#171A23]/60 transition-colors group cursor-pointer"
                          onClick={() => navigate(`/warden/rooms/${room.id}`)}
                        >
                          <td className="py-3 px-4 font-mono font-semibold text-gray-200">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold">
                                {room.roomNumber.slice(0, 2)}
                              </div>
                              <span className="group-hover:text-orange-400 transition-colors">
                                Room {room.roomNumber}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            <div>{room.blockName}</div>
                            <div className="text-[11px] text-gray-400 font-mono">
                              Floor {room.floorNumber} ({room.floorName})
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="neutral" size="sm">
                              {room.roomType}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-mono">
                            <span className="text-gray-200 font-medium">{room.capacity}</span> Beds
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-36">
                              <div className="flex justify-between text-[10px] font-mono text-gray-400 mb-1">
                                <span>{room.occupiedBeds} occupied</span>
                                <span className={isFull ? 'text-orange-400 font-bold' : 'text-teal-400'}>
                                  {room.availableBeds} free
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-[#1E2330] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isFull ? 'bg-orange-500' : 'bg-teal-500'
                                  }`}
                                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                room.status === 'AVAILABLE'
                                  ? 'teal'
                                  : room.status === 'MAINTENANCE'
                                  ? 'warning'
                                  : room.status === 'OCCUPIED'
                                  ? 'orange'
                                  : 'neutral'
                              }
                              size="sm"
                              dot
                            >
                              {room.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="outline"
                              size="xs"
                              leftIcon={<Eye className="w-3 h-3" />}
                              onClick={() => navigate(`/warden/rooms/${room.id}`)}
                            >
                              Details
                            </Button>
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
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E2330] bg-[#11141C]">
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
