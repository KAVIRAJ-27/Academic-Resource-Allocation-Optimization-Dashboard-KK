import { useState, useEffect, useCallback } from 'react';
import { facultyDashboardApi } from '../services/api/facultyDashboardApi';
import { FacultyDashboardData } from '../types/faculty';

export const useFacultyDashboard = () => {
  const [dashboard, setDashboard] = useState<FacultyDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await facultyDashboardApi.getDashboard();
      if (res.success && res.data) {
        setDashboard(res.data);
      } else {
        setError(res.message || 'Failed to retrieve faculty dashboard telemetry');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Unable to connect to faculty dashboard service'
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
