import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import { WardenAllocationSummary, WardenAllocationFilterParams } from '../types/wardenAllocation';

export const useWardenAllocations = (initialFilters?: WardenAllocationFilterParams) => {
  const [allocations, setAllocations] = useState<WardenAllocationSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WardenAllocationFilterParams>(initialFilters || {});

  const fetchAllocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getAllocations({
        ...filters,
        page: currentPage,
        size: filters.size || 15,
      });

      if (res.success && res.data) {
        setAllocations(res.data.content);
        setTotalElements(res.data.totalElements);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load allocations');
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  const updateFilters = useCallback((newFilters: Partial<WardenAllocationFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ hostelId: filters.hostelId });
    setCurrentPage(0);
  }, [filters.hostelId]);

  return {
    allocations,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchAllocations,
  };
};
