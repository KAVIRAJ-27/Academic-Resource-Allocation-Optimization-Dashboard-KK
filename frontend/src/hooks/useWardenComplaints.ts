import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import {
  WardenComplaintSummary,
  WardenComplaintFilterParams,
  UpdateComplaintStatusRequest,
} from '../types/wardenOperations';

export const useWardenComplaints = (initialFilters?: WardenComplaintFilterParams) => {
  const [complaints, setComplaints] = useState<WardenComplaintSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WardenComplaintFilterParams>(initialFilters || {});
  const [mutating, setMutating] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getComplaints({
        ...filters,
        page: currentPage,
        size: filters.size || 15,
      });

      if (res.success && res.data) {
        setComplaints(res.data.content);
        setTotalElements(res.data.totalElements);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load complaints');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const updateFilters = useCallback((newFilters: Partial<WardenComplaintFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ hostelId: filters.hostelId });
    setCurrentPage(0);
  }, [filters.hostelId]);

  const updateComplaintStatus = useCallback(
    async (id: number, data: UpdateComplaintStatusRequest) => {
      try {
        setMutating(true);
        const res = await wardenApi.updateComplaintStatus(id, data);
        if (res.success) {
          await fetchComplaints();
          return res.data;
        }
        return null;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update complaint';
        throw new Error(msg);
      } finally {
        setMutating(false);
      }
    },
    [fetchComplaints]
  );

  return {
    complaints,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    filters,
    mutating,
    updateFilters,
    resetFilters,
    updateComplaintStatus,
    refetch: fetchComplaints,
  };
};
