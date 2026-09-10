import { useState, useEffect, useCallback } from 'react';
import { principalApi } from '../services/api/principalApi';
import {
  PrincipalResourceRequestSummaryDto,
  PrincipalResourceRequestDetailDto,
} from '../types/principal';

export const usePrincipalResourceRequests = (initialPageSize = 10) => {
  const [requests, setRequests] = useState<PrincipalResourceRequestSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [selectedRequest, setSelectedRequest] = useState<PrincipalResourceRequestDetailDto | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page,
        size,
        sort: 'id,desc',
      };

      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (statusFilter && statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      if (priorityFilter && priorityFilter !== 'ALL') {
        params.priority = priorityFilter;
      }
      if (departmentFilter) {
        params.departmentId = departmentFilter;
      }
      if (fromDate) {
        params.fromDate = fromDate;
      }
      if (toDate) {
        params.toDate = toDate;
      }

      const res = await principalApi.getResourceRequests(params);
      if (res.success && res.data) {
        setRequests(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setError(res.message || 'Failed to retrieve institution resource requests');
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('You do not have permission to access resource requests for this institution.');
      } else {
        setError(err?.response?.data?.message || err?.message || 'Unable to connect to resource requests service.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, size, search, statusFilter, priorityFilter, departmentFilter, fromDate, toDate]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const fetchRequestDetail = async (id: number): Promise<PrincipalResourceRequestDetailDto> => {
    try {
      setDetailLoading(true);
      setError(null);
      const res = await principalApi.getResourceRequest(id);
      if (res.success && res.data) {
        setSelectedRequest(res.data);
        return res.data;
      } else {
        throw new Error(res.message || 'Failed to load request details');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load request details';
      setError(msg);
      throw err;
    } finally {
      setDetailLoading(false);
    }
  };

  const approveRequest = async (id: number, comments?: string): Promise<PrincipalResourceRequestDetailDto> => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await principalApi.approveResourceRequest(id, { comments });
      if (res.success && res.data) {
        setSelectedRequest(res.data);
        await fetchRequests();
        return res.data;
      } else {
        throw new Error(res.message || 'Failed to approve request');
      }
    } catch (err: any) {
      const msg =
        err?.response?.status === 409
          ? 'The request has already been processed or its state has changed.'
          : err?.response?.data?.message || err?.message || 'Failed to approve request';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const rejectRequest = async (id: number, comments: string): Promise<PrincipalResourceRequestDetailDto> => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await principalApi.rejectResourceRequest(id, { comments });
      if (res.success && res.data) {
        setSelectedRequest(res.data);
        await fetchRequests();
        return res.data;
      } else {
        throw new Error(res.message || 'Failed to reject request');
      }
    } catch (err: any) {
      const msg =
        err?.response?.status === 409
          ? 'The request has already been processed or its state has changed.'
          : err?.response?.data?.message || err?.message || 'Failed to reject request';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    requests,
    loading,
    actionLoading,
    detailLoading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    statusFilter,
    priorityFilter,
    departmentFilter,
    fromDate,
    toDate,
    selectedRequest,
    setPage,
    setSearch: (s: string) => {
      setSearch(s);
      setPage(0);
    },
    setStatusFilter: (s: string) => {
      setStatusFilter(s);
      setPage(0);
    },
    setPriorityFilter: (p: string) => {
      setPriorityFilter(p);
      setPage(0);
    },
    setDepartmentFilter: (d: number | undefined) => {
      setDepartmentFilter(d);
      setPage(0);
    },
    setFromDate: (d: string) => {
      setFromDate(d);
      setPage(0);
    },
    setToDate: (d: string) => {
      setToDate(d);
      setPage(0);
    },
    fetchRequestDetail,
    approveRequest,
    rejectRequest,
    refresh: fetchRequests,
  };
};
