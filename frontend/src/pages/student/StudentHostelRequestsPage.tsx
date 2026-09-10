import React, { useState } from 'react';
import {
  PageContainer,
  PageHeader,
} from '../../components/layout';
import {
  Button,
  Badge,
  Alert,
} from '../../components/ui';
import {
  Plus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useStudentHostelRequests } from '../../hooks/useStudentHostelRequests';
import { HostelNavTabs } from '../../components/student/hostel/HostelNavTabs';
import { HostelRequestSummaryCards } from '../../components/student/hostel/requests/HostelRequestSummaryCards';
import { HostelRequestFilters } from '../../components/student/hostel/requests/HostelRequestFilters';
import { HostelRequestList } from '../../components/student/hostel/requests/HostelRequestList';
import { CreateHostelRequestModal } from '../../components/student/hostel/requests/CreateHostelRequestModal';
import { HostelRequestDetailsModal } from '../../components/student/hostel/requests/HostelRequestDetailsModal';
import { HostelRequestSkeleton } from '../../components/student/hostel/requests/HostelRequestSkeleton';
import { HostelRequestEmptyState } from '../../components/student/hostel/requests/HostelRequestEmptyState';
import { StudentHostelRequest } from '../../types/studentHostelRequest';

export const StudentHostelRequestsPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const {
    requests,
    page,
    setPage,
    size,
    totalElements,
    totalPages,
    loading,
    error,
    refresh,

    summaryCounts,
    summaryLoading,

    // Filters
    statusFilter,
    setStatusFilter,
    requestTypeFilter,
    setRequestTypeFilter,
    searchTerm,
    setSearchTerm,

    // Details Modal
    selectedRequest,
    detailsLoading,
    fetchRequestDetails,
    clearSelectedRequest,

    // Mutations
    submitCreateRequest,
    submitCancelRequest,
  } = useStudentHostelRequests();

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setRequestTypeFilter('ALL');
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' || statusFilter !== 'ALL' || requestTypeFilter !== 'ALL';

  return (
    <PageContainer>
      <PageHeader
        title="Hostel Allocation Requests"
        description="Submit room change, maintenance, and special residential accommodation requests."
        badge={<Badge variant="teal" dot>HOSTEL DESK</Badge>}
        primaryAction={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={refresh}
              isLoading={loading}
              className="border-[#222838] text-gray-300"
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(true)}
              className="bg-teal-500 hover:bg-teal-400 text-black font-semibold"
            >
              New Request
            </Button>
          </div>
        }
      />

      {/* Sub-navigation tabs */}
      <HostelNavTabs pendingRequestsCount={summaryCounts.pending} />

      {error && !loading && (
        <Alert variant="error" className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={refresh}
              className="text-xs text-rose-300 underline p-0 h-auto"
            >
              Retry
            </Button>
          </div>
        </Alert>
      )}

      <div className="space-y-4">
        {/* 1. Summary Cards */}
        <HostelRequestSummaryCards
          counts={summaryCounts}
          loading={summaryLoading}
          activeStatus={statusFilter}
          onSelectStatus={(s) => setStatusFilter(s)}
        />

        {/* 2. Filters Bar */}
        <HostelRequestFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          requestTypeFilter={requestTypeFilter}
          onRequestTypeChange={setRequestTypeFilter}
          onReset={handleResetFilters}
        />

        {/* 3. Requests Content */}
        {loading && requests.length === 0 ? (
          <HostelRequestSkeleton />
        ) : requests.length === 0 ? (
          <HostelRequestEmptyState
            isFiltered={hasActiveFilters}
            onResetFilters={handleResetFilters}
            onCreateNew={() => setIsCreateOpen(true)}
          />
        ) : (
          <HostelRequestList
            requests={requests}
            totalElements={totalElements}
            totalPages={totalPages}
            page={page}
            size={size}
            onPageChange={setPage}
            onViewDetails={(req: StudentHostelRequest) => fetchRequestDetails(req.id)}
            onCancelRequest={(id: number) => fetchRequestDetails(id)}
          />
        )}
      </div>

      {/* Create Modal */}
      <CreateHostelRequestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={submitCreateRequest}
      />

      {/* Details & Cancel Modal */}
      <HostelRequestDetailsModal
        isOpen={!!selectedRequest || detailsLoading}
        onClose={clearSelectedRequest}
        request={selectedRequest}
        loading={detailsLoading}
        onCancelRequest={submitCancelRequest}
      />
    </PageContainer>
  );
};
