import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrincipalApprovals } from '../../hooks/usePrincipalApprovals';
import { PageContainer } from '../../components/layout';
import {
  Skeleton,
  Card,
  CardContent,
  Button,
  Badge,
} from '../../components/ui';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Calendar,
  Layers,
  FileText,
  User,
  ShieldCheck,
  Check,
  X,
  History,
} from 'lucide-react';
import { PrincipalApprovalDetailDto } from '../../types/principal';

export const PrincipalApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    fetchApprovalDetail,
    approveApproval,
    rejectApproval,
    actionLoading,
  } = usePrincipalApprovals();

  const [approval, setApproval] = useState<PrincipalApprovalDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal dialog states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [rejectionComments, setRejectionComments] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchApprovalDetail(Number(id))
        .then((data) => setApproval(data))
        .catch((err) => {
          if (err?.response?.status === 403) {
            setError('Access denied: You do not have permission to view approvals for this institution.');
          } else if (err?.response?.status === 404) {
            setError('Approval record not found.');
          } else {
            setError(err?.response?.data?.message || err?.message || 'Failed to load approval details.');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleApprove = async () => {
    if (!approval) return;
    try {
      setModalError(null);
      const updated = await approveApproval(approval.id, approvalComments.trim() || undefined);
      setApproval(updated);
      setShowApproveModal(false);
    } catch (err: any) {
      setModalError(err?.message || 'Failed to process approval');
    }
  };

  const handleReject = async () => {
    if (!approval) return;
    if (!rejectionComments.trim()) {
      setModalError('Rejection reason is mandatory.');
      return;
    }
    try {
      setModalError(null);
      const updated = await rejectApproval(approval.id, rejectionComments.trim());
      setApproval(updated);
      setShowRejectModal(false);
    } catch (err: any) {
      setModalError(err?.message || 'Failed to process rejection');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <Skeleton className="h-6 w-32 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-96 md:col-span-2 rounded-2xl" />
            <Skeleton className="h-72 rounded-2xl" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !approval) {
    return (
      <PageContainer>
        <div className="max-w-xl mx-auto mt-12 p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Unable to View Approval
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/principal/approvals')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Approvals
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Back Navigation */}
        <div>
          <button
            onClick={() => navigate('/principal/approvals')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Approvals
          </button>
        </div>

        {/* Page Header Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Approval #{approval.id}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                Level: {approval.approvalLevel}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
              Review Resource Request #{approval.requestId}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Submitted on {new Date(approval.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <Badge
              variant={
                approval.status === 'APPROVED'
                  ? 'success'
                  : approval.status === 'REJECTED'
                  ? 'danger'
                  : approval.status === 'PENDING'
                  ? 'warning'
                  : 'neutral'
              }
              size="md"
            >
              {approval.status}
            </Badge>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Information Column */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Resource Request Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Requested Resource</span>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {approval.resourceName || 'Resource Not Specified'}
                    </div>
                    {approval.resourceCode && (
                      <span className="text-[11px] font-mono text-slate-400">
                        Code: {approval.resourceCode}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Department</span>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {approval.departmentName || 'N/A'}
                    </div>
                    {approval.departmentCode && (
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        {approval.departmentCode}
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Requester</span>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {approval.requesterName || 'N/A'}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {approval.requesterEmail || ''}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Schedule & Priority</span>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {approval.requestedDate ? new Date(approval.requestedDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {approval.startTime && approval.endTime ? `${approval.startTime} - ${approval.endTime}` : ''} • Priority:{' '}
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {approval.priority || 'NORMAL'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">Purpose / Statement of Need</span>
                  <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-wrap leading-relaxed">
                    {approval.purpose || 'No purpose description provided.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Approval History Timeline */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-500" />
                  Approval Workflow History
                </h2>

                {approval.approvalHistory.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No prior approval records recorded for this request.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                    {approval.approvalHistory.map((item, idx) => (
                      <div key={item.id} className="relative">
                        <div
                          className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${
                            item.status === 'APPROVED'
                              ? 'border-emerald-500'
                              : item.status === 'REJECTED'
                              ? 'border-red-500'
                              : 'border-amber-500'
                          }`}
                        />
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {item.approvalLevel} Stage
                            </span>
                            <Badge
                              variant={
                                item.status === 'APPROVED'
                                  ? 'success'
                                  : item.status === 'REJECTED'
                                  ? 'danger'
                                  : 'warning'
                              }
                              size="sm"
                            >
                              {item.status}
                            </Badge>
                            <span className="text-[11px] text-slate-400">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>

                          {item.reviewerName && (
                            <div className="text-slate-600 dark:text-slate-300 mt-1">
                              Reviewed by:{' '}
                              <span className="font-medium text-slate-800 dark:text-slate-200">
                                {item.reviewerName}
                              </span>
                            </div>
                          )}

                          {item.comments && (
                            <p className="mt-1 p-2 rounded bg-slate-100/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 italic text-[11px]">
                              "{item.comments}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Decision Card Column */}
          <div>
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm sticky top-6">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  Principal Decision
                </h2>

                {approval.canApprove && approval.canReject ? (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      As Principal, you have authorization to approve or reject this institution resource request. Your action will be permanently recorded in the institution audit log.
                    </p>

                    <div className="space-y-2 pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => {
                          setModalError(null);
                          setShowApproveModal(true);
                        }}
                        leftIcon={<Check className="w-4 h-4" />}
                      >
                        Approve Request
                      </Button>

                      <Button
                        variant="outline"
                        size="md"
                        className="w-full justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 border-red-200 dark:border-red-900/50"
                        onClick={() => {
                          setModalError(null);
                          setShowRejectModal(true);
                        }}
                        leftIcon={<X className="w-4 h-4" />}
                      >
                        Reject Request
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-400 font-medium">Final Decision</span>
                      <div className="mt-1 font-semibold text-slate-900 dark:text-white">
                        {approval.status}
                      </div>
                      {approval.approverName && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Decided by: {approval.approverName}
                        </div>
                      )}
                      {approval.comments && (
                        <div className="mt-2 text-slate-600 dark:text-slate-300 italic text-[11px]">
                          "{approval.comments}"
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      This approval is finalized. Further status changes cannot be performed.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Approve Confirmation Modal */}
        {showApproveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Approve Resource Request?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Request #{approval.requestId} ({approval.resourceName})
                  </p>
                </div>
              </div>

              {modalError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                  {modalError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Approval Notes (Optional)
                </label>
                <textarea
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Enter optional comments or conditions for approval..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApproveModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Confirmation Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Reject Resource Request?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Request #{approval.requestId} ({approval.resourceName})
                  </p>
                </div>
              </div>

              {modalError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                  {modalError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionComments}
                  onChange={(e) => setRejectionComments(e.target.value)}
                  placeholder="Explain why this request is being declined (mandatory)..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRejectModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
