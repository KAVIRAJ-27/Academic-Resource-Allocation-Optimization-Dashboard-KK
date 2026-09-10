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
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
  User,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  ShieldAlert,
  XCircle,
  RefreshCw,
  Send,
} from 'lucide-react';
import { useWardenComplaintDetail } from '../../hooks/useWardenComplaintDetail';
import { ComplaintStatus, PriorityLevel } from '../../types/wardenOperations';

export const WardenComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { complaint, loading, error, mutating, updateStatus, refetch } =
    useWardenComplaintDetail(id);

  const [targetStatus, setTargetStatus] = useState<ComplaintStatus | null>(null);
  const [remarks, setRemarks] = useState('');
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

  const getStatusBadge = (status: ComplaintStatus) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="danger">OPEN</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="warning">IN PROGRESS</Badge>;
      case 'RESOLVED':
        return <Badge variant="success">RESOLVED</Badge>;
      case 'CLOSED':
        return <Badge variant="teal">CLOSED</Badge>;
      case 'REJECTED':
        return <Badge variant="neutral">REJECTED</Badge>;
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
      setActionError(err?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="p-16 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-400 mb-3" />
          <p>Loading grievance details #{id}...</p>
        </div>
      </PageContainer>
    );
  }

  if (error || !complaint) {
    return (
      <PageContainer>
        <div className="p-12 text-center text-red-400 max-w-md mx-auto">
          <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-semibold text-slate-200 mb-1">Unable to Load Grievance</h3>
          <p className="text-xs text-slate-400 mb-4">
            {error || 'The requested complaint does not exist or falls outside your authorized hostel scope.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/warden/complaints')}
          >
            Back to Complaints
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={`Complaint #${complaint.id}: ${complaint.title}`}
        description={`Reported by ${complaint.studentName} (${complaint.registerNumber}) in ${complaint.hostelName}.`}
        badge={getStatusBadge(complaint.status)}
        primaryAction={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/warden/complaints')}
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

      {/* QUICK STATUS TRANSITION ACTION BAR */}
      <Card className="mb-6 border-orange-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/20">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
              Operational Workflow State
            </span>
            <div className="flex items-center gap-3">
              {getStatusBadge(complaint.status)}
              <span className="text-xs text-slate-300">
                Priority: {getPriorityBadge(complaint.priority)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {complaint.status === 'OPEN' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Clock className="w-3.5 h-3.5" />}
                  onClick={() => setTargetStatus('IN_PROGRESS')}
                >
                  Start Investigation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetStatus('REJECTED')}
                >
                  Reject Grievance
                </Button>
              </>
            )}

            {complaint.status === 'IN_PROGRESS' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => setTargetStatus('RESOLVED')}
                >
                  Mark as Resolved
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTargetStatus('REJECTED')}
                >
                  Reject
                </Button>
              </>
            )}

            {complaint.status === 'RESOLVED' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => setTargetStatus('CLOSED')}
              >
                Close Complaint
              </Button>
            )}

            {(complaint.status === 'CLOSED' || complaint.status === 'REJECTED') && (
              <span className="text-xs text-slate-400 italic">
                This ticket has been finalized. No further status changes permitted.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <DashboardGrid variant="split">
        {/* LEFT 2 COLS: Issue Details & Timeline */}
        <GridCol span={2}>
          <ContentSection title="Grievance Details" subtitle="Category, location, and description">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Student Statement
                  </CardTitle>
                  <Badge variant="neutral">{complaint.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                    Subject / Title
                  </label>
                  <p className="text-sm font-semibold text-slate-100">{complaint.title}</p>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider block mb-1">
                    Detailed Statement
                  </label>
                  <div className="p-4 bg-slate-900/90 rounded-lg border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {complaint.description || 'No detailed statement provided.'}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">Created</span>
                    <span className="text-slate-300 font-medium">
                      {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Last Updated</span>
                    <span className="text-slate-300 font-medium">
                      {complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Resolved At</span>
                    <span className="text-slate-300 font-medium">
                      {complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleString() : 'Pending'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Location & Infrastructure Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="w-4 h-4 text-orange-400" />
                  Residential Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Hostel Block</span>
                    <span className="text-slate-200 font-semibold">{complaint.hostelName}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">{complaint.hostelCode}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Room Number</span>
                    <span className="text-slate-200 font-semibold">{complaint.roomNumber || 'Common Area'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Wing / Block</span>
                    <span className="text-slate-200 font-semibold">{complaint.blockName || 'Main'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Floor</span>
                    <span className="text-slate-200 font-semibold">
                      {complaint.floorNumber !== undefined ? `Floor ${complaint.floorNumber}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ContentSection>
        </GridCol>

        {/* RIGHT 1 COL: Student Bio & Handlers */}
        <GridCol span={1}>
          <ContentSection title="Resident Student" subtitle="Reporter academic and contact profile">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-400" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 font-bold text-sm border border-slate-700">
                    {complaint.studentName ? complaint.studentName.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 text-sm">{complaint.studentName}</h4>
                    <p className="font-mono text-slate-400 text-xs">{complaint.registerNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{complaint.studentEmail || 'Email not available'}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{complaint.studentPhone || 'No phone registered'}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {complaint.departmentName || 'Department N/A'}
                    {complaint.currentSemester ? ` (Sem ${complaint.currentSemester})` : ''}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  Handling Officer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <div>
                  <span className="text-slate-500 block">Assigned Officer / Warden</span>
                  <span className="text-slate-200 font-medium">
                    {complaint.assignedToName || 'Unassigned / General Warden Queue'}
                  </span>
                </div>
                {complaint.assignedToEmail && (
                  <div>
                    <span className="text-slate-500 block">Officer Email</span>
                    <span className="text-slate-400">{complaint.assignedToEmail}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </ContentSection>
        </GridCol>
      </DashboardGrid>

      {/* CONFIRM STATUS TRANSITION MODAL */}
      {targetStatus && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                Transition Status to {targetStatus}
              </h3>
              <button
                onClick={() => setTargetStatus(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-900/30 border border-red-500/40 rounded-lg text-xs text-red-300">
                {actionError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                You are about to change the status of Complaint #{complaint.id} from{' '}
                <strong className="text-slate-100">{complaint.status}</strong> to{' '}
                <strong className="text-orange-400">{targetStatus}</strong>.
              </p>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">
                  Remarks / Resolution Notes
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter details of action taken, communication with student, or reason..."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg text-slate-200 p-2.5 text-xs focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
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
                Confirm Transition
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
