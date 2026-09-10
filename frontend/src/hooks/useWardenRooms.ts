import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import { WardenRoomSummary, WardenRoomFilterParams } from '../types/wardenAllocation';

export const useWardenRooms = (initialFilters?: WardenRoomFilterParams) => {
  const [rooms, setRooms] = useState<WardenRoomSummary[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WardenRoomFilterParams>(initialFilters || {});

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getRooms({
        ...filters,
        page: currentPage,
        size: filters.size || 15,
      });

      if (res.success && res.data) {
        setRooms(res.data.content);
        setTotalElements(res.data.totalElements);
        setTotalPages(res.data.totalPages);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const updateFilters = useCallback((newFilters: Partial<WardenRoomFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ hostelId: filters.hostelId });
    setCurrentPage(0);
  }, [filters.hostelId]);

  return {
    rooms,
    totalElements,
    totalPages,
    currentPage,
    setCurrentPage,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    refetch: fetchRooms,
  };
};
