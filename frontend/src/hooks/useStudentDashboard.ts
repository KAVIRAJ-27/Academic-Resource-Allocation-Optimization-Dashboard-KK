import { useState, useEffect, useCallback } from 'react';
import { studentApi } from '../services/api/studentApi';
import { StudentDashboardData } from '../types/student';

export const useStudentDashboard = () => {
  const [dashboard, setDashboard] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getDashboard();
      if (res.success && res.data) {
        setDashboard(res.data);
      } else {
        setError(res.message || 'Failed to retrieve student dashboard data');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Unable to connect to dashboard service'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refresh: fetchDashboard,
  };
};
