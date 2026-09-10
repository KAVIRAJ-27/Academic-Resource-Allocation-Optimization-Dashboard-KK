import { useState, useEffect, useCallback } from 'react';
import {
  StudentHostelComplaint,
  CreateHostelComplaintPayload,
  StudentHostelComplaintSummaryCounts,
  HostelComplaintFilters,
  ComplaintStatus,
} from '../types/studentHostelComplaint';
import { studentHostelComplaintApi } from '../services/api/studentHostelComplaintApi';

export const useStudentHostelComplaints = () => {
  // Complaint list & pagination
  const [complaints, setComplaints] = useState<StudentHostelComplaint[]>([]);
  const [page, setPage] = useState<number>(0);
  const [size, setSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Summary counts
  const [summaryCounts, setSummaryCounts] = useState<StudentHostelComplaintSummaryCounts>({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    rejected: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Selected complaint for details modal
  const [selectedComplaint, setSelectedComplaint] = useState<StudentHostelComplaint | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Fetch summary counts
  const fetchSummaryCounts = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await studentHostelComplaintApi.getSummaryCounts();
      if (res.success && res.data) {
        setSummaryCounts(res.data);
      }
    } catch {
      // Summary fetch fallback
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch paginated complaints
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: HostelComplaintFilters = {
        page,
        size,
        sortBy,
        sortDir,
        status: statusFilter,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        search: searchTerm.trim() || undefined,
      };

      const res = await studentHostelComplaintApi.getComplaints(filters);
      if (res.success && res.data) {
        setComplaints(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setError(res.message || 'Failed to load hostel complaints');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to retrieve hostel complaints';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, size, sortBy, sortDir, statusFilter, categoryFilter, searchTerm]);

  // Initial load
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    fetchSummaryCounts();
  }, [fetchSummaryCounts]);

  // Fetch single complaint details
  const fetchComplaintDetails = useCallback(async (id: number) => {
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const res = await studentHostelComplaintApi.getComplaintById(id);
      if (res.success && res.data) {
        setSelectedComplaint(res.data);
      } else {
        setDetailsError(res.message || 'Failed to retrieve complaint details');
      }
    } catch (err: any) {
      setDetailsError(err.response?.data?.message || err.message || 'Complaint details unavailable');
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const clearSelectedComplaint = useCallback(() => {
    setSelectedComplaint(null);
    setDetailsError(null);
  }, []);

  // Create complaint mutation
  const submitCreateComplaint = async (payload: CreateHostelComplaintPayload): Promise<StudentHostelComplaint> => {
    const res = await studentHostelComplaintApi.createComplaint(payload);
    if (res.success && res.data) {
      fetchComplaints();
      fetchSummaryCounts();
      return res.data;
    }
    throw new Error(res.message || 'Failed to create hostel complaint');
  };

  const applyFilter = (filterUpdater: () => void) => {
    setPage(0);
    filterUpdater();
  };

  return {
    complaints,
    page,
    setPage,
    size,
    setSize,
    totalElements,
    totalPages,
    loading,
    error,
    refresh: () => {
      fetchComplaints();
      fetchSummaryCounts();
    },

    summaryCounts,
    summaryLoading,

    // Filters
    statusFilter,
    setStatusFilter: (status: ComplaintStatus | 'ALL') => applyFilter(() => setStatusFilter(status)),
    categoryFilter,
    setCategoryFilter: (cat: string) => applyFilter(() => setCategoryFilter(cat)),
    searchTerm,
    setSearchTerm: (s: string) => applyFilter(() => setSearchTerm(s)),
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,

    // Details Modal
    selectedComplaint,
    detailsLoading,
    detailsError,
    fetchComplaintDetails,
    clearSelectedComplaint,

    // Mutations
    submitCreateComplaint,
  };
};
