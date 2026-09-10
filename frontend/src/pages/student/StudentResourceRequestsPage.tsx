import React, { useState } from 'react';
import {
  PageContainer,
  PageHeader,
} from '../../components/layout';
import {
  Button,
  Badge,
} from '../../components/ui';
import {
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useStudentResourceRequests } from '../../hooks/useStudentResourceRequests';
import { StudentRequestSummaryCards } from '../../components/student/requests/StudentRequestSummaryCards';
import { StudentRequestFilters } from '../../components/student/requests/StudentRequestFilters';
import { StudentRequestList } from '../../components/student/requests/StudentRequestList';
import { CreateStudentRequestModal } from '../../components/student/requests/CreateStudentRequestModal';
import { StudentRequestDetailsModal } from '../../components/student/requests/StudentRequestDetailsModal';
import { StudentRequestSkeleton } from '../../components/student/requests/StudentRequestSkeleton';
import { StudentRequestEmptyState } from '../../components/student/requests/StudentRequestEmptyState';
import { StudentResourceRequest } from '../../types/studentResourceRequest';

export const StudentResourceRequestsPage: React.FC = () => {
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

    // Summary counts
    summaryCounts,
    summaryLoading,

    // Resources
    availableResources,
    resourcesLoading,

    // Filters
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    searchTerm,
    setSearchTerm,

    // Details Modal
    selectedRequest,
    detailsLoading,
    detailsError,
    fetchRequestDetails,
    clearSelectedRequest,

    // Mutations
    submitCreateRequest,
    submitCancelRequest,
  } = useStudentResourceRequests();

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setDateFilter('');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'ALL' || dateFilter !== '';

  return (
    <PageContainer>
      <PageHeader
        title="Student Academic Resource Requests"
        description="Submit and track academic resource requisitions for laboratories, lecture halls, and specialized equipment."
        badge={<Badge variant="teal" dot>RESOURCE REQUESTS</Badge>}
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

      <div className="space-y-4 pt-2">
        {/* 1. Summary Cards */}
        <StudentRequestSummaryCards
          counts={summaryCounts}
          loading={summaryLoading}
          activeStatus={statusFilter}
          onSelectStatus={(s) => setStatusFilter(s)}
        />

        {/* 2. Filters & Search */}
        <StudentRequestFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          dateFilter={dateFilter}
          onDateChange={setDateFilter}
          onClearFilters={handleClearFilters}
          onRefresh={refresh}
          loading={loading}
        />

        {/* 3. Content: Skeleton, Empty, or Table */}
        {loading && requests.length === 0 ? (
          <StudentRequestSkeleton />
        ) : requests.length === 0 ? (
          <StudentRequestEmptyState
            isFiltered={hasActiveFilters}
            onClearFilters={handleClearFilters}
            onCreateNew={() => setIsCreateOpen(true)}
            onRefresh={refresh}
          />
        ) : (
          <StudentRequestList
            requests={requests}
            totalElements={totalElements}
            totalPages={totalPages}
            page={page}
            size={size}
            onPageChange={setPage}
            onViewDetails={(req: StudentResourceRequest) => fetchRequestDetails(req.id)}
            onCancelRequest={(req: StudentResourceRequest) => fetchRequestDetails(req.id)}
          />
        )}
      </div>

      {/* Create Request Modal */}
      <CreateStudentRequestModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        resources={availableResources}
        resourcesLoading={resourcesLoading}
        onSubmit={submitCreateRequest}
      />

      {/* Details & Cancel Modal */}
      <StudentRequestDetailsModal
        isOpen={!!selectedRequest || detailsLoading}
        onClose={clearSelectedRequest}
        request={selectedRequest}
        loading={detailsLoading}
        error={detailsError}
        onCancelRequest={submitCancelRequest}
      />
    </PageContainer>
  );
};
