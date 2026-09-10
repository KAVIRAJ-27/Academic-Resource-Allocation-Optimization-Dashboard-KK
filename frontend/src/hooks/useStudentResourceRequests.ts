import { useState, useEffect, useCallback } from 'react';
import {
  StudentResourceRequest,
  CreateResourceRequestPayload,
  StudentResourceSummary,
  StudentResourceRequestSummaryCounts,
  RequestStatus,
  ResourceRequestFilters,
} from '../types/studentResourceRequest';
import { studentResourceRequestApi } from '../services/api/studentResourceRequestApi';

export const useStudentResourceRequests = () => {
  // Request list & pagination
  const [requests, setRequests] = useState<StudentResourceRequest[]>([]);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Summary counts
  const [summaryCounts, setSummaryCounts] = useState<StudentResourceRequestSummaryCounts>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);

  // Available resources for dropdown
  const [availableResources, setAvailableResources] = useState<StudentResourceSummary[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState<boolean>(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [categoryIdFilter, setCategoryIdFilter] = useState<number | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Selected request for details modal
  const [selectedRequest, setSelectedRequest] = useState<StudentResourceRequest | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Fetch summary counts
  const fetchSummaryCounts = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await studentResourceRequestApi.getSummaryCounts();
      if (res.success && res.data) {
        setSummaryCounts(res.data);
      }
    } catch {
      // Summary fetch fallback, counts will remain zero
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch available resources
  const fetchResources = useCallback(async (categoryId?: number) => {
    setResourcesLoading(true);
    try {
      const res = await studentResourceRequestApi.getAvailableResources(categoryId);
      if (res.success && res.data) {
        setAvailableResources(res.data);
      }
    } catch {
      setAvailableResources([]);
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  // Fetch paginated requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: ResourceRequestFilters = {
        page,
        size,
        sortBy,
        sortDir,
        status: statusFilter,
        categoryId: categoryIdFilter,
        date: dateFilter || undefined,
        search: searchTerm.trim() || undefined,
      };

      const res = await studentResourceRequestApi.getRequests(filters);
      if (res.success && res.data) {
        setRequests(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setError(res.message || 'Failed to load requests');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to retrieve resource requests';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDir, statusFilter, categoryIdFilter, dateFilter, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchSummaryCounts();
    fetchResources();
  }, [fetchSummaryCounts, fetchResources]);

  // Fetch single request details
  const fetchRequestDetails = useCallback(async (id: number) => {
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const res = await studentResourceRequestApi.getRequestById(id);
      if (res.success && res.data) {
        setSelectedRequest(res.data);
      } else {
        setDetailsError(res.message || 'Failed to retrieve request details');
      }
    } catch (err: any) {
      setDetailsError(err.response?.data?.message || err.message || 'Request details unavailable');
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const clearSelectedRequest = useCallback(() => {
    setSelectedRequest(null);
    setDetailsError(null);
  }, []);

  // Create request mutation
  const submitCreateRequest = async (payload: CreateResourceRequestPayload): Promise<StudentResourceRequest> => {
    const res = await studentResourceRequestApi.createRequest(payload);
    if (res.success && res.data) {
      // Refresh list & summary counts
      fetchRequests();
      fetchSummaryCounts();
      return res.data;
    }
    throw new Error(res.message || 'Failed to create request');
  };

  // Cancel request mutation
  const submitCancelRequest = async (id: number): Promise<StudentResourceRequest> => {
    const res = await studentResourceRequestApi.cancelRequest(id);
    if (res.success && res.data) {
      // Refresh list, summary, and current selected request if open
      setSelectedRequest(res.data);
      fetchRequests();
      fetchSummaryCounts();
      return res.data;
    }
    throw new Error(res.message || 'Failed to cancel request');
  };

  // Reset page to 0 when filter changes
  const applyFilter = (filterUpdater: () => void) => {
    setPage(0);
    filterUpdater();
  };

  return {
    requests,
    page,
    setPage,
    size,
    setSize,
    totalElements,
    totalPages,
    loading,
    error,
    refresh: () => {
      fetchRequests();
      fetchSummaryCounts();
    },

    // Summary counts
    summaryCounts,
    summaryLoading,

    // Resources
    availableResources,
    resourcesLoading,
    fetchResources,

    // Filters
    statusFilter,
    setStatusFilter: (status: RequestStatus | 'ALL') => applyFilter(() => setStatusFilter(status)),
    categoryIdFilter,
    setCategoryIdFilter: (catId?: number) => applyFilter(() => setCategoryIdFilter(catId)),
    dateFilter,
    setDateFilter: (d: string) => applyFilter(() => setDateFilter(d)),
    searchTerm,
    setSearchTerm: (s: string) => applyFilter(() => setSearchTerm(s)),
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,

    // Details Modal
    selectedRequest,
    detailsLoading,
    detailsError,
    fetchRequestDetails,
    clearSelectedRequest,

    // Mutations
    submitCreateRequest,
    submitCancelRequest,
  };
};
