import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrincipalAllocations } from '../../hooks/usePrincipalAllocations';
import { PageContainer } from '../../components/layout';
import {
  Skeleton,
  Card,
  CardContent,
  Button,
  Badge,
} from '../../components/ui';
import {
  CheckCircle2,
  Calendar,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Building2,
  X,
  MapPin,
  Users,
} from 'lucide-react';
import { PrincipalAllocationDetailDto } from '../../types/principal';

export const PrincipalAllocationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    allocations,
    loading,
    detailLoading,
    error,
    page,
    totalPages,
    totalElements,
    statusFilter,
    dateFilter,
    setPage,
    setStatusFilter,
    setDateFilter,
    fetchAllocationDetail,
    refresh,
  } = usePrincipalAllocations(10);

  const [selectedDetail, setSelectedDetail] = useState<PrincipalAllocationDetailDto | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleViewDetail = async (id: number) => {
    try {
      const detail = await fetchAllocationDetail(id);
      setSelectedDetail(detail);
      setShowDetailModal(true);
    } catch (err: any) {
      // handled in hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">ACTIVE</Badge>;
      case 'COMPLETED':
        return <Badge variant="info">COMPLETED</Badge>;
      case 'CANCELLED':
        return <Badge variant="neutral">CANCELLED</Badge>;
      case 'PENDING':
        return <Badge variant="warning">PENDING</Badge>;
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
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-[#202020] tracking-tight">
                Academic Resource Allocations
              </h1>
            </div>
            <p className="text-sm text-[#555555] mt-1">
              Monitor active, pending, and completed academic resource allocations across institution facilities
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
              <div className="flex items-center gap-1 bg-[#F8F6F0] p-1 rounded-xl border border-[#E8E0D0]">
                {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING'].map((st) => (
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

              {/* Date Filter */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-white border border-[#D9D2C3] rounded-lg px-2.5 py-1">
                  <Calendar className="w-3.5 h-3.5 text-[#77736A]" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent text-[#202020] text-xs focus:outline-none"
                    placeholder="Filter by date"
                  />
                </div>
                {dateFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateFilter('')}
                    className="text-xs h-7 px-2"
                  >
                    Clear Date
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allocations Table */}
        <Card className="border border-[#D8C9A8] shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading && allocations.length === 0 ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : allocations.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-[#B8A16A] mb-3" />
                <h3 className="text-base font-serif font-bold text-[#202020]">
                  No Allocations Found
                </h3>
                <p className="text-xs text-[#555555] mt-1 max-w-sm mx-auto">
                  There are currently no resource allocations matching your filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#F8F6F0] border-b border-[#E8E0D0] text-[#555555] font-semibold">
                      <th className="py-3 px-4">Allocation ID</th>
                      <th className="py-3 px-4">Resource</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Allocated To</th>
                      <th className="py-3 px-4">Purpose</th>
                      <th className="py-3 px-4">Time Window</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D0]">
                    {allocations.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#F4F0E6] transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-[#202020]">
                          #{item.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#202020]">
                            {item.resourceName || 'Resource'}
                          </div>
                          {item.resourceCode && (
                            <span className="text-[10px] font-mono text-[#77736A] font-medium">
                              {item.resourceCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#202020]">
                            {item.departmentName}
                          </div>
                          {item.departmentCode && (
                            <span className="text-[10px] font-mono text-[#77736A] font-medium uppercase">
                              {item.departmentCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#202020]">
                            {item.allocatedToName}
                          </div>
                          <div className="text-[11px] text-[#77736A] font-medium">{item.allocatedToEmail}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[#555555]">
                          {item.purpose}
                        </td>
                        <td className="py-3 px-4 text-[#555555] whitespace-nowrap">
                          <div>{new Date(item.startDatetime).toLocaleDateString()}</div>
                          <div className="text-[11px] text-[#77736A] font-medium">
                            {new Date(item.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {new Date(item.endDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-2.5"
                            onClick={() => handleViewDetail(item.id)}
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
                  <span className="font-semibold text-[#202020]">{totalPages}</span> ({totalElements} total allocations)
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

        {/* Detail Modal */}
        {showDetailModal && selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202020]/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border border-[#D8C9A8] max-w-xl w-full p-6 shadow-xl space-y-5">
              <div className="flex items-start justify-between border-b border-[#E8E0D0] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#F8F6F0] text-[#555555] border border-[#E8E0D0]">
                      Allocation #{selectedDetail.id}
                    </span>
                    {getStatusBadge(selectedDetail.status)}
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#202020] mt-1.5">
                    {selectedDetail.resourceName}
                  </h3>
                  {selectedDetail.resourceCode && (
                    <span className="text-xs font-mono text-[#77736A]">
                      Code: {selectedDetail.resourceCode} • Category: {selectedDetail.resourceCategory || 'General'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-[#77736A] hover:text-[#202020] hover:bg-[#F4F0E6] p-1 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0]">
                  <span className="text-[#77736A]">Department</span>
                  <div className="font-bold text-[#202020] mt-0.5">
                    {selectedDetail.departmentName}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0]">
                  <span className="text-[#77736A]">Allocated To</span>
                  <div className="font-bold text-[#202020] mt-0.5">
                    {selectedDetail.allocatedToName}
                  </div>
                  <div className="text-[11px] text-[#77736A]">{selectedDetail.allocatedToEmail}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0]">
                  <span className="text-[#77736A]">Capacity & Location</span>
                  <div className="font-bold text-[#202020] mt-0.5">
                    Capacity: {selectedDetail.resourceCapacity || 'N/A'}
                  </div>
                  <div className="text-[11px] text-[#77736A]">
                    {selectedDetail.resourceLocation || 'Location not specified'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0]">
                  <span className="text-[#77736A]">Academic Context</span>
                  <div className="font-bold text-[#202020] mt-0.5">
                    {selectedDetail.academicYearName || 'Current Year'}
                  </div>
                  <div className="text-[11px] text-[#77736A]">
                    {selectedDetail.semesterName || 'Regular Semester'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0] text-xs">
                <span className="text-[#77736A] font-medium">Scheduled Time Window</span>
                <div className="font-bold text-[#202020] mt-1">
                  {new Date(selectedDetail.startDatetime).toLocaleString()} — {new Date(selectedDetail.endDatetime).toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F6F0] border border-[#E8E0D0] text-xs">
                <span className="text-[#77736A] font-medium">Purpose</span>
                <p className="text-[#202020] mt-1 whitespace-pre-wrap">
                  {selectedDetail.purpose}
                </p>
                {selectedDetail.allocatedByName && (
                  <div className="text-[11px] text-[#77736A] mt-2">
                    Allocated by: <span className="text-[#202020] font-medium">{selectedDetail.allocatedByName}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
