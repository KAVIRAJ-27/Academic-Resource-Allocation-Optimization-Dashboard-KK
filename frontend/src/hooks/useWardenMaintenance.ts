import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import {
  WardenMaintenanceSummary,
  WardenMaintenanceFilterParams,
  UpdateMaintenanceStatusRequest,
} from '../types/wardenOperations';

export const useWardenMaintenance = (initialFilters?: WardenMaintenanceFilterParams) => {
  const [maintenanceRequests, setMaintenanceRequests] = useState<WardenMaintenanceSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WardenMaintenanceFilterParams>(initialFilters || {});
  const [mutating, setMutating] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getMaintenanceRequests({
        ...filters,
        page: currentPage,
        size: filters.size || 15,
      });

      if (res.success && res.data) {
        setMaintenanceRequests(res.data.content);
        setTotalElements(res.data.totalElements);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load maintenance requests');
      setMaintenanceRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateFilters = useCallback((newFilters: Partial<WardenMaintenanceFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ hostelId: filters.hostelId });
    setCurrentPage(0);
  }, [filters.hostelId]);

  const updateMaintenanceStatus = useCallback(
    async (id: number, data: UpdateMaintenanceStatusRequest) => {
      try {
        setMutating(true);
        const res = await wardenApi.updateMaintenanceStatus(id, data);
        if (res.success) {
          await fetchRequests();
          return res.data;
        }
        return null;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update maintenance status';
        throw new Error(msg);
      } finally {
        setMutating(false);
      }
    },
    [fetchRequests]
  );

  return {
    maintenanceRequests,
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
    updateMaintenanceStatus,
    refetch: fetchRequests,
  };
};
