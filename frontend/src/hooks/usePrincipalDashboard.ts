import { useState, useEffect, useCallback } from 'react';
import { principalApi } from '../services/api/principalApi';
import { PrincipalDashboardResponse } from '../types/principal';

export const usePrincipalDashboard = () => {
  const [data, setData] = useState<PrincipalDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await principalApi.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to retrieve Principal institution dashboard data');
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('You do not have permission to access this institution dashboard.');
      } else if (err?.response?.status === 401) {
        setError('Session expired or unauthorized. Please sign in again.');
      } else {
        setError(
          err?.response?.data?.message || err?.message || 'Unable to connect to Principal institution dashboard service.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
};
