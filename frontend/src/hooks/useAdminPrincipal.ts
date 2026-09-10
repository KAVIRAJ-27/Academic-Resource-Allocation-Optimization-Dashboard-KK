import { useState, useEffect, useCallback, useRef } from 'react';
import {
  adminStaffApi,
  PrincipalData,
  AssignPrincipalData,
  UpdatePrincipalAssignmentData,
} from '../services/api/adminStaffApi';

export interface UseAdminPrincipalReturn {
  currentPrincipal: PrincipalData | null;
  history: PrincipalData[];
  loading: boolean;
  error: string | null;
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  assignPrincipal: (data: AssignPrincipalData) => Promise<PrincipalData>;
  updatePrincipalAssignment: (id: number, data: UpdatePrincipalAssignmentData) => Promise<PrincipalData>;
  updateStatus: (id: number, status: string) => Promise<PrincipalData>;
  getPrincipalDetails: (id: number) => Promise<PrincipalData>;
}

export const useAdminPrincipal = (initialPageSize = 10): UseAdminPrincipalReturn => {
  const [currentPrincipal, setCurrentPrincipal] = useState<PrincipalData | null>(null);
  const [history, setHistory] = useState<PrincipalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPageState] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearchState] = useState('');
  const [statusFilter, setStatusFilterState] = useState('ALL');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPrincipalData = useCallback(
    async (currentPage: number, currentSearch: string, currentStatus: string) => {
      setLoading(true);
      setError(null);
      try {
        // Fetch current principal
        const curRes = await adminStaffApi.getCurrentPrincipal();
        if (curRes.success) {
          setCurrentPrincipal(curRes.data);
        }

        // Fetch assignment history
        const params: Record<string, any> = {
          page: currentPage,
          size,
          sort: 'id,desc',
        };
        if (currentSearch.trim()) params.search = currentSearch.trim();
        if (currentStatus !== 'ALL') params.status = currentStatus;

        const histRes = await adminStaffApi.getPrincipalHistory(params);
        if (histRes.success && histRes.data) {
          setHistory(histRes.data.content || []);
          setTotalElements(histRes.data.totalElements || 0);
          setTotalPages(histRes.data.totalPages || 0);
        }
      } catch (err: any) {
        // Current principal might be null (404), which is valid if none is assigned
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || err.message || 'Error fetching Principal records');
        }
      } finally {
        setLoading(false);
      }
    },
    [size]
  );

  useEffect(() => {
    fetchPrincipalData(page, search, statusFilter);
  }, [page, statusFilter, fetchPrincipalData]);

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
    setPageState(0);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchPrincipalData(0, newSearch, statusFilter);
    }, 400);
  };

  const setStatusFilter = (status: string) => {
    setStatusFilterState(status);
    setPageState(0);
  };

  const setPage = (newPage: number) => {
    setPageState(newPage);
  };

  const refresh = () => {
    fetchPrincipalData(page, search, statusFilter);
  };

  const assignPrincipal = async (data: AssignPrincipalData): Promise<PrincipalData> => {
    const res = await adminStaffApi.assignPrincipal(data);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to assign Principal');
    }
    refresh();
    return res.data;
  };

  const updatePrincipalAssignment = async (id: number, data: UpdatePrincipalAssignmentData): Promise<PrincipalData> => {
    const res = await adminStaffApi.updatePrincipalAssignment(id, data);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update Principal assignment');
    }
    refresh();
    return res.data;
  };

  const updateStatus = async (id: number, status: string): Promise<PrincipalData> => {
    const res = await adminStaffApi.updatePrincipalStatus(id, status);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update Principal status');
    }
    refresh();
    return res.data;
  };

  const getPrincipalDetails = async (id: number): Promise<PrincipalData> => {
    const res = await adminStaffApi.getPrincipalById(id);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to fetch Principal details');
    }
    return res.data;
  };

  return {
    currentPrincipal,
    history,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    statusFilter,
    setSearch,
    setStatusFilter,
    setPage,
    refresh,
    assignPrincipal,
    updatePrincipalAssignment,
    updateStatus,
    getPrincipalDetails,
  };
};
