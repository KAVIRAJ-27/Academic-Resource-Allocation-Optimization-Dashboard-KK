import { useState, useEffect, useCallback, useRef } from 'react';
import {
  adminStudentApi,
  StudentSummary,
  StudentDetails,
  StudentReferenceData,
  CreateStudentData,
  UpdateStudentData,
} from '../services/api/adminStudentApi';

export interface UseAdminStudentsReturn {
  students: StudentSummary[];
  loading: boolean;
  error: string | null;
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  search: string;
  departmentFilter: string;
  programFilter: string;
  sectionFilter: string;
  statusFilter: string;
  referenceData: StudentReferenceData | null;
  loadingRefData: boolean;
  setSearch: (search: string) => void;
  setDepartmentFilter: (deptId: string) => void;
  setProgramFilter: (progId: string) => void;
  setSectionFilter: (secId: string) => void;
  setStatusFilter: (status: string) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  loadReferenceData: () => Promise<void>;
  createStudent: (data: CreateStudentData) => Promise<StudentSummary>;
  updateStudent: (id: number, data: UpdateStudentData) => Promise<StudentSummary>;
  updateStatus: (id: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => Promise<StudentSummary>;
  getStudentDetails: (id: number) => Promise<StudentDetails>;
}

export const useAdminStudents = (initialPageSize = 20): UseAdminStudentsReturn => {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state (0-based)
  const [page, setPageState] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters state
  const [search, setSearchState] = useState('');
  const [departmentFilter, setDepartmentFilterState] = useState('ALL');
  const [programFilter, setProgramFilterState] = useState('ALL');
  const [sectionFilter, setSectionFilterState] = useState('ALL');
  const [statusFilter, setStatusFilterState] = useState('ALL');

  // Reference Data (Departments, Programs, Sections, Unassigned Users)
  const [referenceData, setReferenceData] = useState<StudentReferenceData | null>(null);
  const [loadingRefData, setLoadingRefData] = useState(false);

  // Debounce ref for search
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStudents = useCallback(
    async (
      pageToFetch = page,
      searchToUse = search,
      deptToUse = departmentFilter,
      progToUse = programFilter,
      secToUse = sectionFilter,
      statusToUse = statusFilter
    ) => {
      setLoading(true);
      setError(null);
      try {
        const params: {
          search?: string;
          departmentId?: number;
          programId?: number;
          sectionId?: number;
          status?: string;
          page: number;
          size: number;
        } = {
          page: pageToFetch,
          size,
        };

        if (searchToUse.trim()) {
          params.search = searchToUse.trim();
        }
        if (deptToUse !== 'ALL') {
          params.departmentId = Number(deptToUse);
        }
        if (progToUse !== 'ALL') {
          params.programId = Number(progToUse);
        }
        if (secToUse !== 'ALL') {
          params.sectionId = Number(secToUse);
        }
        if (statusToUse !== 'ALL') {
          params.status = statusToUse;
        }

        const res = await adminStudentApi.getStudents(params);
        if (res.data) {
          setStudents(res.data.content || []);
          setPageState(res.data.page);
          setTotalElements(res.data.totalElements);
          setTotalPages(res.data.totalPages);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch student records from server';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [page, size, search, departmentFilter, programFilter, sectionFilter, statusFilter]
  );

  const loadReferenceData = useCallback(async () => {
    setLoadingRefData(true);
    try {
      const res = await adminStudentApi.getReferenceData();
      if (res.data) {
        setReferenceData(res.data);
      }
    } catch {
      // Non-blocking, can retry on modal open
    } finally {
      setLoadingRefData(false);
    }
  }, []);

  // Fetch reference data on mount
  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  // Initial fetch and dependency trigger
  useEffect(() => {
    fetchStudents(page, search, departmentFilter, programFilter, sectionFilter, statusFilter);
  }, [page, departmentFilter, programFilter, sectionFilter, statusFilter]);

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setPageState(0);
      fetchStudents(0, newSearch, departmentFilter, programFilter, sectionFilter, statusFilter);
    }, 350);
  };

  const setDepartmentFilter = (newDept: string) => {
    setDepartmentFilterState(newDept);
    setProgramFilterState('ALL');
    setSectionFilterState('ALL');
    setPageState(0);
  };

  const setProgramFilter = (newProg: string) => {
    setProgramFilterState(newProg);
    setSectionFilterState('ALL');
    setPageState(0);
  };

  const setSectionFilter = (newSec: string) => {
    setSectionFilterState(newSec);
    setPageState(0);
  };

  const setStatusFilter = (newStatus: string) => {
    setStatusFilterState(newStatus);
    setPageState(0);
  };

  const setPage = (newPage: number) => {
    setPageState(newPage);
  };

  const refresh = () => {
    fetchStudents(page, search, departmentFilter, programFilter, sectionFilter, statusFilter);
    loadReferenceData();
  };

  const createStudent = async (data: CreateStudentData): Promise<StudentSummary> => {
    const res = await adminStudentApi.createStudent(data);
    refresh();
    return res.data;
  };

  const updateStudent = async (id: number, data: UpdateStudentData): Promise<StudentSummary> => {
    const res = await adminStudentApi.updateStudent(id, data);
    setStudents((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    return res.data;
  };

  const updateStatus = async (id: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): Promise<StudentSummary> => {
    const res = await adminStudentApi.updateStudentStatus(id, status);
    setStudents((prev) => prev.map((s) => (s.id === id ? res.data : s)));
    return res.data;
  };

  const getStudentDetails = async (id: number): Promise<StudentDetails> => {
    const res = await adminStudentApi.getStudentById(id);
    return res.data;
  };

  return {
    students,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    departmentFilter,
    programFilter,
    sectionFilter,
    statusFilter,
    referenceData,
    loadingRefData,
    setSearch,
    setDepartmentFilter,
    setProgramFilter,
    setSectionFilter,
    setStatusFilter,
    setPage,
    refresh,
    loadReferenceData,
    createStudent,
    updateStudent,
    updateStatus,
    getStudentDetails,
  };
};
