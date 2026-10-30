import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer, PageHeader } from '../../components/layout';
import { Alert, Button, Pagination } from '../../components/ui';
import {
  FacultyRequestSummaryCards,
  FacultyRequestFilters,
  FacultyRequestTable,
  FacultyRequestCancelModal,
  FacultyRequestSkeleton,
} from '../../components/faculty/requests';
import { useFacultyResourceRequests } from '../../hooks/useFacultyResourceRequests';
import { FacultyResourceRequestItem } from '../../types/faculty';
import { Plus, RefreshCw } from 'lucide-react';

export const FacultyResourceRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    requests,
    summaryCounts,
    summaryLoading,
    loading,
    error,
    page,
    setPage,
    size,
    setSize,
    totalElements,
    totalPages,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    searchTerm,
    setSearchTerm,
    cancelRequest,
    cancellingId,
    cancelError,
    refetch,
  } = useFacultyResourceRequests();

  // Modal State
  const [selectedForCancel, setSelectedForCancel] = useState<FacultyResourceRequestItem | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const handleOpenCancelModal = (req: FacultyResourceRequestItem) => {
    setSelectedForCancel(req);
    setIsCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (cancellingId) return;
    setIsCancelModalOpen(false);
    setSelectedForCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!selectedForCancel) return;
    const success = await cancelRequest(selectedForCancel.id);
    if (success) {
      setIsCancelModalOpen(false);
      setSelectedForCancel(null);
      setActionSuccessMessage(`Resource request #${selectedForCancel.id} was successfully cancelled.`);
      setTimeout(() => setActionSuccessMessage(null), 5000);
    }
  };

  const hasFilters = Boolean(searchTerm.trim() || dateFilter || statusFilter !== 'ALL');

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setStatusFilter('ALL');
    setPage(0);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Academic Resource Requests"
        description="Submit, monitor, and manage requisition requests for lecture halls, laboratories, and teaching equipment"
        secondaryAction={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="border-slate-200 text-gray-300 hover:text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/faculty/resource-requests/new')}
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              New Request
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        {/* Success / Error Banners */}
        {actionSuccessMessage && (
          <Alert
            variant="success"
            title="Request Cancelled"
            onClose={() => setActionSuccessMessage(null)}
          >
            {actionSuccessMessage}
          </Alert>
        )}

        {cancelError && (
          <Alert variant="error" title="Cancellation Error">
            {cancelError}
          </Alert>
        )}

        {error && (
          <Alert variant="error" title="Failed to load requests">
            {error}
          </Alert>
        )}

        {/* 1. Summary Status Cards */}
        <FacultyRequestSummaryCards
          counts={summaryCounts}
          activeStatus={statusFilter}
          onSelectStatus={(status) => {
            setStatusFilter(status);
            setPage(0);
          }}
        />

        {/* 2. Filter Bar */}
        <FacultyRequestFilters
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setPage(0);
          }}
          dateFilter={dateFilter}
          onDateChange={(val) => {
            setDateFilter(val);
            setPage(0);
          }}
          onReset={handleResetFilters}
        />

        {/* 3. Requests Table or Loading Skeleton */}
        {loading && requests.length === 0 ? (
          <FacultyRequestSkeleton />
        ) : (
          <>
            <FacultyRequestTable
              requests={requests}
              onCancelClick={handleOpenCancelModal}
              hasFilters={hasFilters}
              onClearFilters={handleResetFilters}
            />

            {/* 4. Server-side Pagination */}
            {totalPages > 1 && (
              <div className="pt-2 flex items-center justify-between">
                <div className="text-xs text-gray-400">
                  Showing page {page + 1} of {totalPages} ({totalElements} total requests)
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <FacultyRequestCancelModal
        request={selectedForCancel}
        isOpen={isCancelModalOpen}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
        loading={Boolean(cancellingId)}
      />
    </PageContainer>
  );
};
