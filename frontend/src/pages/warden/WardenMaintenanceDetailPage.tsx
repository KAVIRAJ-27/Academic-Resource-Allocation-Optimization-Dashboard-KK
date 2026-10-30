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
  ArrowLeft,
  Wrench,
  CheckCircle2,
  Clock,
  Building,
  User,
  Mail,
  Calendar,
  ShieldAlert,
  XCircle,
  RefreshCw,
  Send,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { useWardenMaintenanceDetail } from '../../hooks/useWardenMaintenanceDetail';
import { MaintenanceStatus, PriorityLevel } from '../../types/wardenOperations';

export const WardenMaintenanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    maintenance,
    loading,
    error,
    mutating,
    updateStatus,
    assignTechnician,
    refetch,
  } = useWardenMaintenanceDetail(id);

  const [targetStatus, setTargetStatus] = useState<MaintenanceStatus | null>(null);
  const [remarks, setRemarks] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [technicianIdInput, setTechnicianIdInput] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

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

  const handleExecuteTransition = async () => {
    if (!targetStatus) return;
    try {
      setActionError(null);
      await updateStatus({
        status: targetStatus,
        remarks: remarks.trim() || undefined,
      });
      setTargetStatus(null);
      setRemarks('');
    } catch (err: any) {
      setActionError(err?.message || 'Failed to update work order status');
    }
  };

  const handleAssignTechnician = async () => {
    const techId = parseInt(technicianIdInput.trim(), 10);
    if (isNaN(techId) || techId <= 0) {
      setActionError('Please enter a valid staff/technician User ID.');
      return;
    }
    try {
      setActionError(null);
      await assignTechnician({ assignedToId: techId });
      setAssignModalOpen(false);
      setTechnicianIdInput('');
    } catch (err: any) {
      setActionError(err?.message || 'Failed to assign technician');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-400 mb-3" />
          <p>Loading work order details #{id}...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !maintenance) {
    return (
      <PageContainer>
        <div className="p-12 text-center text-red-400 max-w-md mx-auto">
          <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-semibold text-slate-200 mb-1">Unable to Load Work Order</h3>
          <p className="text-xs text-slate-400 mb-4">
            {error || 'The requested work order does not exist or falls outside your authorized hostel scope.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/warden/maintenance')}
          >
            Back to Maintenance
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Work Order #${maintenance.id}: ${maintenance.title}`}
        description={`Reported for ${maintenance.hostelName}${maintenance.roomNumber ? ` (Room ${maintenance.roomNumber})` : ''}.`}
        badge={getStatusBadge(maintenance.status)}
        primaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/warden/maintenance')}
          >
            Back to List
          </Button>
        }
        secondaryAction={
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        }
      />

      {/* QUICK WORK ORDER ACTION BAR */}
      <Card className="mb-6 border-orange-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/20">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-600 font-bold uppercase tracking-wider font-semibold block mb-1">
              Dispatch & Execution Workflow
            </span>
            <div className="flex items-center gap-3">
              {getStatusBadge(maintenance.status)}
              <span className="text-xs text-slate-300">
                Priority: {getPriorityBadge(maintenance.priority)}
              </span>
              {maintenance.assignedToName && (
                <span className="text-xs text-teal-400 font-medium">
                  Assigned: {maintenance.assignedToName}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {maintenance.status === 'OPEN' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setActionError(null);
                    setAssignModalOpen(true);
                  }}
                >
                  Assign Technician
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetStatus('CANCELLED')}
                >
                  Cancel Order
                </Button>
              </>
            )}

            {maintenance.status === 'ASSIGNED' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Clock className="w-3.5 h-3.5" />}
                  onClick={() => setTargetStatus('IN_PROGRESS')}
                >
                  Start Work
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setActionError(null);
                    setAssignModalOpen(true);
                  }}
                >
                  Reassign
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetStatus('CANCELLED')}
                >
                  Cancel
                </Button>
              </>
            )}

            {maintenance.status === 'IN_PROGRESS' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => setTargetStatus('COMPLETED')}
                >
                  Mark Completed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetStatus('CANCELLED')}
                >
                  Cancel Order
                </Button>
              </>
            )}

            {(maintenance.status === 'COMPLETED' || maintenance.status === 'CANCELLED') && (
              <span className="text-xs text-slate-400 italic">
                Work order is finalized ({maintenance.status}). No additional changes permitted.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <DashboardGrid variant="split">
        {/* LEFT 2 COLS: Order Details & Infrastructure */}
        <GridCol span={2}>
          <ContentSection title="Repair Scope" subtitle="Ticket description and affected equipment">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-orange-400" />
                    Problem Description
                  </CardTitle>
                  {maintenance.resourceName && (
                    <Badge variant="orange">Asset: {maintenance.resourceName}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-slate-600 font-bold uppercase tracking-wider block mb-1">
                    Work Order Title
                  </label>
                  <p className="text-sm font-semibold text-slate-100">{maintenance.title}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-600 font-bold uppercase tracking-wider block mb-1 font-bold">
                    Detailed Notes
                  </label>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-medium">
                    {maintenance.description || 'No detailed issue notes recorded.'}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Logged</span>
                    <span className="text-slate-900 font-semibold">
                      {maintenance.createdAt ? new Date(maintenance.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Updated</span>
                    <span className="text-slate-900 font-semibold">
                      {maintenance.updatedAt ? new Date(maintenance.updatedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Completed</span>
                    <span className="text-slate-300 font-medium">
                      {maintenance.completedAt ? new Date(maintenance.completedAt).toLocaleString() : 'Pending'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="w-4 h-4 text-orange-400" />
                  Repair Venue Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Hostel Block</span>
                    <span className="text-slate-200 font-semibold">{maintenance.hostelName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{maintenance.hostelCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Room Number</span>
                    <span className="text-slate-200 font-semibold">{maintenance.roomNumber || 'Common Area'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Wing / Block</span>
                    <span className="text-slate-200 font-semibold">{maintenance.blockName || 'Main Facility'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Floor</span>
                    <span className="text-slate-200 font-semibold">
                      {maintenance.floorNumber !== undefined ? `Floor ${maintenance.floorNumber}` : 'Ground'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ContentSection>
        </GridCol>

        {/* RIGHT 1 COL: Dispatch & Reporter */}
        <GridCol span={1}>
          <ContentSection title="Personnel" subtitle="Assigned technician and reporter information">
            {/* Technician Card */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-teal-400" />
                    Assigned Technician
                  </CardTitle>
                  {maintenance.assignedToId && (
                    <Badge variant="teal">ID #{maintenance.assignedToId}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {maintenance.assignedToName ? (
                  <>
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200">
                        {maintenance.assignedToName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {maintenance.assignedToName}
                        </h4>
                        <p className="text-slate-600 text-xs font-medium">Staff / Maintenance Tech</p>
                      </div>
                    </div>

                    {maintenance.assignedToEmail && (
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{maintenance.assignedToEmail}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-slate-400 mb-3">No technician assigned yet.</p>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setActionError(null);
                        setAssignModalOpen(true);
                      }}
                    >
                      Assign Staff Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reporter Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-400" />
                  Reported By
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Name</span>
                  <span className="text-slate-200 font-medium">
                    {maintenance.reportedByName || 'Residential Staff'}
                  </span>
                </div>
                {maintenance.reportedByEmail && (
                  <div>
                    <span className="text-slate-500 block">Contact Email</span>
                    <span className="text-slate-400">{maintenance.reportedByEmail}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </ContentSection>
        </GridCol>
      </DashboardGrid>

      {/* CONFIRM STATUS TRANSITION MODAL */}
      {targetStatus && (
        <div className="fixed inset-0 z-50 bg-[#202020]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D8C9A8] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E0D0] pb-3">
              <h3 className="text-base font-serif font-bold text-[#202020] flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#B8A16A]" />
                Update Order to {targetStatus}
              </h3>
              <button
                onClick={() => setTargetStatus(null)}
                className="text-[#77736A] hover:text-[#202020] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-[#B44747]/10 border border-[#B44747]/20 rounded-xl text-xs font-semibold text-[#B44747]">
                {actionError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-[#555555] leading-relaxed font-medium">
                Confirm updating Work Order #{maintenance.id} from{' '}
                <strong className="text-[#202020] font-bold">{maintenance.status}</strong> to{' '}
                <strong className="text-[#B8A16A] font-bold">{targetStatus}</strong>.
              </p>

              <div>
                <label className="text-[#202020] block mb-1 font-bold">
                  Remarks / Work Completion Notes
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Details of repair work performed or reason for cancellation..."
                  rows={4}
                  className="w-full bg-[#FFFFFF] border border-[#D9D2C3] rounded-xl text-[#202020] font-medium p-2.5 text-xs shadow-2xs focus:outline-none focus:border-[#B8A16A] resize-none placeholder-[#77736A]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E0D0]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTargetStatus(null)}
                disabled={mutating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={handleExecuteTransition}
                loading={mutating}
              >
                Save Status
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN TECHNICIAN MODAL */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#202020]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D8C9A8] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8E0D0] pb-3">
              <h3 className="text-base font-serif font-bold text-[#202020] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#B8A16A]" />
                Assign Technician
              </h3>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="text-[#77736A] hover:text-[#202020] transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-[#B44747]/10 border border-[#B44747]/20 rounded-xl text-xs font-semibold text-[#B44747]">
                {actionError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-[#555555] leading-relaxed font-medium">
                Assign a qualified technician or staff member to handle Work Order #{maintenance.id}.
              </p>

              <div>
                <label className="text-[#202020] block mb-1 font-bold">
                  Staff / Technician User ID <span className="text-[#B44747]">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter User ID (e.g. 1)"
                  value={technicianIdInput}
                  onChange={(e) => setTechnicianIdInput(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#D9D2C3] rounded-xl text-[#202020] font-medium p-2.5 text-xs shadow-2xs focus:outline-none focus:border-[#B8A16A] placeholder-[#77736A]"
                />
                <span className="text-[11px] text-[#77736A] mt-1 block font-medium">
                  The user must be a registered staff member or authorized technician.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E8E0D0]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAssignModalOpen(false)}
                disabled={mutating}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                onClick={handleAssignTechnician}
                loading={mutating}
              >
                Confirm Dispatch
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
