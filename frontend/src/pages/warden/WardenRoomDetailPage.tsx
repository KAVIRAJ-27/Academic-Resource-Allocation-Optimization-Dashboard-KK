import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ArrowLeft,
  RefreshCw,
  Plus,
  User,
  ExternalLink,
  AlertTriangle,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useWardenRoomDetail } from '../../hooks/useWardenRoomDetail';

export const WardenRoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { room, loading, error, refetch } = useWardenRoomDetail(
    roomId ? Number(roomId) : undefined
  );

  if (loading) {
    return (
      <PageContainer>
        <div className="p-12 text-center text-xs text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-400" />
          Loading room and bed matrix...
        </div>
      </PageContainer>
    );
  }

  if (error || !room) {
    return (
      <PageContainer>
        <div className="max-w-xl mx-auto my-12">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
              <h2 className="text-base font-bold text-gray-100">Room Not Found or Unauthorized</h2>
              <p className="text-xs text-gray-400 mt-2">
                {error || 'The requested room does not exist or belongs outside your authorized hostel scope.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                onClick={() => navigate('/warden/rooms')}
              >
                Back to Room Inventory
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Room ${room.roomNumber}`}
        description={`${room.hostelName} • ${room.blockName} • Floor ${room.floorNumber} (${room.floorName})`}
        badge={<Badge variant="orange">{room.roomType}</Badge>}
        primaryAction={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            disabled={room.availableBeds <= 0}
            onClick={() =>
              navigate(
                `/warden/allocations/new?hostelId=${room.hostelId}&roomId=${room.id}`
              )
            }
          >
            {room.availableBeds > 0 ? 'Allocate Available Bed' : 'Room Full'}
          </Button>
        }
        secondaryAction={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => navigate('/warden/rooms')}
            >
              Back to Rooms
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* 1. Room Metrics */}
      <ContentSection>
        <DashboardGrid variant="stats">
          <StatCard
            title="Room Capacity"
            value={`${room.capacity} Beds`}
            description={`${room.roomType} configuration`}
            icon={Grid}
            badge={<Badge variant="neutral">Quota</Badge>}
            trend={{ direction: 'neutral', label: 'Design limit' }}
            footerText={`Room Status: ${room.status}`}
          />
          <StatCard
            title="Installed Beds"
            value={room.totalBeds}
            description="Verified bed frames"
            icon={BedDouble}
            badge={<Badge variant="orange">Hardware</Badge>}
            trend={{ direction: 'neutral', label: 'Physical frames' }}
            footerText="Bed inventory online"
          />
          <StatCard
            title="Occupied Beds"
            value={room.occupiedBeds}
            description="Active student residents"
            icon={CheckCircle2}
            badge={<Badge variant="warning">Occupancy</Badge>}
            trend={{ direction: 'neutral', label: 'Residents checked-in' }}
            footerText="Verified allocations"
          />
          <StatCard
            title="Vacant Beds"
            value={room.availableBeds}
            description="Immediately available"
            icon={Layers}
            badge={<Badge variant="teal">Available</Badge>}
            trend={{ direction: 'neutral', label: 'Allocatable space' }}
            footerText="No conflict detected"
          />
        </DashboardGrid>
      </ContentSection>

      {/* 2. Beds Layout Matrix */}
      <ContentSection
        title="Bed Configuration & Resident Status"
        subtitle="Individual bed units and resident student placements"
      >
        {room.beds.length === 0 ? (
          <Card>
            <CardContent className="p-8">
              <EmptyState
                title="No beds installed in this room"
                description="This room has not yet been populated with physical bed units."
                icon={BedDouble}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {room.beds.map((bed) => {
              const isOccupied = bed.status === 'OCCUPIED' && bed.currentStudent;
              const isAvailable = bed.status === 'AVAILABLE';

              return (
                <Card
                  key={bed.id}
                  className={`transition-all duration-150 ${
                    isAvailable
                      ? 'border-teal-500/30 bg-[#11141C] hover:border-teal-500/60'
                      : isOccupied
                      ? 'border-[#1E2330] bg-[#11141C]'
                      : 'border-orange-500/30 bg-[#171A23]/50'
                  }`}
                >
                  <CardHeader className="border-b border-[#1E2330] pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                            isAvailable
                              ? 'bg-teal-500/10 text-teal-400'
                              : isOccupied
                              ? 'bg-orange-500/10 text-orange-400'
                              : 'bg-yellow-500/10 text-yellow-400'
                          }`}
                        >
                          <BedDouble className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-sm text-gray-100">
                            {bed.bedNumber}
                          </div>
                          <div className="text-[10px] text-gray-400 font-mono">
                            ID #{bed.id}
                          </div>
                        </div>
                      </div>

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
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4">
                    {isOccupied && bed.currentStudent ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#1E2330] flex items-center justify-center text-gray-300 font-bold shrink-0 text-xs">
                            {bed.currentStudent.studentName
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-gray-100 truncate">
                              {bed.currentStudent.studentName}
                            </div>
                            <div className="text-[11px] font-mono text-orange-400 mt-0.5">
                              {bed.currentStudent.registerNumber}
                            </div>
                            <div className="text-[10px] text-gray-400 truncate mt-0.5">
                              {bed.currentStudent.departmentName || 'N/A'} •{' '}
                              {bed.currentStudent.programName || 'N/A'}
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#171A23] border border-[#1E2330] text-[11px] font-mono text-gray-400 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            Since {bed.currentStudent.startDate}
                          </span>
                          <span className="text-teal-400 font-medium">Active</span>
                        </div>

                        <Button
                          variant="outline"
                          size="xs"
                          className="w-full"
                          rightIcon={<ExternalLink className="w-3 h-3" />}
                          onClick={() =>
                            navigate(
                              `/warden/allocations/${bed.currentStudent?.allocationId}`
                            )
                          }
                        >
                          View Allocation Details
                        </Button>
                      </div>
                    ) : isAvailable ? (
                      <div className="space-y-4 py-2">
                        <div className="text-center">
                          <span className="inline-block p-2 rounded-full bg-teal-500/10 text-teal-400 mb-2">
                            <CheckCircle2 className="w-5 h-5" />
                          </span>
                          <p className="text-xs font-medium text-gray-300">
                            Bed is vacant and ready
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Passed all sanitation & room capacity constraints
                          </p>
                        </div>

                        <Button
                          variant="primary"
                          size="xs"
                          className="w-full"
                          leftIcon={<Plus className="w-3 h-3" />}
                          onClick={() =>
                            navigate(
                              `/warden/allocations/new?hostelId=${room.hostelId}&roomId=${room.id}&bedId=${bed.id}`
                            )
                          }
                        >
                          Allocate This Bed
                        </Button>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <AlertTriangle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-gray-300">
                          Unavailable for Allocation
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Current bed status is {bed.status}.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ContentSection>
    </PageContainer>
  );
};
