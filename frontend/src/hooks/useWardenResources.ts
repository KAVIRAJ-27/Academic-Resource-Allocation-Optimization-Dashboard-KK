import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import {
  WardenFacilitySummary,
  WardenFacilityFilterParams,
  UpdateFacilityRequest,
} from '../types/wardenOperations';

export const useWardenResources = (initialFilters?: WardenFacilityFilterParams) => {
  const [resources, setResources] = useState<WardenFacilitySummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WardenFacilityFilterParams>(initialFilters || {});
  const [mutating, setMutating] = useState(false);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getResources({
        ...filters,
        page: currentPage,
        size: filters.size || 15,
      });

      if (res.success && res.data) {
        setResources(res.data.content);
        setTotalElements(res.data.totalElements);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load hostel resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const updateFilters = useCallback((newFilters: Partial<WardenFacilityFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ hostelId: filters.hostelId });
    setCurrentPage(0);
  }, [filters.hostelId]);

  const updateResource = useCallback(
    async (id: number, data: UpdateFacilityRequest) => {
      try {
        setMutating(true);
        const res = await wardenApi.updateResource(id, data);
        if (res.success) {
          await fetchResources();
          return res.data;
        }
        return null;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update resource';
        throw new Error(msg);
      } finally {
        setMutating(false);
      }
    },
    [fetchResources]
  );

  return {
    resources,
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
    updateResource,
    refetch: fetchResources,
  };
};
