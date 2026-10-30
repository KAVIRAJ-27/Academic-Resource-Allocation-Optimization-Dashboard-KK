import React, { useState } from 'react';
import { PageContainer } from '../../components/layout';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { useHodAllocations } from '../../hooks/useHodAllocations';
import {
  HodAllocationSummaryCards,
  HodAllocationTable,
  HodAllocationDetailModal,
} from '../../components/hod/allocations';
import { CalendarRange, RefreshCw } from 'lucide-react';

export const HODAllocationsPage: React.FC = () => {
  const { error: toastError } = useToast();
  const {
    allocations,
    kpi,
    loading,
    kpiLoading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    statusFilter,
    fromDate,
    toDate,
    selectedAllocation,
    detailLoading,
    setStatusFilter,
    setFromDate,
    setToDate,
    setPage,
    refresh,
    viewAllocationDetail,
    closeAllocationDetail,
  } = useHodAllocations(10);

  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleOpenDetail = async (id: number) => {
    setIsDetailOpen(true);
    try {
      await viewAllocationDetail(id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load allocation details';
      toastError(message);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    closeAllocationDetail();
  };

  return (
    <PageContainer>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Department Resource Allocations
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Monitor active, upcoming, and historical resource assignments for your department
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
        <HodAllocationSummaryCards kpi={kpi} loading={kpiLoading} />

        {/* Allocation Table */}
        <HodAllocationTable
          allocations={allocations}
          loading={loading}
          page={page}
          size={size}
          totalElements={totalElements}
          totalPages={totalPages}
          statusFilter={statusFilter}
          fromDate={fromDate}
          toDate={toDate}
          onStatusFilterChange={setStatusFilter}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          onPageChange={setPage}
          onRefresh={refresh}
          onViewDetails={handleOpenDetail}
        />

        {/* Detail Modal */}
        <HodAllocationDetailModal
          isOpen={isDetailOpen}
          onClose={handleCloseDetail}
          allocation={selectedAllocation}
          loading={detailLoading}
        />
      </div>
    </PageContainer>
  );
};
export default HODAllocationsPage;
