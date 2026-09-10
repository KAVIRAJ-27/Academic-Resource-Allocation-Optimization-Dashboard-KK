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
import { useStudentHostelComplaints } from '../../hooks/useStudentHostelComplaints';
import { HostelNavTabs } from '../../components/student/hostel/HostelNavTabs';
import { HostelComplaintSummaryCards } from '../../components/student/hostel/complaints/HostelComplaintSummaryCards';
import { HostelComplaintFilters } from '../../components/student/hostel/complaints/HostelComplaintFilters';
import { HostelComplaintList } from '../../components/student/hostel/complaints/HostelComplaintList';
import { CreateHostelComplaintModal } from '../../components/student/hostel/complaints/CreateHostelComplaintModal';
import { HostelComplaintDetailsModal } from '../../components/student/hostel/complaints/HostelComplaintDetailsModal';
import { HostelComplaintSkeleton } from '../../components/student/hostel/complaints/HostelComplaintSkeleton';
import { HostelComplaintEmptyState } from '../../components/student/hostel/complaints/HostelComplaintEmptyState';
import { StudentHostelComplaint } from '../../types/studentHostelComplaint';

export const StudentHostelComplaintsPage: React.FC = () => {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const {
    complaints,
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
    categoryFilter,
    setCategoryFilter,
    searchTerm,
    setSearchTerm,

    // Details Modal
    selectedComplaint,
    detailsLoading,
    fetchComplaintDetails,
    clearSelectedComplaint,

    // Mutations
    submitCreateComplaint,
  } = useStudentHostelComplaints();

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' || statusFilter !== 'ALL' || categoryFilter !== 'ALL';

  return (
    <PageContainer>
      <PageHeader
        title="Hostel Complaints & Maintenance"
        description="Lodge and monitor residential maintenance issues, electrical repairs, sanitation, and room grievances."
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
              Report Issue
            </Button>
          </div>
        }
      />

      {/* Sub-navigation tabs */}
      <HostelNavTabs openComplaintsCount={summaryCounts.open} />

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
        <HostelComplaintSummaryCards
          counts={summaryCounts}
          loading={summaryLoading}
          activeStatus={statusFilter}
          onSelectStatus={(s) => setStatusFilter(s)}
        />

        {/* 2. Filters Bar */}
        <HostelComplaintFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          onReset={handleResetFilters}
        />

        {/* 3. Complaints Content */}
        {loading && complaints.length === 0 ? (
          <HostelComplaintSkeleton />
        ) : complaints.length === 0 ? (
          <HostelComplaintEmptyState
            isFiltered={hasActiveFilters}
            onResetFilters={handleResetFilters}
            onCreateNew={() => setIsCreateOpen(true)}
          />
        ) : (
          <HostelComplaintList
            complaints={complaints}
            totalElements={totalElements}
            totalPages={totalPages}
            page={page}
            size={size}
            onPageChange={setPage}
            onViewDetails={(c: StudentHostelComplaint) => fetchComplaintDetails(c.id)}
          />
        )}
      </div>

      {/* Create Modal */}
      <CreateHostelComplaintModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={submitCreateComplaint}
      />

      {/* Details Modal */}
      <HostelComplaintDetailsModal
        isOpen={!!selectedComplaint || detailsLoading}
        onClose={clearSelectedComplaint}
        complaint={selectedComplaint}
        loading={detailsLoading}
      />
    </PageContainer>
  );
};
