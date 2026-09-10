import { useState, useEffect, useCallback, useRef } from 'react';
import {
  hodApi,
  AllocationQueryParams,
} from '../services/api/hodApi';
import {
  HodResourceAllocationSummary,
  HodResourceAllocationDetail,
  HodResourceAllocationOverviewKpi,
} from '../types/hod';

export interface UseHodAllocationsReturn {
  allocations: HodResourceAllocationSummary[];
  kpi: HodResourceAllocationOverviewKpi | null;
  loading: boolean;
  kpiLoading: boolean;
  error: string | null;
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  statusFilter: string;
  resourceIdFilter: number | undefined;
  fromDate: string;
  toDate: string;
  selectedAllocation: HodResourceAllocationDetail | null;
  detailLoading: boolean;
  setStatusFilter: (status: string) => void;
  setResourceIdFilter: (id: number | undefined) => void;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  viewAllocationDetail: (id: number) => Promise<void>;
  closeAllocationDetail: () => void;
}

export const useHodAllocations = (initialPageSize = 10): UseHodAllocationsReturn => {
  const [allocations, setAllocations] = useState<HodResourceAllocationSummary[]>([]);
  const [kpi, setKpi] = useState<HodResourceAllocationOverviewKpi | null>(null);
  const [loading, setLoading] = useState(false);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPageState] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [statusFilter, setStatusFilterState] = useState('ALL');
  const [resourceIdFilter, setResourceIdFilterState] = useState<number | undefined>(undefined);
  const [fromDate, setFromDateState] = useState('');
  const [toDate, setToDateState] = useState('');

  const [selectedAllocation, setSelectedAllocation] = useState<HodResourceAllocationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchKpi = useCallback(async () => {
    setKpiLoading(true);
    try {
      const response = await hodApi.getAllocationSummary();
      if (response.success && response.data) {
        setKpi(response.data);
      }
    } catch (err: unknown) {
      console.error('Failed to load allocation KPIs:', err);
    } finally {
      setKpiLoading(false);
    }
  }, []);

  const fetchAllocations = useCallback(
    async (
      currentPage: number,
      currentStatus: string,
      currentResourceId: number | undefined,
      currentFromDate: string,
      currentToDate: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const params: AllocationQueryParams = {
          page: currentPage,
          size,
          sort: 'id,desc',
        };

        if (currentStatus && currentStatus !== 'ALL') {
          params.status = currentStatus;
        }

        if (currentResourceId) {
          params.resourceId = currentResourceId;
        }

        if (currentFromDate) {
          params.fromDate = currentFromDate;
        }

        if (currentToDate) {
          params.toDate = currentToDate;
        }

        const response = await hodApi.getAllocations(params);
        if (response.success && response.data) {
          setAllocations(response.data.content || []);
          setTotalElements(response.data.totalElements || 0);
          setTotalPages(response.data.totalPages || 0);
        } else {
          setAllocations([]);
          setTotalElements(0);
          setTotalPages(0);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch allocations';
        setError(message);
        setAllocations([]);
      } finally {
        setLoading(false);
      }
    },
    [size]
  );

  useEffect(() => {
    fetchKpi();
  }, [fetchKpi]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchAllocations(page, statusFilter, resourceIdFilter, fromDate, toDate);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchAllocations, page, statusFilter, resourceIdFilter, fromDate, toDate]);

  const setStatusFilter = (status: string) => {
    setStatusFilterState(status);
    setPageState(0);
  };

  const setResourceIdFilter = (id: number | undefined) => {
    setResourceIdFilterState(id);
    setPageState(0);
  };

  const setFromDate = (date: string) => {
    setFromDateState(date);
    setPageState(0);
  };

  const setToDate = (date: string) => {
    setToDateState(date);
    setPageState(0);
  };

  const setPage = (newPage: number) => {
    setPageState(newPage);
  };

  const refresh = () => {
    fetchKpi();
    fetchAllocations(page, statusFilter, resourceIdFilter, fromDate, toDate);
  };

  const viewAllocationDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const response = await hodApi.getAllocationById(id);
      if (response.success && response.data) {
        setSelectedAllocation(response.data);
      }
    } catch (err: unknown) {
      console.error('Failed to load allocation detail:', err);
      throw err;
    } finally {
      setDetailLoading(false);
    }
  };

  const closeAllocationDetail = () => {
    setSelectedAllocation(null);
  };

  return {
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
    resourceIdFilter,
    fromDate,
    toDate,
    selectedAllocation,
    detailLoading,
    setStatusFilter,
    setResourceIdFilter,
    setFromDate,
    setToDate,
    setPage,
    refresh,
    viewAllocationDetail,
    closeAllocationDetail,
  };
};
