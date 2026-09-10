import { useState, useEffect, useCallback } from 'react';
import { principalApi } from '../services/api/principalApi';
import {
  PrincipalApprovalSummaryDto,
  PrincipalApprovalDetailDto,
} from '../types/principal';

export const usePrincipalApprovals = (initialPageSize = 10) => {
  const [approvals, setApprovals] = useState<PrincipalApprovalSummaryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [selectedApproval, setSelectedApproval] = useState<PrincipalApprovalDetailDto | null>(null);

  const fetchApprovals = useCallback(async () => {
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
      if (fromDate) {
        params.fromDate = fromDate;
      }
      if (toDate) {
        params.toDate = toDate;
      }

      const res = await principalApi.getApprovals(params);
      if (res.success && res.data) {
        setApprovals(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 0);
      } else {
        setError(res.message || 'Failed to retrieve institution approvals');
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('You do not have permission to access approvals for this institution.');
      } else {
        setError(err?.response?.data?.message || err?.message || 'Unable to connect to approvals service.');
      }
    } finally {
      setLoading(false);
    }
  }, [page, size, statusFilter, departmentFilter, fromDate, toDate]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const fetchApprovalDetail = async (id: number): Promise<PrincipalApprovalDetailDto> => {
    try {
      setDetailLoading(true);
      setError(null);
      const res = await principalApi.getApproval(id);
      if (res.success && res.data) {
        setSelectedApproval(res.data);
        return res.data;
      } else {
        throw new Error(res.message || 'Failed to load approval details');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load approval details';
      setError(msg);
      throw err;
    } finally {
      setDetailLoading(false);
    }
  };

  const approveApproval = async (id: number, comments?: string): Promise<PrincipalApprovalDetailDto> => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await principalApi.approveApproval(id, { comments });
      if (res.success && res.data) {
        setSelectedApproval(res.data);
        await fetchApprovals();
        return res.data;
      } else {
        throw new Error(res.message || 'Failed to approve request');
      }
    } catch (err: any) {
      const msg =
        err?.response?.status === 409
          ? 'The approval has already been processed or its state has changed.'
          : err?.response?.data?.message || err?.message || 'Failed to process approval';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const rejectApproval = async (id: number, comments: string): Promise<PrincipalApprovalDetailDto> => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await principalApi.rejectApproval(id, { comments });
      if (res.success && res.data) {
        setSelectedApproval(res.data);
        await fetchApprovals();
        return res.data;
      } else {
        throw new Error(res.message || 'Failed to reject request');
      }
    } catch (err: any) {
      const msg =
        err?.response?.status === 409
          ? 'The approval has already been processed or its state has changed.'
          : err?.response?.data?.message || err?.message || 'Failed to reject approval';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    approvals,
    loading,
    actionLoading,
    detailLoading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    statusFilter,
    departmentFilter,
    fromDate,
    toDate,
    selectedApproval,
    setPage,
    setStatusFilter: (s: string) => {
      setStatusFilter(s);
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
    fetchApprovalDetail,
    approveApproval,
    rejectApproval,
    refresh: fetchApprovals,
  };
};
