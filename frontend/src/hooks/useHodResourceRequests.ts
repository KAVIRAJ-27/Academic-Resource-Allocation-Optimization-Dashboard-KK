import { useState, useEffect, useCallback, useRef } from 'react';
import {
  hodApi,
  ResourceRequestQueryParams,
} from '../services/api/hodApi';
import {
  HodResourceRequestSummary,
  HodResourceRequestDetail,
  HodResourceRequestOverviewKpi,
  HodApprovalActionRequest,
} from '../types/hod';

export interface UseHodResourceRequestsReturn {
  requests: HodResourceRequestSummary[];
  kpi: HodResourceRequestOverviewKpi | null;
  loading: boolean;
  kpiLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  priorityFilter: string;
  fromDate: string;
  toDate: string;
  selectedRequest: HodResourceRequestDetail | null;
  detailLoading: boolean;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  setFromDate: (date: string) => void;
  setToDate: (date: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  viewRequestDetail: (id: number) => Promise<void>;
  closeRequestDetail: () => void;
  approveRequest: (id: number, remarks?: string) => Promise<HodResourceRequestDetail>;
  rejectRequest: (id: number, reason: string) => Promise<HodResourceRequestDetail>;
}

export const useHodResourceRequests = (initialPageSize = 10): UseHodResourceRequestsReturn => {
  const [requests, setRequests] = useState<HodResourceRequestSummary[]>([]);
  const [kpi, setKpi] = useState<HodResourceRequestOverviewKpi | null>(null);
  const [loading, setLoading] = useState(false);
  const [kpiLoading, setKpiLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPageState] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearchState] = useState('');
  const [statusFilter, setStatusFilterState] = useState('ALL');
  const [priorityFilter, setPriorityFilterState] = useState('ALL');
  const [fromDate, setFromDateState] = useState('');
  const [toDate, setToDateState] = useState('');

  const [selectedRequest, setSelectedRequest] = useState<HodResourceRequestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchKpi = useCallback(async () => {
    setKpiLoading(true);
    try {
      const response = await hodApi.getResourceRequestSummary();
      if (response.success && response.data) {
        setKpi(response.data);
      }
    } catch (err: unknown) {
      console.error('Failed to load request KPIs:', err);
    } finally {
      setKpiLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(
    async (
      currentPage: number,
      currentSearch: string,
      currentStatus: string,
      currentPriority: string,
      currentFromDate: string,
      currentToDate: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const params: ResourceRequestQueryParams = {
          page: currentPage,
          size,
          sort: 'id,desc',
        };

        if (currentSearch.trim()) {
          params.search = currentSearch.trim();
        }

        if (currentStatus && currentStatus !== 'ALL') {
          params.status = currentStatus;
        }

        if (currentPriority && currentPriority !== 'ALL') {
          params.priority = currentPriority;
        }

        if (currentFromDate) {
          params.fromDate = currentFromDate;
        }

        if (currentToDate) {
          params.toDate = currentToDate;
        }

        const response = await hodApi.getResourceRequests(params);
        if (response.success && response.data) {
          setRequests(response.data.content || []);
          setTotalElements(response.data.totalElements || 0);
          setTotalPages(response.data.totalPages || 0);
        } else {
          setRequests([]);
          setTotalElements(0);
          setTotalPages(0);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch resource requests';
        setError(message);
        setRequests([]);
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
      fetchRequests(page, search, statusFilter, priorityFilter, fromDate, toDate);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [fetchRequests, page, search, statusFilter, priorityFilter, fromDate, toDate]);

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
    setPageState(0);
  };

  const setStatusFilter = (status: string) => {
    setStatusFilterState(status);
    setPageState(0);
  };

  const setPriorityFilter = (priority: string) => {
    setPriorityFilterState(priority);
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
    fetchRequests(page, search, statusFilter, priorityFilter, fromDate, toDate);
  };

  const viewRequestDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const response = await hodApi.getResourceRequestById(id);
      if (response.success && response.data) {
        setSelectedRequest(response.data);
      }
    } catch (err: unknown) {
      console.error('Failed to load request detail:', err);
      throw err;
    } finally {
      setDetailLoading(false);
    }
  };

  const closeRequestDetail = () => {
    setSelectedRequest(null);
  };

  const approveRequest = async (id: number, remarks?: string): Promise<HodResourceRequestDetail> => {
    setActionLoading(true);
    try {
      const actionData: HodApprovalActionRequest = { comments: remarks };
      const response = await hodApi.approveResourceRequest(id, actionData);
      if (response.success && response.data) {
        // Refresh list and KPIs
        refresh();
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest(response.data);
        }
        return response.data;
      }
      throw new Error(response.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const rejectRequest = async (id: number, reason: string): Promise<HodResourceRequestDetail> => {
    setActionLoading(true);
    try {
      const actionData: HodApprovalActionRequest = { comments: reason };
      const response = await hodApi.rejectResourceRequest(id, actionData);
      if (response.success && response.data) {
        // Refresh list and KPIs
        refresh();
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest(response.data);
        }
        return response.data;
      }
      throw new Error(response.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  return {
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
  };
};
