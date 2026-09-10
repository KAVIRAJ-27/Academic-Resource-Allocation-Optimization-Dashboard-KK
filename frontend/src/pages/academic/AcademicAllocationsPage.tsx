import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PageContainer,
  PageHeader,
  ContentSection,
  DashboardGrid,
} from '../../components/layout';
import {
  StatCard,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  EmptyState,
} from '../../components/ui';
import {
  Layers,
  Search,
  RefreshCw,
  Plus,
  Eye,
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  DoorOpen,
  User,
  Clock,
  CheckCircle,
  XCircle,
  FlaskConical,
  GraduationCap,
} from 'lucide-react';
import { useAcademicAllocations } from '../../hooks/useAcademicAllocations';
import { useAcademicAllocationMutations } from '../../hooks/useAcademicAllocationMutations';
import { AllocationStatus, AcademicAllocationSummaryDto } from '../../types/academicAllocation';
import { AcademicAllocationModal } from './AcademicAllocationModal';

export const AcademicAllocationsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    allocations,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch,
  } = useAcademicAllocations({ size: 10 });

  const { cancel, submitting: cancelSubmitting } = useAcademicAllocationMutations();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelModalId, setCancelModalId] = useState<number | null>(null);
  const [cancelRemarks, setCancelRemarks] = useState('');

  // Status metrics
  const stats = useMemo(() => {
    const active = allocations.filter((a) => a.status === 'ACTIVE').length;
    const completed = allocations.filter((a) => a.status === 'COMPLETED').length;
    const classrooms = allocations.filter((a) =>
      a.categoryName?.toLowerCase().includes('class')
    ).length;
    const labs = allocations.filter((a) =>
      a.categoryName?.toLowerCase().includes('lab')
    ).length;
    return { active, completed, classrooms, labs };
  }, [allocations]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    if (status === 'ALL') {
      updateFilters({ status: undefined });
    } else {
      updateFilters({ status: status as AllocationStatus });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedDate(val);
    updateFilters({ date: val || undefined });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery.trim() || undefined });
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalId) return;
    try {
      await cancel(cancelModalId, cancelRemarks.trim() || undefined);
      setCancelModalId(null);
      setCancelRemarks('');
      refetch();
    } catch (err) {
      // hook captures error
    }
  };

  const getStatusBadge = (status: AllocationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
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
      <PageHeader
        title="Academic Resource Allocations"
        description="Authoritative engine allocating classrooms, labs and academic facilities with full concurrency & conflict protection"
        primaryAction={
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Allocate Resource
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <DashboardGrid cols={4}>
        <StatCard
          title="Total Ledger Records"
          value={totalElements}
          description="All academic allocations"
          icon={Layers}
          iconColor="blue"
        />
        <StatCard
          title="Active Allocations"
          value={stats.active}
          description="Currently locked & in-use"
          icon={CheckCircle}
          iconColor="emerald"
        />
        <StatCard
          title="Classroom Bookings"
          value={stats.classrooms}
          description="Lectures & seminar halls"
          icon={GraduationCap}
          iconColor="purple"
        />
        <StatCard
          title="Laboratory Bookings"
          value={stats.labs}
          description="Hardware & computer labs"
          icon={FlaskConical}
          iconColor="teal"
        />
      </DashboardGrid>

      {/* Filter and Control Bar */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 overflow-x-auto">
              {['ALL', 'ACTIVE', 'PENDING', 'COMPLETED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedStatus === st
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Date and Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code, room, user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-60"
                />
              </form>

              {(searchQuery || selectedStatus !== 'ALL' || selectedDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('ALL');
                    setSelectedDate('');
                    resetFilters();
                  }}
                  className="text-slate-400 hover:text-white text-xs h-8"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Allocations Table */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <CardHeader className="border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Active & Historical Allocations</CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Showing {allocations.length} of {totalElements} allocations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              Loading allocations...
            </div>
          ) : allocations.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={DoorOpen}
                title="No Academic Allocations Found"
                description="No matching academic resource allocations found for the active filter parameters."
                actionLabel="Create First Allocation"
                onAction={() => setIsModalOpen(true)}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Resource</th>
                    <th className="py-3.5 px-4">Time Window</th>
                    <th className="py-3.5 px-4">Requester & Dept</th>
                    <th className="py-3.5 px-4">Purpose</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {allocations.map((item: AcademicAllocationSummaryDto) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/40 transition-colors group text-slate-300"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {item.resourceName}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Badge variant="gray" className="text-[10px] py-0">
                            {item.resourceCode}
                          </Badge>
                          <span>• {item.capacity || 0} seats</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-white font-medium">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          <span>{item.allocationDate}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">
                          {item.allocatedToUserName || 'Unknown'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {item.departmentName || 'General'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="truncate block max-w-xs text-slate-300" title={item.purpose}>
                          {item.purpose || 'Academic usage'}
                        </span>
                        {item.requestId && (
                          <span className="text-[10px] text-slate-500">Request #{item.requestId}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/academic/allocations/${item.id}`)}
                          className="h-8 px-2.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Details
                        </Button>
                        {item.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancelModalId(item.id)}
                            className="h-8 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="h-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  className="h-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Allocation Creation Modal */}
      <AcademicAllocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Cancel Confirmation Modal */}
      {cancelModalId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Cancel Academic Allocation</h3>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to cancel allocation #{cancelModalId}? This frees up the resource
              slot while preserving the historical audit log.
            </p>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Cancellation Reason:
              </label>
              <textarea
                rows={2}
                placeholder="Enter cancellation reason..."
                value={cancelRemarks}
                onChange={(e) => setCancelRemarks(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCancelModalId(null)}
                disabled={cancelSubmitting}
              >
                Go Back
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmCancel}
                disabled={cancelSubmitting}
                className="bg-rose-600 hover:bg-rose-500 text-white"
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
