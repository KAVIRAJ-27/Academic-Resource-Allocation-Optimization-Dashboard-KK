import React, { useState } from 'react';
import { PageContainer } from '../../components/layout';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useHodResourceRequests } from '../../hooks/useHodResourceRequests';
import {
  HodRequestSummaryCards,
  HodRequestTable,
  HodRequestDetailModal,
  HodApproveRequestModal,
  HodRejectRequestModal,
} from '../../components/hod/requests';
import { HodResourceRequestSummary, HodResourceRequestDetail } from '../../types/hod';
import { FileText, RefreshCw } from 'lucide-react';

export const HODResourceRequestsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const {
    requests,
    kpi,
    loading,
    kpiLoading,
    actionLoading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    statusFilter,
    priorityFilter,
    fromDate,
    toDate,
    selectedRequest,
    detailLoading,
    setSearch,
    setStatusFilter,
    setPriorityFilter,
    setFromDate,
    setToDate,
    setPage,
    refresh,
    viewRequestDetail,
    closeRequestDetail,
    approveRequest,
    rejectRequest,
  } = useHodResourceRequests(10);

  const [approvingRequest, setApprovingRequest] = useState<HodResourceRequestSummary | HodResourceRequestDetail | null>(null);
  const [rejectingRequest, setRejectingRequest] = useState<HodResourceRequestSummary | HodResourceRequestDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetail = async (id: number) => {
    setIsDetailOpen(true);
    try {
      await viewRequestDetail(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load request details';
      toastError(message);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    closeRequestDetail();
  };

  const handleApproveConfirm = async (remarks?: string) => {
    if (!approvingRequest) return;
    try {
      await approveRequest(approvingRequest.id, remarks);
      success(`Request #${approvingRequest.id} approved successfully`);
      setApprovingRequest(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to approve request';
      toastError(message);
      throw err;
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingRequest) return;
    try {
      await rejectRequest(rejectingRequest.id, reason);
      success(`Request #${rejectingRequest.id} declined`);
      setRejectingRequest(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to decline request';
      toastError(message);
      throw err;
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Academic Resource Requests
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Review, filter, and authorize department academic resource booking requests
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={loading || kpiLoading}
              className="border-gray-700 hover:bg-gray-800 rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* KPI Summary Cards */}
        <HodRequestSummaryCards kpi={kpi} loading={kpiLoading} />

        {/* Request Table */}
        <HodRequestTable
          requests={requests}
          loading={loading}
          page={page}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          search={search}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          fromDate={fromDate}
          toDate={toDate}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onPriorityFilterChange={setPriorityFilter}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onPageChange={setPage}
          onRefresh={refresh}
          onViewDetails={handleOpenDetail}
          onApprove={(req) => setApprovingRequest(req)}
          onReject={(req) => setRejectingRequest(req)}
        />

        {/* Detail Modal */}
        <HodRequestDetailModal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          request={selectedRequest}
          loading={detailLoading}
          onApprove={() => {
            if (selectedRequest) {
              setApprovingRequest(selectedRequest);
            }
          }}
          onReject={() => {
            if (selectedRequest) {
              setRejectingRequest(selectedRequest);
            }
          }}
        />

        {/* Approve Confirmation Modal */}
        <HodApproveRequestModal
          isOpen={!!approvingRequest}
          onClose={() => setApprovingRequest(null)}
          request={approvingRequest}
          loading={actionLoading}
          onConfirm={handleApproveConfirm}
        />

        {/* Reject Confirmation Modal */}
        <HodRejectRequestModal
          isOpen={!!rejectingRequest}
          onClose={() => setRejectingRequest(null)}
          request={rejectingRequest}
          loading={actionLoading}
          onConfirm={handleRejectConfirm}
        />
      </div>
    </PageContainer>
  );
};
export default HODResourceRequestsPage;
