import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrincipalResourceRequests } from '../../hooks/usePrincipalResourceRequests';
import { PageContainer } from '../../components/layout';
import {
  Skeleton,
  Card,
  CardContent,
  Button,
  Badge,
} from '../../components/ui';
import {
  Layers,
  Search,
  Calendar,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Check,
  X,
  History,
} from 'lucide-react';
import { PrincipalResourceRequestDetailDto } from '../../types/principal';

export const PrincipalResourceRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    requests,
    loading,
    actionLoading,
    detailLoading,
    error,
    page,
    totalPages,
    totalElements,
    search,
    statusFilter,
    priorityFilter,
    fromDate,
    toDate,
    setPage,
    setSearch,
    setStatusFilter,
    setPriorityFilter,
    setFromDate,
    setToDate,
    fetchRequestDetail,
    approveRequest,
    rejectRequest,
    refresh,
  } = usePrincipalResourceRequests(10);

  const [selectedDetail, setSelectedDetail] = useState<PrincipalResourceRequestDetailDto | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comments, setComments] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  const handleViewDetail = async (id: number) => {
    try {
      setModalError(null);
      const detail = await fetchRequestDetail(id);
      setSelectedDetail(detail);
      setShowDetailModal(true);
    } catch (err: any) {
      // handled by hook
    }
  };

  const handleApprove = async () => {
    if (!selectedDetail) return;
    try {
      setModalError(null);
      const updated = await approveRequest(selectedDetail.id, comments.trim() || undefined);
      setSelectedDetail(updated);
      setShowApproveModal(false);
    } catch (err: any) {
      setModalError(err?.message || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!selectedDetail) return;
    if (!comments.trim()) {
      setModalError('Rejection reason is mandatory.');
      return;
    }
    try {
      setModalError(null);
      const updated = await rejectRequest(selectedDetail.id, comments.trim());
      setSelectedDetail(updated);
      setShowRejectModal(false);
    } catch (err: any) {
      setModalError(err?.message || 'Failed to reject request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
      case 'APPROVED':
        return <Badge variant="success">APPROVED</Badge>;
      case 'REJECTED':
        return <Badge variant="danger">REJECTED</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">CANCELLED</Badge>;
      case 'COMPLETED':
        return <Badge variant="info">COMPLETED</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D0] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#F4F0E6] border border-[#D8C9A8] text-[#B8A16A]">
                <Layers className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#202020] tracking-tight">
                Academic Resource Requests
              </h1>
            </div>
            <p className="text-sm text-[#555555] mt-1">
              Monitor academic resource requests across departments, view academic context, and review pending submissions
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/principal/monitoring')}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Monitoring
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
              leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-[#B44747]/10 border border-[#B44747]/20 flex items-center gap-3 text-[#B44747] text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">{error}</div>
            <Button variant="ghost" size="sm" onClick={refresh}>
              Retry
            </Button>
          </div>
        )}

        {/* Filters */}
        <Card className="border border-[#D8C9A8] shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#77736A]" />
                <input
                  type="text"
                  placeholder="Search by requester, resource, department, purpose..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#D9D2C3] bg-[#FFFFFF] text-[#202020] placeholder-[#77736A] focus:outline-none focus:border-[#B8A16A]"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#F8F6F0] p-1 rounded-xl border border-[#E8E0D0]">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      statusFilter === st
                        ? 'bg-white text-[#202020] border border-[#D8C9A8] shadow-none'
                        : 'text-[#77736A] hover:text-[#202020]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-[#D9D2C3] bg-white text-[#202020] focus:outline-none focus:border-[#B8A16A]"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              {/* Date Filters */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#D9D2C3] rounded-lg px-2 py-1">
                  <Calendar className="w-3.5 h-3.5 text-[#77736A]" />
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-transparent text-[#202020] text-xs focus:outline-none"
                  />
                </div>
                <span className="text-[#77736A] text-xs">to</span>
                <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#D9D2C3] rounded-lg px-2 py-1">
                  <Calendar className="w-3.5 h-3.5 text-[#77736A]" />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-transparent text-[#202020] text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="border border-[#D8C9A8] shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading && requests.length === 0 ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center">
                <Layers className="w-12 h-12 mx-auto text-[#B8A16A] mb-3" />
                <h3 className="text-base font-serif font-bold text-[#202020]">
                  No Resource Requests Found
                </h3>
                <p className="text-xs text-[#555555] mt-1 max-w-sm mx-auto">
                  There are currently no resource requests matching your filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8F6F0] border-b border-[#E8E0D0] text-[#555555] font-semibold">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Requester</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Resource & Category</th>
                      <th className="py-3 px-4">Purpose</th>
                      <th className="py-3 px-4">Schedule</th>
                      <th className="py-3 px-4 text-center">Priority</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D0]">
                    {requests.map((req) => (
                      <tr
                        key={req.id}
                        className="hover:bg-[#F4F0E6] transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-[#202020]">
                          #{req.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#202020]">
                            {req.requesterName}
                          </div>
                          <div className="text-[11px] text-[#77736A] font-medium">{req.requesterEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#202020]">
                            {req.departmentName}
                          </div>
                          <span className="text-[10px] font-mono text-[#77736A] font-medium uppercase">
                            {req.departmentCode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#202020]">
                            {req.resourceName || 'Unassigned Resource'}
                          </div>
                          <span className="text-[11px] text-[#77736A] font-medium">
                            {req.categoryName || 'General'}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[#555555]">
                          {req.purpose}
                        </td>
                        <td className="py-3 px-4 text-[#555555] whitespace-nowrap">
                          <div>{req.requestedDate}</div>
                          <div className="text-[11px] text-[#77736A] font-medium">
                            {req.startTime} - {req.endTime}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F8F6F0] border border-[#E8E0D0] text-[#555555]">
                            {req.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(req.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2.5"
                            onClick={() => handleViewDetail(req.id)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[#E8E0D0] flex items-center justify-between text-xs text-[#555555]">
                <div>
                  Showing page <span className="font-semibold text-[#202020]">{page + 1}</span> of{' '}
                  <span className="font-semibold text-[#202020]">{totalPages}</span> ({totalElements} total requests)
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0 || loading}
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages - 1 || loading}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Detail Modal */}
        {showDetailModal && selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202020]/40 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-2xl border border-[#D8C9A8] max-w-2xl w-full p-6 shadow-xl space-y-5 my-8">
              <div className="flex items-start justify-between border-b border-[#E8E0D0] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#F8F6F0] text-[#555555] border border-[#E8E0D0]">
                      Request #{selectedDetail.id}
                    </span>
                    {getStatusBadge(selectedDetail.status)}
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#202020] mt-1.5">
                    {selectedDetail.resourceName || 'Resource Request'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-[#77736A] hover:text-[#202020] hover:bg-[#F4F0E6] p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0]">
                  <span className="text-[#77736A]">Department</span>
                  <div className="font-bold text-[#202020] mt-0.5">
                    {selectedDetail.departmentName} ({selectedDetail.departmentCode})
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0]">
                  <span className="text-[#77736A]">Requester</span>
                  <div className="font-bold text-[#202020] mt-0.5">
                    {selectedDetail.requesterName}
                  </div>
                  <div className="text-[11px] text-[#77736A]">{selectedDetail.requesterEmail}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0]">
                  <span className="text-[#77736A]">Date & Time</span>
                  <div className="font-bold text-[#202020] mt-0.5">
                    {selectedDetail.requestedDate}
                  </div>
                  <div className="text-[11px] text-[#77736A]">
                    {selectedDetail.startTime} - {selectedDetail.endTime}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0]">
                  <span className="text-[#77736A]">Capacity & Location</span>
                  <div className="font-bold text-[#202020] mt-0.5">
                    Capacity: {selectedDetail.resourceCapacity || 'N/A'}
                  </div>
                  <div className="text-[11px] text-[#77736A]">
                    Location: {selectedDetail.resourceLocation || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0] text-xs">
                <span className="text-[#77736A] font-medium">Purpose</span>
                <p className="text-[#202020] mt-1 whitespace-pre-wrap">
                  {selectedDetail.purpose}
                </p>
                {selectedDetail.description && (
                  <p className="text-[#555555] mt-1.5 text-[11px]">
                    Context: {selectedDetail.description}
                  </p>
                )}
              </div>

              {/* Approval History */}
              {selectedDetail.approvalHistory && selectedDetail.approvalHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-serif font-bold text-[#202020] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-[#B8A16A]" />
                    Approval History
                  </h4>
                  <div className="space-y-1.5">
                    {selectedDetail.approvalHistory.map((h) => (
                      <div
                        key={h.id}
                        className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E8E0D0] text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-[#202020]">
                            {h.approvalLevel}
                          </span>{' '}
                          • {getStatusBadge(h.status)}
                          {h.reviewerName && (
                            <span className="text-[#555555] ml-2">
                              by {h.reviewerName}
                            </span>
                          )}
                          {h.comments && (
                            <div className="text-[11px] text-[#77736A] italic mt-0.5">
                              "{h.comments}"
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-[#77736A]">
                          {new Date(h.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8E0D0]">
                <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
                {selectedDetail.status === 'PENDING' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[#B44747] border-[#B44747]/30 hover:bg-[#B44747]/10"
                      onClick={() => {
                        setComments('');
                        setModalError(null);
                        setShowRejectModal(true);
                      }}
                      leftIcon={<X className="w-3.5 h-3.5" />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-[#3F7655] hover:bg-[#326044] text-white"
                      onClick={() => {
                        setComments('');
                        setModalError(null);
                        setShowApproveModal(true);
                      }}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal: Approve confirmation */}
        {showApproveModal && selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202020]/40 backdrop-blur-xs">
            <div className="bg-white rounded-xl border border-[#D8C9A8] max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-serif font-bold text-[#202020] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#3F7655]" />
                Approve Resource Request #{selectedDetail.id}?
              </h3>
              {modalError && (
                <div className="p-2.5 rounded bg-[#FBF0F0] border border-[#EBBABA] text-[#B44747] text-xs">
                  {modalError}
                </div>
              )}
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Optional approval notes..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-[#D9D2C3] bg-white text-[#202020] placeholder-[#77736A] focus:outline-none focus:border-[#B8A16A]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowApproveModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-[#3F7655] hover:bg-[#346246] border border-[#3F7655] text-white"
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Reject confirmation */}
        {showRejectModal && selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202020]/40 backdrop-blur-xs">
            <div className="bg-white rounded-xl border border-[#D8C9A8] max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-base font-serif font-bold text-[#202020] flex items-center gap-2">
                <XCircle className="w-5 h-5 text-[#B44747]" />
                Reject Resource Request #{selectedDetail.id}?
              </h3>
              {modalError && (
                <div className="p-2.5 rounded bg-[#FBF0F0] border border-[#EBBABA] text-[#B44747] text-xs">
                  {modalError}
                </div>
              )}
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Rejection reason (mandatory)..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-[#D9D2C3] bg-white text-[#202020] placeholder-[#77736A] focus:outline-none focus:border-[#B8A16A]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowRejectModal(false)}>
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
