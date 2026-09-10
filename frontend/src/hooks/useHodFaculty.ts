import { useState, useEffect, useCallback, useRef } from 'react';
import {
  hodApi,
  FacultyQueryParams,
} from '../services/api/hodApi';
import {
  HodFacultySummary,
  HodFacultyDetail,
  HodUpdateFacultyRequest,
  HodUpdateStatusRequest,
} from '../types/hod';

export interface UseHodFacultyReturn {
  faculty: HodFacultySummary[];
  loading: boolean;
  error: string | null;
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  selectedFaculty: HodFacultyDetail | null;
  detailLoading: boolean;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  updateStatus: (id: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING', reason?: string) => Promise<HodFacultySummary>;
  updateProfile: (id: number, data: HodUpdateFacultyRequest) => Promise<HodFacultyDetail>;
  viewFacultyDetail: (id: number) => Promise<void>;
  closeFacultyDetail: () => void;
}

export const useHodFaculty = (initialPageSize = 10): UseHodFacultyReturn => {
  const [faculty, setFaculty] = useState<HodFacultySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPageState] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearchState] = useState('');
  const [statusFilter, setStatusFilterState] = useState('ALL');

  const [selectedFaculty, setSelectedFaculty] = useState<HodFacultyDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFaculty = useCallback(
    async (currentPage: number, currentSearch: string, currentStatus: string) => {
      setLoading(true);
      setError(null);
      try {
        const params: FacultyQueryParams = {
          page: currentPage,
          size,
          sort: 'id,desc',
        };
        if (currentSearch.trim()) params.search = currentSearch.trim();
        if (currentStatus !== 'ALL') params.status = currentStatus;

        const res = await hodApi.getFaculty(params);
        if (res.success && res.data) {
          setFaculty(res.data.content || []);
          setTotalElements(res.data.totalElements || 0);
          setTotalPages(res.data.totalPages || 0);
        } else {
          setError(res.message || 'Failed to load department faculty');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error fetching department faculty');
      } finally {
        setLoading(false);
      }
    },
    [size]
  );

  useEffect(() => {
    fetchFaculty(page, search, statusFilter);
  }, [page, statusFilter, fetchFaculty]);

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
    setPageState(0);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchFaculty(0, newSearch, statusFilter);
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
    fetchFaculty(page, search, statusFilter);
  };

  const updateStatus = async (
    id: number,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING',
    reason?: string
  ): Promise<HodFacultySummary> => {
    const payload: HodUpdateStatusRequest = { status, reason };
    const res = await hodApi.updateFacultyStatus(id, payload);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update faculty status');
    }
    refresh();
    return res.data;
  };

  const updateProfile = async (id: number, data: HodUpdateFacultyRequest): Promise<HodFacultyDetail> => {
    const res = await hodApi.updateFacultyProfile(id, data);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update faculty profile');
    }
    refresh();
    if (selectedFaculty && selectedFaculty.id === id) {
      setSelectedFaculty(res.data);
    }
    return res.data;
  };

  const viewFacultyDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await hodApi.getFacultyById(id);
      if (res.success && res.data) {
        setSelectedFaculty(res.data);
      } else {
        throw new Error(res.message || 'Failed to load faculty details');
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error fetching faculty details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeFacultyDetail = () => {
    setSelectedFaculty(null);
  };

  return {
    faculty,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    statusFilter,
    selectedFaculty,
    detailLoading,
    setSearch,
    setStatusFilter,
    setPage,
    refresh,
    updateStatus,
    updateProfile,
    viewFacultyDetail,
    closeFacultyDetail,
  };
};
