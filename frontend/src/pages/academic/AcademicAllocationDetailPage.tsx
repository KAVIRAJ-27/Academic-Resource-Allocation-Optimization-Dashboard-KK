import React, { useState } from 'react';
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
  CardDescription,
  CardContent,
} from '../../components/ui';
import {
  ArrowLeft,
  Building,
  Calendar,
  Clock,
  User,
  BookOpen,
  Layers,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  DoorOpen,
  FileText,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { useAcademicAllocationDetail } from '../../hooks/useAcademicAllocationDetail';
import { useAcademicAllocationMutations } from '../../hooks/useAcademicAllocationMutations';
import { AllocationStatus } from '../../types/academicAllocation';

export const AcademicAllocationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const allocationId = id ? parseInt(id, 10) : null;

  const { allocation, loading, error, refetch } = useAcademicAllocationDetail(allocationId);
  const { cancel, submitting: cancelSubmitting } = useAcademicAllocationMutations();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelRemarks, setCancelRemarks] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  if (loading) {
    return (
      <PageContainer>
        <div className="py-24 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
          Loading allocation details...
        </div>
      </PageContainer>
    );
  }

  if (error || !allocation) {
    return (
      <PageContainer>
        <div className="py-16 text-center space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 max-w-md mx-auto text-sm">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-rose-400" />
            <p className="font-semibold">{error || 'Allocation record not found'}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/academic/allocations')}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Allocations
          </Button>
        </div>
      </PageContainer>
    );
  }

  const handleConfirmCancel = async () => {
    if (!allocationId) return;
    setCancelError(null);
    try {
      await cancel(allocationId, cancelRemarks.trim() || undefined);
      setIsCancelModalOpen(false);
      refetch();
    } catch (err: any) {
      setCancelError(err?.response?.data?.message || err?.message || 'Failed to cancel allocation');
    }
  };

  const getStatusBadge = (status: AllocationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active Allocation</Badge>;
      case 'PENDING':
        return <Badge variant="warning">Pending</Badge>;
      case 'COMPLETED':
        return <Badge variant="info">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <PageContainer>
      {/* Top Navigation & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/academic/allocations')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Allocations
          </Button>
          <span className="text-slate-600">/</span>
          <span className="text-xs text-slate-400 font-mono">ID #{allocation.id}</span>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(allocation.status)}
          {allocation.status === 'ACTIVE' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsCancelModalOpen(true)}
              className="bg-rose-600/80 hover:bg-rose-600 text-white"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Cancel Allocation
            </Button>
          )}
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {allocation.resourceName}
              </h1>
              <Badge variant="gray" className="font-mono text-xs">
                {allocation.resourceCode}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {allocation.categoryName || 'Academic Resource'} • Capacity: {allocation.capacity || 0} seats
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Scheduled For</div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5 justify-end">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>{allocation.allocationDate}</span>
            </div>
            <div className="text-xs text-slate-600 font-medium flex items-center gap-1 mt-0.5 justify-end">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {allocation.startTime} - {allocation.endTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Informational Cards */}
      <DashboardGrid cols={2}>
        {/* Card 1: Physical Resource Specification */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-200 pb-3">
            <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              Physical Facility Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold block">Building & Location:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {allocation.building || allocation.location || 'Main Academic Campus'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Room Number:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {allocation.roomNumber || 'Room N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Facility Type:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {allocation.roomType || allocation.categoryName || 'Classroom'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Total Seating Capacity:</span>
                <span className="font-bold text-emerald-700 mt-0.5 block">
                  {allocation.capacity || 0} Seats
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Academic Period & Time Window */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-200 pb-3">
            <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Academic Term & Timing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold block">Academic Year:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {allocation.academicYearName || 'Current Year'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Semester:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {allocation.semesterName || 'Active Semester'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Time Slot:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {allocation.timeSlotName || 'Custom Dynamic Booking'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Duration:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {allocation.startTime} to {allocation.endTime}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Requester & Beneficiary Details */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-200 pb-3">
            <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              Allocated Requester
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold block">Full Name:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {allocation.allocatedToUserName || 'Unknown'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Institutional Email:</span>
                <span className="font-bold text-slate-900 mt-0.5 block truncate" title={allocation.allocatedToUserEmail}>
                  {allocation.allocatedToUserEmail || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Assigned Role:</span>
                <Badge variant="gray" className="mt-1 text-[11px] font-bold">
                  {allocation.requesterRole || 'FACULTY'}
                </Badge>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Department:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {allocation.departmentName || 'General Academic'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Curriculum & Pedagogical Context */}
        <Card className="bg-white border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-200 pb-3">
            <CardTitle className="text-sm text-slate-900 font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Curricular Usage & Request Context
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 font-semibold block">Subject:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {allocation.subjectName || 'Ad-hoc Academic Event'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block">Target Section:</span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {allocation.sectionName || 'N/A'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 font-semibold block">Declared Purpose:</span>
                <p className="font-medium text-slate-800 mt-0.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {allocation.purpose || 'Academic allocation'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DashboardGrid>

      {/* Audit & Administrative Log Card */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardContent className="p-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>
                Allocated by <strong className="text-slate-900">{allocation.allocatedByName || 'System Engine'}</strong>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                Created: <strong className="text-slate-900">{new Date(allocation.createdAt).toLocaleString()}</strong>
              </span>
              {allocation.updatedAt && (
                <span>
                  Updated: <strong className="text-slate-900">{new Date(allocation.updatedAt).toLocaleString()}</strong>
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#202020]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D8C9A8] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#B44747]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-serif font-bold text-[#202020]">Cancel Academic Allocation</h3>
            </div>
            <p className="text-xs text-[#555555] font-medium leading-relaxed">
              Are you sure you want to cancel this allocation? The room slot will be instantly freed up
              for re-allocation, while maintaining all system audit trails.
            </p>

            {cancelError && (
              <div className="p-3 rounded-xl bg-[#B44747]/10 border border-[#B44747]/20 text-[#B44747] font-medium text-xs">
                {cancelError}
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-[#202020] block mb-1">
                Reason for Cancellation:
              </label>
              <textarea
                rows={2}
                placeholder="Enter cancellation reason..."
                value={cancelRemarks}
                onChange={(e) => setCancelRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D9D2C3] rounded-xl text-xs text-[#202020] placeholder-[#77736A] font-medium focus:outline-none focus:border-[#B44747] shadow-2xs"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCancelModalOpen(false)}
                disabled={cancelSubmitting}
              >
                Go Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmCancel}
                disabled={cancelSubmitting}
              >
                {cancelSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
