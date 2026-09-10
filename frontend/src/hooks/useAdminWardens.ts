import { useState, useEffect, useCallback, useRef } from 'react';
import {
  adminStaffApi,
  WardenSummary,
  WardenDetails,
  CreateWardenData,
  UpdateWardenData,
} from '../services/api/adminStaffApi';

export interface UseAdminWardensReturn {
  wardens: WardenSummary[];
  loading: boolean;
  error: string | null;
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  search: string;
  hostelFilter: string;
  statusFilter: string;
  setSearch: (search: string) => void;
  setHostelFilter: (hostelId: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  createWarden: (data: CreateWardenData) => Promise<WardenSummary>;
  updateWarden: (id: number, data: UpdateWardenData) => Promise<WardenSummary>;
  updateStatus: (id: number, status: string) => Promise<WardenSummary>;
  assignHostels: (id: number, hostelIds: number[]) => Promise<WardenSummary>;
  getWardenDetails: (id: number) => Promise<WardenDetails>;
}

export const useAdminWardens = (initialPageSize = 20): UseAdminWardensReturn => {
  const [wardens, setWardens] = useState<WardenSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPageState] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearchState] = useState('');
  const [hostelFilter, setHostelFilterState] = useState('ALL');
  const [statusFilter, setStatusFilterState] = useState('ALL');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchWardens = useCallback(
    async (currentPage: number, currentSearch: string, currentHostel: string, currentStatus: string) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = {
          page: currentPage,
          size,
          sort: 'id,desc',
        };
        if (currentSearch.trim()) params.search = currentSearch.trim();
        if (currentHostel !== 'ALL') params.hostelId = Number(currentHostel);
        if (currentStatus !== 'ALL') params.status = currentStatus;

        const res = await adminStaffApi.getWardens(params);
        if (res.success && res.data) {
          setWardens(res.data.content || []);
          setTotalElements(res.data.totalElements || 0);
          setTotalPages(res.data.totalPages || 0);
        } else {
          setError(res.message || 'Failed to load Warden records');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error fetching Warden records');
      } finally {
        setLoading(false);
      }
    },
    [size]
  );

  useEffect(() => {
    fetchWardens(page, search, hostelFilter, statusFilter);
  }, [page, hostelFilter, statusFilter, fetchWardens]);

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
    setPageState(0);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchWardens(0, newSearch, hostelFilter, statusFilter);
    }, 400);
  };

  const setHostelFilter = (hostelId: string) => {
    setHostelFilterState(hostelId);
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
    fetchWardens(page, search, hostelFilter, statusFilter);
  };

  const createWarden = async (data: CreateWardenData): Promise<WardenSummary> => {
    const res = await adminStaffApi.createWarden(data);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to create Warden');
    }
    refresh();
    return res.data;
  };

  const updateWarden = async (id: number, data: UpdateWardenData): Promise<WardenSummary> => {
    const res = await adminStaffApi.updateWarden(id, data);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update Warden');
    }
    refresh();
    return res.data;
  };

  const updateStatus = async (id: number, status: string): Promise<WardenSummary> => {
    const res = await adminStaffApi.updateWardenStatus(id, status);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update Warden status');
    }
    refresh();
    return res.data;
  };

  const assignHostels = async (id: number, hostelIds: number[]): Promise<WardenSummary> => {
    const res = await adminStaffApi.assignHostels(id, hostelIds);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update hostel assignments');
    }
    refresh();
    return res.data;
  };

  const getWardenDetails = async (id: number): Promise<WardenDetails> => {
    const res = await adminStaffApi.getWardenById(id);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to fetch Warden details');
    }
    return res.data;
  };

  return {
    wardens,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    hostelFilter,
    statusFilter,
    setSearch,
    setHostelFilter,
    setStatusFilter,
    setPage,
    refresh,
    createWarden,
    updateWarden,
    updateStatus,
    assignHostels,
    getWardenDetails,
  };
};
