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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Academic Resource Allocations
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">{error}</div>
            <Button variant="ghost" size="sm" onClick={refresh}>
              Retry
            </Button>
          </div>
        )}

        {/* Filters */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'PENDING'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      statusFilter === st
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent text-slate-700 dark:text-slate-200 text-xs focus:outline-none"
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
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {loading && allocations.length === 0 ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : allocations.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  No Allocations Found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  There are currently no resource allocations matching your filter criteria.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {allocations.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                          #{item.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.resourceName || 'Resource'}
                          </div>
                          {item.resourceCode && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.resourceCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.departmentName}
                          </div>
                          {item.departmentCode && (
                            <span className="text-[10px] font-mono text-slate-400 uppercase">
                              {item.departmentCode}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.allocatedToName}
                          </div>
                          <div className="text-[11px] text-slate-400">{item.allocatedToEmail}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-700 dark:text-slate-300">
                          {item.purpose}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          <div>{new Date(item.startDatetime).toLocaleDateString()}</div>
                          <div className="text-[11px] text-slate-400">
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
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div>
                  Showing page <span className="font-semibold text-slate-900 dark:text-white">{page + 1}</span> of{' '}
                  <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span> ({totalElements} total allocations)
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xl w-full p-6 shadow-xl space-y-5">
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Allocation #{selectedDetail.id}
                    </span>
                    {getStatusBadge(selectedDetail.status)}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                    {selectedDetail.resourceName}
                  </h3>
                  {selectedDetail.resourceCode && (
                    <span className="text-xs font-mono text-slate-400">
                      Code: {selectedDetail.resourceCode} • Category: {selectedDetail.resourceCategory || 'General'}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400">Department</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {selectedDetail.departmentName}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400">Allocated To</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {selectedDetail.allocatedToName}
                  </div>
                  <div className="text-[11px] text-slate-400">{selectedDetail.allocatedToEmail}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400">Capacity & Location</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    Capacity: {selectedDetail.resourceCapacity || 'N/A'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedDetail.resourceLocation || 'Location not specified'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400">Academic Context</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {selectedDetail.academicYearName || 'Current Year'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedDetail.semesterName || 'Regular Semester'}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <span className="text-slate-400 font-medium">Scheduled Time Window</span>
                <div className="font-semibold text-slate-900 dark:text-white mt-1">
                  {new Date(selectedDetail.startDatetime).toLocaleString()} — {new Date(selectedDetail.endDatetime).toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                <span className="text-slate-400 font-medium">Purpose</span>
                <p className="text-slate-800 dark:text-slate-200 mt-1 whitespace-pre-wrap">
                  {selectedDetail.purpose}
                </p>
                {selectedDetail.allocatedByName && (
                  <div className="text-[11px] text-slate-400 mt-2">
                    Allocated by: <span className="text-slate-600 dark:text-slate-300 font-medium">{selectedDetail.allocatedByName}</span>
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
