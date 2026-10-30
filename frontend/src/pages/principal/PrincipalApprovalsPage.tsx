import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const PrincipalApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    approvals,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    statusFilter,
    fromDate,
    toDate,
    setPage,
    setStatusFilter,
    setFromDate,
    setToDate,
    refresh,
  } = usePrincipalApprovals(10);

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
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E0D0] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#F4F0E6] border border-[#D8C9A8] text-[#B8A16A]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#202020] tracking-tight">
                Institution Approvals Management
              </h1>
            </div>
            <p className="text-sm text-[#555555] mt-1">
              Review and process institution-wide academic resource requests requiring Principal authorization
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
        <Card className="border border-[#D8C9A8] shadow-none">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#F8F6F0] p-1 rounded-xl border border-[#E8E0D0]">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      statusFilter === st
                        ? 'bg-white text-[#202020] border border-[#D8C9A8] shadow-none'
                        : 'text-[#77736A] hover:text-[#202020]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Date Filters */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-white border border-[#D9D2C3] rounded-lg px-2.5 py-1">
                  <Calendar className="w-3.5 h-3.5 text-[#77736A]" />
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-transparent text-[#202020] text-xs focus:outline-none"
                    placeholder="From date"
                  />
                </div>
                <span className="text-[#77736A] text-xs">to</span>
                <div className="flex items-center gap-1.5 bg-white border border-[#D9D2C3] rounded-lg px-2.5 py-1">
                  <Calendar className="w-3.5 h-3.5 text-[#77736A]" />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-transparent text-[#202020] text-xs focus:outline-none"
                    placeholder="To date"
                  />
                </div>
                {(fromDate || toDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFromDate('');
                      setToDate('');
                    }}
                    className="text-xs h-7 px-2"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approvals Table */}
        <Card className="border border-[#D8C9A8] shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading && approvals.length === 0 ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : approvals.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-12 h-12 mx-auto text-[#B8A16A] mb-3" />
                <h3 className="text-base font-serif font-bold text-[#202020]">
                  No Approvals Found
                </h3>
                <p className="text-xs text-[#555555] mt-1 max-w-sm mx-auto">
                  There are currently no resource request approvals matching your filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8F6F0] border-b border-[#E8E0D0] text-[#555555] font-semibold">
                      <th className="py-3 px-4">Approval ID</th>
                      <th className="py-3 px-4">Request</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Requester</th>
                      <th className="py-3 px-4 text-center">Stage / Level</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Decision / Approver</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D0]">
                    {approvals.map((appr) => (
                      <tr
                        key={appr.id}
                        className="hover:bg-[#F4F0E6] transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-[#202020]">
                          #{appr.id}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-medium text-[#B8A16A]">
                            Req #{appr.requestId}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#202020]">
                          <div className="font-bold">{appr.departmentName || 'N/A'}</div>
                          {appr.departmentCode && (
                            <span className="text-[10px] font-mono text-[#77736A] font-medium uppercase">
                              {appr.departmentCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#202020]">
                            {appr.requesterName || 'N/A'}
                          </div>
                          <div className="text-[11px] text-[#77736A] font-medium">
                            {appr.requesterEmail || ''}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F8F6F0] border border-[#E8E0D0] text-[#555555]">
                            {appr.approvalLevel}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(appr.status)}
                        </td>
                        <td className="py-3 px-4">
                          {appr.approverName ? (
                            <div>
                              <span className="font-bold text-[#202020]">
                                {appr.approverName}
                              </span>
                              {appr.comments && (
                                <p className="text-[11px] text-[#77736A] font-medium italic truncate max-w-xs">
                                  "{appr.comments}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#77736A] font-medium italic">Pending Decision</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#77736A] font-medium whitespace-nowrap">
                          {new Date(appr.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant={appr.status === 'PENDING' ? 'primary' : 'outline'}
                            size="sm"
                            className="h-7 text-xs px-2.5"
                            onClick={() => navigate(`/principal/approvals/${appr.id}`)}
                            leftIcon={<Eye className="w-3.5 h-3.5" />}
                          >
                            {appr.status === 'PENDING' ? 'Review' : 'View'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[#E8E0D0] flex items-center justify-between text-xs text-[#555555]">
                <div>
                  Showing page <span className="font-semibold text-[#202020]">{page + 1}</span> of{' '}
                  <span className="font-semibold text-[#202020]">{totalPages}</span> ({totalElements} total approvals)
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
      </div>
    </PageContainer>
  );
};
