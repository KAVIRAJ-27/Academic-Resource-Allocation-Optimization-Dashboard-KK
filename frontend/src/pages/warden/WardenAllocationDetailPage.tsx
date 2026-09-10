import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../components/ui';
import {
  CheckSquare,
  ArrowLeft,
  RefreshCw,
  User,
  BedDouble,
  Building,
  Calendar,
  LogOut,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  BookOpen,
} from 'lucide-react';
import { useWardenAllocationDetail } from '../../hooks/useWardenAllocationDetail';
import { useWardenAllocationMutations } from '../../hooks/useWardenAllocationMutations';

export const WardenAllocationDetailPage: React.FC = () => {
  const { allocationId } = useParams<{ allocationId: string }>();
  const navigate = useNavigate();

  const { allocation, loading, error, refetch } = useWardenAllocationDetail(
    allocationId ? Number(allocationId) : undefined
  );

  const { releaseAllocation, submitting: releasing, error: releaseError, clearError } =
    useWardenAllocationMutations();

  const [showReleaseModal, setShowReleaseModal] = useState(false);

  if (loading) {
    return (
      <PageContainer>
        <div className="p-12 text-center text-xs text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-400" />
          Loading allocation details...
        </div>
      </PageContainer>
    );
  }

  if (error || !allocation) {
    return (
      <PageContainer>
        <div className="max-w-xl mx-auto my-12">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
              <h2 className="text-base font-bold text-gray-100">
                Allocation Not Found or Unauthorized
              </h2>
              <p className="text-xs text-gray-400 mt-2">
                {error || 'This allocation record does not exist or belongs outside your authorized hostel jurisdiction.'}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                onClick={() => navigate('/warden/allocations')}
              >
                Back to Allocations
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const isActive = allocation.status === 'ACTIVE';

  const handleConfirmRelease = async () => {
    try {
      await releaseAllocation(allocation.id);
      setShowReleaseModal(false);
      refetch();
    } catch (e) {
      // Error handled in hook
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={`Allocation #${allocation.id}`}
        description={`${allocation.studentName} (${allocation.registerNumber}) • Room ${allocation.roomNumber}, Bed ${allocation.bedNumber}`}
        badge={
          <Badge
            variant={
              isActive
                ? 'teal'
                : allocation.status === 'COMPLETED'
                ? 'neutral'
                : 'warning'
            }
            dot
          >
            {allocation.status}
          </Badge>
        }
        primaryAction={
          isActive ? (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              onClick={() => setShowReleaseModal(true)}
            >
              Release / End Residency
            </Button>
          ) : undefined
        }
        secondaryAction={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              onClick={() => navigate('/warden/allocations')}
            >
              Back to Allocations
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

      <DashboardGrid variant="split">
        {/* Left Column: Student Profile & Allocation Placement */}
        <GridCol span={2}>
          <div className="space-y-6">
            {/* Student Profile */}
            <Card>
              <CardHeader className="border-b border-[#1E2330]">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-400" />
                  Resident Student Profile
                </CardTitle>
                <CardDescription>
                  Verified academic and registration details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block mb-1">Full Name</span>
                    <span className="font-semibold text-gray-200 text-sm">
                      {allocation.studentName}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-1">Register Number</span>
                    <span className="font-mono text-orange-400 font-bold">
                      {allocation.registerNumber}
                    </span>
                  </div>

                  {allocation.rollNumber && (
                    <div>
                      <span className="text-gray-400 block mb-1">Roll Number</span>
                      <span className="font-mono text-gray-200">
                        {allocation.rollNumber}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-400 block mb-1">Department</span>
                    <span className="text-gray-200">
                      {allocation.departmentName || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-1">Program / Degree</span>
                    <span className="text-gray-200">
                      {allocation.programName || 'N/A'}
                    </span>
                  </div>

                  {allocation.currentSemester && (
                    <div>
                      <span className="text-gray-400 block mb-1">Current Semester</span>
                      <span className="font-mono text-gray-200">
                        Semester {allocation.currentSemester}
                      </span>
                    </div>
                  )}

                  {allocation.studentEmail && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{allocation.studentEmail}</span>
                    </div>
                  )}

                  {allocation.studentPhone && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{allocation.studentPhone}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Room & Bed Placement */}
            <Card>
              <CardHeader className="border-b border-[#1E2330]">
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-orange-400" />
                  Designated Bed Placement
                </CardTitle>
                <CardDescription>
                  Hostel building hierarchy and room assignment
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 block mb-1">Hostel Facility</span>
                    <span className="font-semibold text-gray-200">
                      {allocation.hostelName} ({allocation.hostelCode})
                    </span>
                    {allocation.hostelAddress && (
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {allocation.hostelAddress}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-1">Block & Floor</span>
                    <span className="text-gray-200">
                      {allocation.blockName} • Floor {allocation.floorNumber} (
                      {allocation.floorName})
                    </span>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-1">Room Placement</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-200 font-mono text-sm">
                        Room {allocation.roomNumber}
                      </span>
                      {allocation.roomType && (
                        <Badge variant="neutral" size="sm">
                          {allocation.roomType}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-400 block mb-1">Bed Frame</span>
                    <span className="font-mono text-teal-400 font-bold text-sm">
                      Bed {allocation.bedNumber}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#1E2330] flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => navigate(`/warden/rooms/${allocation.roomId}`)}
                  >
                    View Room Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </GridCol>

        {/* Right Column: Timeline & Tenancy Audit */}
        <GridCol span={1}>
          <div className="space-y-6">
            <Card>
              <CardHeader className="border-b border-[#1E2330]">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-teal-400" />
                  Residency Timeline
                </CardTitle>
                <CardDescription>
                  Tenancy dates and timestamp audits
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-[#171A23] border border-[#1E2330] space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Academic Term:</span>
                    <span className="text-gray-200">
                      {allocation.academicYearName || 'Standard Year'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tenancy Start:</span>
                    <span className="text-teal-400 font-semibold">
                      {allocation.startDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tenancy End:</span>
                    <span className="text-gray-200">
                      {allocation.endDate || 'Ongoing / Indefinite'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-[11px] text-gray-400 font-mono">
                  <div className="flex justify-between">
                    <span>Allocated At:</span>
                    <span className="text-gray-300">
                      {new Date(allocation.allocatedAt).toLocaleString()}
                    </span>
                  </div>

                  {allocation.releasedAt && (
                    <div className="flex justify-between text-orange-400">
                      <span>Released At:</span>
                      <span>{new Date(allocation.releasedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {isActive && (
                  <div className="pt-4 border-t border-[#1E2330]">
                    <Button
                      variant="danger"
                      size="sm"
                      className="w-full"
                      leftIcon={<LogOut className="w-3.5 h-3.5" />}
                      onClick={() => setShowReleaseModal(true)}
                    >
                      Release Bed Allocation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </GridCol>
      </DashboardGrid>

      {/* Release Bed Modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#11141C] border border-[#1E2330] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
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

            <div className="p-4 rounded-xl bg-[#171A23] border border-[#1E2330] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Student:</span>
                <span className="font-semibold text-gray-200">
                  {allocation.studentName} ({allocation.registerNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hostel & Room:</span>
                <span className="text-gray-200">
                  {allocation.hostelName} • Room {allocation.roomNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bed Number:</span>
                <span className="font-mono text-teal-400 font-bold">
                  {allocation.bedNumber}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Confirming release will mark this allocation status as{' '}
              <span className="text-gray-200 font-mono font-semibold">COMPLETED</span> and immediately
              return bed frame{' '}
              <span className="text-teal-400 font-mono font-semibold">
                {allocation.bedNumber}
              </span>{' '}
              to <span className="text-teal-400 font-semibold">AVAILABLE</span> status. Historical
              records are permanently preserved.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReleaseModal(false);
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
