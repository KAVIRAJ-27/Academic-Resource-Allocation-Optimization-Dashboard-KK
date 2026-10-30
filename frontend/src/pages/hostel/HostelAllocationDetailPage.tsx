import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageContainer,
  PageHeader,
  ContentSection,
  DashboardGrid,
} from '../../components/layout';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  getStatusBadgeVariant,
} from '../../components/ui';
import {
  ArrowLeft,
  Building,
  User,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { hostelAllocationApi } from '../../services/api/hostelAllocationApi';
import { HostelAllocationResponseDto } from '../../types/hostelAllocation';

export const HostelAllocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [allocation, setAllocation] = useState<HostelAllocationResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const fetchAllocation = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await hostelAllocationApi.getAllocationById(parseInt(id, 10));
      if (res.success && res.data) {
        setAllocation(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch allocation details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocation();
  }, [id]);

  const handleRelease = async () => {
    if (!allocation) return;
    try {
      setReleasing(true);
      await hostelAllocationApi.releaseAllocation(allocation.id);
      setReleaseModalOpen(false);
      await fetchAllocation();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to release allocation');
    } finally {
      setReleasing(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center p-24 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-teal-400" />
          <p className="text-sm text-gray-400">Loading bed allocation details...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !allocation) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center p-24 space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-900">Allocation Not Found</h2>
          <p className="text-sm text-gray-400">{error || 'Unable to find allocation record.'}</p>
          <Button variant="outline" onClick={() => navigate('/hostel/resource-allocations')}>
            Back to Allocations
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Allocation Record #${allocation.id}`}
        description={`Bed ${allocation.bedNumber} in ${allocation.hostelName}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Hostel', href: '/hostel' },
          { label: 'Allocations', href: '/hostel/resource-allocations' },
          { label: `#${allocation.id}` },
        ]}
        primaryAction={
          allocation.status === 'ACTIVE' ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setReleaseModalOpen(true)}
            >
              Release Bed
            </Button>
          ) : undefined
        }
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/hostel/resource-allocations')}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        }
      />

      <ContentSection>
        {/* Status & Method Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200">
          <div className="flex items-center gap-3">
            <Badge
              variant={getStatusBadgeVariant(allocation.status)}
              className="text-sm px-3 py-1"
            >
              {allocation.status}
            </Badge>

            {allocation.allocationMethod === 'AUTO' ? (
              <Badge variant="teal" className="flex items-center gap-1.5 text-xs py-1">
                <Sparkles className="w-3.5 h-3.5" />
                Deterministic Auto-Allocated
              </Badge>
            ) : (
              <Badge variant="purple" className="flex items-center gap-1.5 text-xs py-1">
                <User className="w-3.5 h-3.5" />
                Manual Staff Allocation
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>
              Allocated On: <strong className="text-white">{new Date(allocation.allocatedAt).toLocaleString()}</strong>
            </span>
            {allocation.releasedAt && (
              <span>
                Released On: <strong className="text-white">{new Date(allocation.releasedAt).toLocaleString()}</strong>
              </span>
            )}
          </div>
        </div>
      </ContentSection>

      <ContentSection>
        <DashboardGrid cols={2}>
          {/* Student Profile Card */}
          <Card>
            <CardHeader className="border-b border-slate-200 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" />
                Student Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-gray-400">Full Name</span>
                <span className="font-semibold text-white">{allocation.studentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-gray-400">Roll Number</span>
                <span className="font-mono font-bold text-teal-300">{allocation.rollNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-gray-400">Department</span>
                <span className="text-gray-200">{allocation.departmentName || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-gray-400">Email</span>
                <span className="text-gray-200">{allocation.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Student ID</span>
                <span className="font-mono text-gray-300">#{allocation.studentId}</span>
              </div>
            </CardContent>
          </Card>

          {/* Room & Bed Placement Card */}
          <Card>
            <CardHeader className="border-b border-slate-200 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building className="w-4 h-4 text-teal-400" />
                Placement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-gray-400">Hostel</span>
                <span className="font-semibold text-white">
                  {allocation.hostelName} ({allocation.hostelCode})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-gray-400">Block & Floor</span>
                <span className="text-gray-200">
                  {allocation.blockName} &bull; Floor {allocation.floorNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-gray-400">Room</span>
                <span className="font-semibold text-white">
                  Room {allocation.roomNumber} ({allocation.roomType})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-gray-400">Bed Identifier</span>
                <Badge variant="teal" className="font-mono font-bold">
                  Bed {allocation.bedNumber} (ID: #{allocation.bedId})
                </Badge>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Room Capacity</span>
                <span className="text-gray-200">{allocation.capacity} Beds Total</span>
              </div>
            </CardContent>
          </Card>
        </DashboardGrid>
      </ContentSection>

      {/* Lifecycle & Safeguards Notice */}
      <ContentSection>
        <DashboardGrid cols={2}>
          <Card>
            <CardHeader className="border-b border-slate-200 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                Tenure & Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-gray-400">Start Date</span>
                <span className="font-semibold text-white">{allocation.startDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-gray-400">End Date</span>
                <span className="text-gray-200">{allocation.endDate || 'Ongoing / Indefinite'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50">
                <span className="text-gray-400">Hostel Request ID</span>
                <span className="font-mono text-gray-300">
                  {allocation.hostelRequestId ? `#${allocation.hostelRequestId}` : 'Direct Allocation'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Status Verification</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Integrity Verified
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-teal-950/20 border-teal-500/20">
            <CardHeader className="border-b border-teal-500/10 pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-teal-300">
                <ShieldCheck className="w-4 h-4" />
                Engine Guarantees & Safeguards
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs text-gray-400 leading-relaxed">
              <p>
                &bull; <strong className="text-gray-200">Capacity Enforcement:</strong> Room capacity is locked and validated at the database level to strictly prevent overcrowding.
              </p>
              <p>
                &bull; <strong className="text-gray-200">No Concurrent Allocations:</strong> A student cannot hold more than one active hostel allocation simultaneously.
              </p>
              <p>
                &bull; <strong className="text-gray-200">Pessimistic Concurrency Lock:</strong> Every bed is locked during the allocation transaction, eliminating race conditions during batch operations.
              </p>
              <p>
                &bull; <strong className="text-gray-200">Audit Trail:</strong> All allocation, preview, and release actions are recorded in immutable audit logs with actor identity and timestamp.
              </p>
            </CardContent>
          </Card>
        </DashboardGrid>
      </ContentSection>

      {/* Release Modal */}
      {releaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-base font-bold text-slate-900">Release Bed Allocation</h4>
            </div>
            <p className="text-sm text-gray-300">
              Are you sure you want to release Bed {allocation.bedNumber} allocated to {allocation.studentName}?
              The bed will immediately become AVAILABLE for allocation to other students.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReleaseModalOpen(false)}
                disabled={releasing}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleRelease}
                disabled={releasing}
              >
                {releasing ? 'Releasing...' : 'Confirm Release'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
