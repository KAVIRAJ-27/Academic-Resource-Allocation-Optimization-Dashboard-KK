import { useState, useEffect, useCallback, useRef } from 'react';
import {
  adminStaffApi,
  HodSummary,
  HodDetails,
  CreateHodAssignmentData,
  UpdateHodAssignmentData,
} from '../services/api/adminStaffApi';

export interface UseAdminHodsReturn {
  hods: HodSummary[];
  loading: boolean;
  error: string | null;
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  search: string;
  departmentFilter: string;
  statusFilter: string;
  setSearch: (search: string) => void;
  setDepartmentFilter: (deptId: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  assignHod: (data: CreateHodAssignmentData) => Promise<HodSummary>;
  updateHodAssignment: (id: number, data: UpdateHodAssignmentData) => Promise<HodSummary>;
  updateStatus: (id: number, status: string) => Promise<HodSummary>;
  getHodDetails: (id: number) => Promise<HodDetails>;
}

export const useAdminHods = (initialPageSize = 20): UseAdminHodsReturn => {
  const [hods, setHods] = useState<HodSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPageState] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearchState] = useState('');
  const [departmentFilter, setDepartmentFilterState] = useState('ALL');
  const [statusFilter, setStatusFilterState] = useState('ALL');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchHods = useCallback(
    async (currentPage: number, currentSearch: string, currentDept: string, currentStatus: string) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          size,
          sort: 'id,desc',
        };
        if (currentSearch.trim()) params.search = currentSearch.trim();
        if (currentDept !== 'ALL') params.departmentId = Number(currentDept);
        if (currentStatus !== 'ALL') params.status = currentStatus;

        const res = await adminStaffApi.getHods(params);
        if (res.success && res.data) {
          setHods(res.data.content || []);
          setTotalElements(res.data.totalElements || 0);
          setTotalPages(res.data.totalPages || 0);
        } else {
          setError(res.message || 'Failed to load HOD assignments');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error fetching HOD assignments');
      } finally {
        setLoading(false);
      }
    },
    [size]
  );

  useEffect(() => {
    fetchHods(page, search, departmentFilter, statusFilter);
  }, [page, departmentFilter, statusFilter, fetchHods]);

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
    setPageState(0);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchHods(0, newSearch, departmentFilter, statusFilter);
    }, 400);
  };

  const setDepartmentFilter = (deptId: string) => {
    setDepartmentFilterState(deptId);
    setPageState(0);
  };

  const setStatusFilter = (status: string) => {
    setStatusFilterState(status);
    setPageState(0);
  };

  const setPage = (newPage: number) => {
    setPageState(newPage);
  };

  const refresh = () => {
    fetchHods(page, search, departmentFilter, statusFilter);
  };

  const assignHod = async (data: CreateHodAssignmentData): Promise<HodSummary> => {
    const res = await adminStaffApi.assignHod(data);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to assign HOD');
    }
    refresh();
    return res.data;
  };

  const updateHodAssignment = async (id: number, data: UpdateHodAssignmentData): Promise<HodSummary> => {
    const res = await adminStaffApi.updateHodAssignment(id, data);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update HOD assignment');
    }
    refresh();
    return res.data;
  };

  const updateStatus = async (id: number, status: string): Promise<HodSummary> => {
    const res = await adminStaffApi.updateHodStatus(id, status);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update HOD status');
    }
    refresh();
    return res.data;
  };

  const getHodDetails = async (id: number): Promise<HodDetails> => {
    const res = await adminStaffApi.getHodById(id);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to fetch HOD details');
    }
    return res.data;
  };

  return {
    hods,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    departmentFilter,
    statusFilter,
    setSearch,
    setDepartmentFilter,
    setStatusFilter,
    setPage,
    refresh,
    assignHod,
    updateHodAssignment,
    updateStatus,
    getHodDetails,
  };
};
