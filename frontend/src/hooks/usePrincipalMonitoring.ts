import { useState, useEffect, useCallback } from 'react';
import { principalApi } from '../services/api/principalApi';
import { PrincipalMonitoringResponse } from '../types/principal';

export const usePrincipalMonitoring = () => {
  const [data, setData] = useState<PrincipalMonitoringResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMonitoring = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await principalApi.getMonitoring();
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to retrieve Principal institution monitoring data');
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError('You do not have permission to access this institution monitoring overview.');
      } else if (err?.response?.status === 401) {
        setError('Session expired or unauthorized. Please sign in again.');
      } else {
        setError(
          err?.response?.data?.message || err?.message || 'Unable to connect to Principal monitoring service.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitoring();
  }, [fetchMonitoring]);

  return {
    data,
    loading,
    error,
    refetch: fetchMonitoring,
  };
};
