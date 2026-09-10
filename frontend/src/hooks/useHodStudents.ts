import { useState, useEffect, useCallback, useRef } from 'react';
import {
  hodApi,
  StudentQueryParams,
} from '../services/api/hodApi';
import {
  HodStudentSummary,
  HodStudentDetail,
  HodUpdateStudentRequest,
  HodUpdateStatusRequest,
  HodStudentReferenceData,
} from '../types/hod';

export interface UseHodStudentsReturn {
  students: HodStudentSummary[];
  loading: boolean;
  error: string | null;
  page: number; // 0-based
  size: number;
  totalElements: number;
  totalPages: number;
  search: string;
  statusFilter: string;
  programFilter: number | null;
  sectionFilter: number | null;
  semesterFilter: number | null;
  referenceData: HodStudentReferenceData | null;
  selectedStudent: HodStudentDetail | null;
  detailLoading: boolean;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setProgramFilter: (programId: number | null) => void;
  setSectionFilter: (sectionId: number | null) => void;
  setSemesterFilter: (semester: number | null) => void;
  setPage: (page: number) => void;
  refresh: () => void;
  updateStatus: (id: number, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING', reason?: string) => Promise<HodStudentSummary>;
  updateProfile: (id: number, data: HodUpdateStudentRequest) => Promise<HodStudentDetail>;
  viewStudentDetail: (id: number) => Promise<void>;
  closeStudentDetail: () => void;
}

export const useHodStudents = (initialPageSize = 10): UseHodStudentsReturn => {
  const [students, setStudents] = useState<HodStudentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPageState] = useState(0);
  const [size] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearchState] = useState('');
  const [statusFilter, setStatusFilterState] = useState('ALL');
  const [programFilter, setProgramFilterState] = useState<number | null>(null);
  const [sectionFilter, setSectionFilterState] = useState<number | null>(null);
  const [semesterFilter, setSemesterFilterState] = useState<number | null>(null);

  const [referenceData, setReferenceData] = useState<HodStudentReferenceData | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<HodStudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch reference data on mount
  useEffect(() => {
    let isMounted = true;
    const loadRefData = async () => {
      try {
        const res = await hodApi.getStudentReferenceData();
        if (isMounted && res.success && res.data) {
          setReferenceData(res.data);
        }
      } catch (err) {
        console.error('Failed to load student reference data:', err);
      }
    };
    loadRefData();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchStudents = useCallback(
    async (
      currentPage: number,
      currentSearch: string,
      currentStatus: string,
      currentProg: number | null,
      currentSec: number | null,
      currentSem: number | null
    ) => {
      setLoading(true);
      setError(null);
      try {
        const params: StudentQueryParams = {
          page: currentPage,
          size,
          sort: 'id,desc',
        };
        if (currentSearch.trim()) params.search = currentSearch.trim();
        if (currentStatus !== 'ALL') params.status = currentStatus;
        if (currentProg !== null) params.programId = currentProg;
        if (currentSec !== null) params.sectionId = currentSec;
        if (currentSem !== null) params.semester = currentSem;

        const res = await hodApi.getStudents(params);
        if (res.success && res.data) {
          setStudents(res.data.content || []);
          setTotalElements(res.data.totalElements || 0);
          setTotalPages(res.data.totalPages || 0);
        } else {
          setError(res.message || 'Failed to load department students');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Error fetching department students');
      } finally {
        setLoading(false);
      }
    },
    [size]
  );

  useEffect(() => {
    fetchStudents(page, search, statusFilter, programFilter, sectionFilter, semesterFilter);
  }, [page, statusFilter, programFilter, sectionFilter, semesterFilter, fetchStudents]);

  const setSearch = (newSearch: string) => {
    setSearchState(newSearch);
    setPageState(0);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchStudents(0, newSearch, statusFilter, programFilter, sectionFilter, semesterFilter);
    }, 400);
  };

  const setStatusFilter = (status: string) => {
    setStatusFilterState(status);
    setPageState(0);
  };

  const setProgramFilter = (programId: number | null) => {
    setProgramFilterState(programId);
    setSectionFilterState(null); // Reset section when program changes
    setPageState(0);
  };

  const setSectionFilter = (sectionId: number | null) => {
    setSectionFilterState(sectionId);
    setPageState(0);
  };

  const setSemesterFilter = (semester: number | null) => {
    setSemesterFilterState(semester);
    setPageState(0);
  };

  const setPage = (newPage: number) => {
    setPageState(newPage);
  };

  const refresh = () => {
    fetchStudents(page, search, statusFilter, programFilter, sectionFilter, semesterFilter);
  };

  const updateStatus = async (
    id: number,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING',
    reason?: string
  ): Promise<HodStudentSummary> => {
    const payload: HodUpdateStatusRequest = { status, reason };
    const res = await hodApi.updateStudentStatus(id, payload);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update student status');
    }
    refresh();
    return res.data;
  };

  const updateProfile = async (id: number, data: HodUpdateStudentRequest): Promise<HodStudentDetail> => {
    const res = await hodApi.updateStudentProfile(id, data);
    if (!res.success || !res.data) {
      throw new Error(res.message || 'Failed to update student profile');
    }
    refresh();
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent(res.data);
    }
    return res.data;
  };

  const viewStudentDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await hodApi.getStudentById(id);
      if (res.success && res.data) {
        setSelectedStudent(res.data);
      } else {
        throw new Error(res.message || 'Failed to load student details');
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error fetching student details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeStudentDetail = () => {
    setSelectedStudent(null);
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
    statusFilter,
    programFilter,
    sectionFilter,
    semesterFilter,
    referenceData,
    selectedStudent,
    detailLoading,
    setSearch,
    setStatusFilter,
    setProgramFilter,
    setSectionFilter,
    setSemesterFilter,
    setPage,
    refresh,
    updateStatus,
    updateProfile,
    viewStudentDetail,
    closeStudentDetail,
  };
};
