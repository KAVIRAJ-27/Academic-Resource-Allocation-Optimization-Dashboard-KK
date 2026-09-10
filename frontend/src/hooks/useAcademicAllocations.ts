import { useState, useEffect, useCallback } from 'react';
import { academicAllocationApi } from '../services/api/academicAllocationApi';
import {
  AcademicAllocationSummaryDto,
  AcademicAllocationFilterParams,
} from '../types/academicAllocation';

export const useAcademicAllocations = (initialFilters?: AcademicAllocationFilterParams) => {
  const [allocations, setAllocations] = useState<AcademicAllocationSummaryDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AcademicAllocationFilterParams>(initialFilters || {});

  const fetchAllocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await academicAllocationApi.getAllocations({
        ...filters,
        page: currentPage,
        size: filters.size || 10,
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

  const updateFilters = useCallback((newFilters: Partial<AcademicAllocationFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(0);
  }, []);

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
