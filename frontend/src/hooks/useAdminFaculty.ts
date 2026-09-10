import { useState, useEffect, useCallback, useRef } from 'react';
import {
  adminStaffApi,
  FacultySummary,
  FacultyDetails,
  CreateFacultyData,
  UpdateFacultyData,
} from '../services/api/adminStaffApi';

export interface UseAdminFacultyReturn {
  faculty: FacultySummary[];
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
  createFaculty: (data: CreateFacultyData) => Promise<FacultySummary>;
  updateFaculty: (id: number, data: UpdateFacultyData) => Promise<FacultySummary>;
  updateStatus: (id: number, status: string) => Promise<FacultySummary>;
  getFacultyDetails: (id: number) => Promise<FacultyDetails>;
}

export const useAdminFaculty = (initialPageSize = 20): UseAdminFacultyReturn => {
  const [faculty, setFaculty] = useState<FacultySummary[]>([]);
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

  const fetchFaculty = useCallback(
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

        const res = await adminStaffApi.getFaculty(params);
        if (res.success && res.data) {
          setFaculty(res.data.content || []);
          setTotalElements(res.data.totalElements || 0);
          setTotalPages(res.data.totalPages || 0);
        } else {
          setError(res.message || 'Failed to load faculty members');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error fetching faculty records');
      } finally {
        setLoading(false);
      }
    },
    [size]
  );

  useEffect(() => {
    fetchFaculty(page, search, departmentFilter, statusFilter);
  }, [page, departmentFilter, statusFilter, fetchFaculty]);

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
    setPageState(0);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchFaculty(0, newSearch, departmentFilter, statusFilter);
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
    fetchFaculty(page, search, departmentFilter, statusFilter);
  };

  const createFaculty = async (data: CreateFacultyData): Promise<FacultySummary> => {
    const res = await adminStaffApi.createFaculty(data);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to create faculty member');
    }
    refresh();
    return res.data;
  };

  const updateFaculty = async (id: number, data: UpdateFacultyData): Promise<FacultySummary> => {
    const res = await adminStaffApi.updateFaculty(id, data);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update faculty member');
    }
    refresh();
    return res.data;
  };

  const updateStatus = async (id: number, status: string): Promise<FacultySummary> => {
    const res = await adminStaffApi.updateFacultyStatus(id, status);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update faculty status');
    }
    refresh();
    return res.data;
  };

  const getFacultyDetails = async (id: number): Promise<FacultyDetails> => {
    const res = await adminStaffApi.getFacultyById(id);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to fetch faculty details');
    }
    return res.data;
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
    departmentFilter,
    statusFilter,
    setSearch,
    setDepartmentFilter,
    setStatusFilter,
    setPage,
    refresh,
    createFaculty,
    updateFaculty,
    updateStatus,
    getFacultyDetails,
  };
};
