import { useState, useEffect, useCallback } from 'react';
import { FacultySubject } from '../types/faculty';
import { facultySubjectApi } from '../services/api/facultySubjectApi';

export const useFacultySubjects = (initialPageSize: number = 10) => {
  const [subjects, setSubjects] = useState<FacultySubject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [programId, setProgramId] = useState<number | undefined>(undefined);
  const [semester, setSemester] = useState<number | undefined>(undefined);

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await facultySubjectApi.getSubjects({
        search: search.trim() || undefined,
        programId: programId || undefined,
        semester: semester || undefined,
        page,
        size: pageSize,
      });

      if (res.success && res.data) {
        setSubjects(res.data.content || []);
        setTotalElements(res.data.totalElements);
        setTotalPages(res.data.totalPages);
      } else {
        setError(res.message || 'Failed to load assigned subjects.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to subject services.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, programId, semester, page, pageSize]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setProgramId(undefined);
    setSemester(undefined);
    setPage(0);
  }, []);

  return {
    subjects,
    loading,
    error,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalElements,
    totalPages,
    search,
    setSearch: (val: string) => {
      setSearch(val);
      setPage(0);
    },
    programId,
    setProgramId: (val?: number) => {
      setProgramId(val);
      setPage(0);
    },
    semester,
    setSemester: (val?: number) => {
      setSemester(val);
      setPage(0);
    },
    resetFilters,
    refresh: fetchSubjects,
  };
};
