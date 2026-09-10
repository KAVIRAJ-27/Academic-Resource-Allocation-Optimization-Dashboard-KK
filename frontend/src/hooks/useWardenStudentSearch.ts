import { useState, useEffect, useCallback, useRef } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import { WardenStudentSearch } from '../types/wardenAllocation';

export const useWardenStudentSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [programId, setProgramId] = useState<number | undefined>();
  const [students, setStudents] = useState<WardenStudentSearch[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const executeSearch = useCallback(
    async (query: string, dept?: number, prog?: number, p = 0) => {
      try {
        setLoading(true);
        setError(null);
        const res = await wardenApi.searchStudents({
          search: query.trim() || undefined,
          departmentId: dept,
          programId: prog,
          page: p,
          size: 10,
        });

        if (res.success && res.data) {
          setStudents(res.data.content);
          setTotalElements(res.data.totalElements);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to search students');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(searchTerm, departmentId, programId, page);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, departmentId, programId, page, executeSearch]);

  const onSearchChange = (term: string) => {
    setSearchTerm(term);
    setPage(0);
  };

  const onDepartmentChange = (dept?: number) => {
    setDepartmentId(dept);
    setPage(0);
  };

  const onProgramChange = (prog?: number) => {
    setProgramId(prog);
    setPage(0);
  };

  return {
    students,
    totalElements,
    loading,
    error,
    searchTerm,
    departmentId,
    programId,
    page,
    setPage,
    onSearchChange,
    onDepartmentChange,
    onProgramChange,
    refetch: () => executeSearch(searchTerm, departmentId, programId, page),
  };
};
