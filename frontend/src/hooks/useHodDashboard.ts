import { useState, useEffect, useCallback } from 'react';
import { hodDashboardApi } from '../services/api/hodDashboardApi';
import { HodDashboardResponse } from '../types/hod';

export const useHodDashboard = () => {
  const [dashboard, setDashboard] = useState<HodDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await hodDashboardApi.getDashboard();
      if (res.success && res.data) {
        setDashboard(res.data);
      } else {
        setError(res.message || 'Failed to retrieve HOD department dashboard telemetry');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || 'Unable to connect to HOD department dashboard service'
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
