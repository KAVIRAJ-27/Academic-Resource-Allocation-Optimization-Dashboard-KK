import { useState, useEffect, useCallback } from 'react';
import { principalApi } from '../services/api/principalApi';
import {
  PrincipalAllocationSummaryDto,
  PrincipalAllocationDetailDto,
} from '../types/principal';

export const usePrincipalAllocations = (initialPageSize = 10) => {
  const [allocations, setAllocations] = useState<PrincipalAllocationSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState('');

  const [selectedAllocation, setSelectedAllocation] = useState<PrincipalAllocationDetailDto | null>(null);

  const fetchAllocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        size,
        sort: 'id,desc',
      };

      if (statusFilter && statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (departmentFilter) {
        params.departmentId = departmentFilter;
      }
      if (dateFilter) {
        params.date = dateFilter;
      }

      const res = await principalApi.getAllocations(params);
      if (res.success && res.data) {
        setAllocations(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setError(res.message || 'Failed to retrieve institution resource allocations');
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('You do not have permission to access allocations for this institution.');
      } else {
        setError(err?.response?.data?.message || err?.message || 'Unable to connect to allocations service.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, size, statusFilter, departmentFilter, dateFilter]);

  useEffect(() => {
    fetchAllocations();
  }, [fetchAllocations]);

  const fetchAllocationDetail = async (id: number): Promise<PrincipalAllocationDetailDto> => {
    try {
      setDetailLoading(true);
      setError(null);
      const res = await principalApi.getAllocation(id);
      if (res.success && res.data) {
        setSelectedAllocation(res.data);
        return res.data;
      } else {
        throw new Error(res.message || 'Failed to load allocation details');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load allocation details';
      setError(msg);
      throw err;
    } finally {
      setDetailLoading(false);
    }
  };

  return {
    allocations,
    loading,
    detailLoading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    statusFilter,
    departmentFilter,
    dateFilter,
    selectedAllocation,
    setPage,
    setStatusFilter: (s: string) => {
      setStatusFilter(s);
      setPage(0);
    },
    setDepartmentFilter: (d: number | undefined) => {
      setDepartmentFilter(d);
      setPage(0);
    },
    setDateFilter: (d: string) => {
      setDateFilter(d);
      setPage(0);
    },
    fetchAllocationDetail,
    refresh: fetchAllocations,
  };
};
