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
  CardContent,
  EmptyState,
  getStatusBadgeVariant,
} from '../../components/ui';
import {
  BedDouble,
  Search,
  RefreshCw,
  Plus,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useHostelAllocations } from '../../hooks/useHostelAllocations';
import { AllocationStatus } from '../../types/hostelAllocation';
import { HostelAllocationModal } from './HostelAllocationModal';

export const HostelAllocationsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    allocations,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    updateFilters,
    resetFilters,
    refetch,
    releaseAllocation,
  } = useHostelAllocations({ size: 10 });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [releaseModalId, setReleaseModalId] = useState<number | null>(null);
  const [releasing, setReleasing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Aggregated quick stats
  const stats = useMemo(() => {
    const active = allocations.filter((a) => a.status === 'ACTIVE').length;
    const completed = allocations.filter((a) => a.status === 'COMPLETED').length;
    const autoAllocated = allocations.filter((a) => a.allocationMethod === 'AUTO').length;
    const manualAllocated = allocations.filter((a) => a.allocationMethod === 'MANUAL').length;
    return { active, completed, autoAllocated, manualAllocated };
  }, [allocations]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    if (status === 'ALL') {
      updateFilters({ status: undefined });
    } else {
      updateFilters({ status: status as AllocationStatus });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery.trim() || undefined });
  };

  const handleRelease = async () => {
    if (!releaseModalId) return;
    try {
      setReleasing(true);
      setActionError(null);
      await releaseAllocation(releaseModalId);
      setReleaseModalId(null);
    } catch (err: any) {
      setActionError(err.message || 'Failed to release bed');
    } finally {
      setReleasing(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Hostel Resource Allocations"
        description="Operational bed allocation engine with deterministic scoring, capacity safeguards and complete lifecycle tracking."
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Hostel', href: '/hostel' },
          { label: 'Resource Allocations' },
        ]}
        primaryAction={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Allocate Bed
          </Button>
        }
        secondaryAction={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      {/* Metrics Row */}
      <ContentSection>
        <DashboardGrid cols={4}>
          <StatCard
            title="Total Allocations"
            value={totalElements}
            description="Across authorized hostels"
            icon={Layers}
            iconColor="teal"
          />
          <StatCard
            title="Active Residents"
            value={stats.active}
            description="Currently occupying beds"
            icon={BedDouble}
            iconColor="emerald"
          />
          <StatCard
            title="Released / Vacated"
            value={stats.completed}
            description="Historical records"
            icon={CheckCircle}
            iconColor="blue"
          />
          <StatCard
            title="Auto-Allocations"
            value={stats.autoAllocated}
            description={`${stats.manualAllocated} manual allocations`}
            icon={Sparkles}
            iconColor="purple"
          />
        </DashboardGrid>
      </ContentSection>

      {/* Filter and Search Bar */}
      <ContentSection>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status Tabs */}
              <div className="flex bg-[#0B0D14] p-1 rounded-lg border border-slate-200 w-fit">
                {['ALL', 'ACTIVE', 'COMPLETED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                      selectedStatus === status
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by student name, roll no, bed or room..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-[#0B0D14] text-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition"
                  />
                </div>
                <Button type="submit" size="sm" variant="secondary">
                  Search
                </Button>
                {(searchQuery || selectedStatus !== 'ALL') && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedStatus('ALL');
                      resetFilters();
                    }}
                  >
                    Reset
                  </Button>
                )}
              </form>
            </div>
          </CardContent>
        </Card>
      </ContentSection>

      {/* Allocations Table */}
      <ContentSection>
        <Card>
          <CardHeader className="pb-3 border-b border-slate-200">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Bed Allocations Ledger</span>
              <span className="text-xs font-normal text-gray-400">
                Showing {allocations.length} of {totalElements} allocations
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-teal-400" />
                <span className="text-sm">Loading allocations from database...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-rose-400 flex flex-col items-center gap-2">
                <AlertTriangle className="w-8 h-8" />
                <span className="text-sm font-semibold">{error}</span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Try Again
                </Button>
              </div>
            ) : allocations.length === 0 ? (
              <EmptyState
                icon={BedDouble}
                title="No Hostel Allocations Found"
                description="No student bed allocations match the selected criteria. Use the Allocate Bed button to allocate beds."
                actionLabel="Allocate Bed"
                onAction={() => setIsModalOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#0E1017] text-xs font-semibold text-slate-600 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Hostel & Room</th>
                      <th className="px-4 py-3">Bed</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {allocations.map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-white/[0.02] transition">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-white">
                            {alloc.studentName || 'Student #' + alloc.studentId}
                          </div>
                          <div className="text-xs text-slate-600 font-medium flex items-center gap-2">
                            <span className="font-mono text-teal-300">{alloc.rollNumber}</span>
                            {alloc.departmentName && <span>&bull; {alloc.departmentName}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">
                            {alloc.hostelName}
                          </div>
                          <div className="text-xs text-slate-600 font-medium">
                            {alloc.blockName} &bull; Floor {alloc.floorNumber} &bull; Room {alloc.roomNumber}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="teal" className="font-mono">
                            Bed {alloc.bedNumber}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {alloc.allocationMethod === 'AUTO' ? (
                            <Badge variant="teal" className="flex items-center gap-1 w-fit">
                              <Sparkles className="w-3 h-3" />
                              Auto
                            </Badge>
                          ) : (
                            <Badge variant="purple" className="flex items-center gap-1 w-fit">
                              <User className="w-3 h-3" />
                              Manual
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={getStatusBadgeVariant(alloc.status)}>
                            {alloc.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600 font-medium">
                          <div>From: {alloc.startDate}</div>
                          {alloc.endDate && <div>To: {alloc.endDate}</div>}
                          {alloc.releasedAt && (
                            <div className="text-amber-400">
                              Released: {new Date(alloc.releasedAt).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/hostel/resource-allocations/${alloc.id}`)}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {alloc.status === 'ACTIVE' && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => setReleaseModalId(alloc.id)}
                                className="text-xs px-2 py-1"
                              >
                                Release
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                <span className="text-xs text-gray-400">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </ContentSection>

      {/* Release Confirmation Dialog */}
      {releaseModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h4 className="text-base font-bold text-slate-900">Confirm Bed Release</h4>
            </div>
            <p className="text-sm text-gray-300">
              Are you sure you want to release this bed allocation? The allocation status will be marked
              as COMPLETED and the bed will immediately return to AVAILABLE status for new allocations.
            </p>
            {actionError && (
              <div className="p-3 rounded-lg bg-rose-500/10 text-rose-400 text-xs">
                {actionError}
              </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReleaseModalId(null)}
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
                {releasing ? 'Releasing Bed...' : 'Confirm Release'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Allocation Engine Modal */}
      <HostelAllocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </PageContainer>
  );
};
