import { useState, useEffect, useCallback } from 'react';
import {
  StudentHostelRequest,
  CreateHostelRequestPayload,
  StudentHostelRequestSummaryCounts,
  HostelRequestFilters,
} from '../types/studentHostelRequest';
import { RequestStatus } from '../types/studentResourceRequest';
import { studentHostelRequestApi } from '../services/api/studentHostelRequestApi';

export const useStudentHostelRequests = () => {
  // Request list & pagination
  const [requests, setRequests] = useState<StudentHostelRequest[]>([]);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Summary counts
  const [summaryCounts, setSummaryCounts] = useState<StudentHostelRequestSummaryCounts>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Selected request for details modal
  const [selectedRequest, setSelectedRequest] = useState<StudentHostelRequest | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Fetch summary counts
  const fetchSummaryCounts = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await studentHostelRequestApi.getSummaryCounts();
      if (res.success && res.data) {
        setSummaryCounts(res.data);
      }
    } catch {
      // Summary fetch fallback
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch paginated requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: HostelRequestFilters = {
        page,
        size,
        sortBy,
        sortDir,
        status: statusFilter,
        requestType: requestTypeFilter !== 'ALL' ? requestTypeFilter : undefined,
        search: searchTerm.trim() || undefined,
      };

      const res = await studentHostelRequestApi.getRequests(filters);
      if (res.success && res.data) {
        setRequests(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setError(res.message || 'Failed to load hostel requests');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to retrieve hostel requests';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDir, statusFilter, requestTypeFilter, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchSummaryCounts();
  }, [fetchSummaryCounts]);

  // Fetch single request details
  const fetchRequestDetails = useCallback(async (id: number) => {
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const res = await studentHostelRequestApi.getRequestById(id);
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
  const submitCreateRequest = async (payload: CreateHostelRequestPayload): Promise<StudentHostelRequest> => {
    const res = await studentHostelRequestApi.createRequest(payload);
    if (res.success && res.data) {
      fetchRequests();
      fetchSummaryCounts();
      return res.data;
    }
    throw new Error(res.message || 'Failed to create hostel request');
  };

  // Cancel request mutation
  const submitCancelRequest = async (id: number): Promise<StudentHostelRequest> => {
    const res = await studentHostelRequestApi.cancelRequest(id);
    if (res.success && res.data) {
      setSelectedRequest(res.data);
      fetchRequests();
      fetchSummaryCounts();
      return res.data;
    }
    throw new Error(res.message || 'Failed to cancel request');
  };

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

    summaryCounts,
    summaryLoading,

    // Filters
    statusFilter,
    setStatusFilter: (status: RequestStatus | 'ALL') => applyFilter(() => setStatusFilter(status)),
    requestTypeFilter,
    setRequestTypeFilter: (type: string) => applyFilter(() => setRequestTypeFilter(type)),
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
