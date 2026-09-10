import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import { WardenBedSummary, WardenBedFilterParams } from '../types/wardenAllocation';

export const useWardenBeds = (initialFilters?: WardenBedFilterParams) => {
  const [beds, setBeds] = useState<WardenBedSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WardenBedFilterParams>(initialFilters || {});

  const fetchBeds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getBeds({
        ...filters,
        page: currentPage,
        size: filters.size || 15,
      });

      if (res.success && res.data) {
        setBeds(res.data.content);
        setTotalElements(res.data.totalElements);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load beds');
      setBeds([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchBeds();
  }, [fetchBeds]);

  const updateFilters = useCallback((newFilters: Partial<WardenBedFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ hostelId: filters.hostelId });
    setCurrentPage(0);
  }, [filters.hostelId]);

  return {
    beds,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchBeds,
  };
};
