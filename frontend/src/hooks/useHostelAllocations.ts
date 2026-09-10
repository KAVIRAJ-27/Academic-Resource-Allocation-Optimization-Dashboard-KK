import { useState, useEffect, useCallback } from 'react';
import { hostelAllocationApi } from '../services/api/hostelAllocationApi';
import {
  HostelAllocationResponseDto,
  HostelAllocationFilterParams,
} from '../types/hostelAllocation';

export const useHostelAllocations = (initialFilters?: HostelAllocationFilterParams) => {
  const [allocations, setAllocations] = useState<HostelAllocationResponseDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HostelAllocationFilterParams>(initialFilters || {});

  const fetchAllocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hostelAllocationApi.getAllocations({
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
      setError(err?.response?.data?.message || err?.message || 'Failed to load hostel allocations');
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  const updateFilters = useCallback((newFilters: Partial<HostelAllocationFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(0);
  }, []);

  const releaseAllocation = async (id: number): Promise<boolean> => {
    try {
      const res = await hostelAllocationApi.releaseAllocation(id);
      if (res.success) {
        await fetchAllocations();
        return true;
      }
      return false;
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || err?.message || 'Failed to release allocation');
    }
  };

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
    releaseAllocation,
  };
};
