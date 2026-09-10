import { useState, useEffect, useCallback } from 'react';
import { FacultyWorkloadResponse } from '../types/faculty';
import { facultyWorkloadApi } from '../services/api/facultyWorkloadApi';

export const useFacultyWorkload = () => {
  const [data, setData] = useState<FacultyWorkloadResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await facultyWorkloadApi.getWorkload();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to load faculty workload information');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load faculty workload information'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkload();
  }, [fetchWorkload]);

  return {
    data,
    loading,
    error,
    refetch: fetchWorkload,
  };
};
