import { useState, useEffect, useCallback } from 'react';
import { StudentHostelResponse } from '../types/studentHostel';
import { studentHostelApi } from '../services/api/studentHostelApi';

export const useStudentHostel = () => {
  const [data, setData] = useState<StudentHostelResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHostel = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentHostelApi.getHostel();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to retrieve hostel information.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to hostel service.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHostel();
  }, [fetchHostel]);

  return {
    data,
    loading,
    error,
    refresh: fetchHostel,
  };
};
