import { useState, useEffect, useCallback } from 'react';
import {
  FacultyResourceRequestItem,
  FacultyResourceRequestSummaryCounts,
  FacultyAvailableResource,
} from '../types/faculty';
import { facultyResourceRequestApi } from '../services/api/facultyResourceRequestApi';

export const useFacultyResourceRequests = () => {
  const [requests, setRequests] = useState<FacultyResourceRequestItem[]>([]);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Summary counts
  const [summaryCounts, setSummaryCounts] = useState<FacultyResourceRequestSummaryCounts>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    completed: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryIdFilter, setCategoryIdFilter] = useState<number | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Cancel action state
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Fetch summary counts
  const fetchSummaryCounts = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await facultyResourceRequestApi.getSummaryCounts();
      if (res.success && res.data) {
        setSummaryCounts(res.data);
      }
    } catch {
      // Fallback silently if summary counts endpoint fails
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch requests
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await facultyResourceRequestApi.getRequests({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        categoryId: categoryIdFilter,
        date: dateFilter || undefined,
        search: searchTerm,
        page,
        size,
        sortBy,
        sortDirection,
      });

      if (res.success && res.data) {
        setRequests(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setError(res.message || 'Failed to fetch resource requests');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load resource requests'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryIdFilter, dateFilter, searchTerm, page, size, sortBy, sortDirection]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    fetchSummaryCounts();
  }, [fetchSummaryCounts]);

  const cancelRequest = async (id: number): Promise<boolean> => {
    setCancellingId(id);
    setCancelError(null);
    try {
      const res = await facultyResourceRequestApi.cancelRequest(id);
      if (res.success) {
        // Refresh request list and counts
        fetchRequests();
        fetchSummaryCounts();
        return true;
      } else {
        setCancelError(res.message || 'Failed to cancel request');
        return false;
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to cancel resource request';
      setCancelError(msg);
      return false;
    } finally {
      setCancellingId(null);
    }
  };

  return {
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
    categoryIdFilter,
    setCategoryIdFilter,
    dateFilter,
    setDateFilter,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    cancelRequest,
    cancellingId,
    cancelError,
    refetch: fetchRequests,
    refetchCounts: fetchSummaryCounts,
  };
};
