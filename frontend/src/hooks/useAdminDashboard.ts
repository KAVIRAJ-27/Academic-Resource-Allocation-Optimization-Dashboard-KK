import { useState, useEffect, useCallback } from 'react';
import { adminDashboardApi } from '../services/api/adminDashboardApi';
import { AdminDashboardOverview } from '../types/dashboard';

interface UseAdminDashboardResult {
  data: AdminDashboardOverview | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useAdminDashboard = (): UseAdminDashboardResult => {
  const [data, setData] = useState<AdminDashboardOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (isSilentRefresh = false) => {
    if (isSilentRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await adminDashboardApi.getOverview();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || 'Failed to retrieve administrative dashboard overview');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
      if (errorObj.response?.status === 403) {
        setError('Access denied. Administrator privileges are required to view this dashboard.');
      } else if (errorObj.response?.data?.message) {
        setError(errorObj.response.data.message);
      } else if (errorObj.message) {
        setError(errorObj.message);
      } else {
        setError('Unable to connect to the central management service. Please check your network or try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview(false);
  }, [fetchOverview]);

  const refresh = useCallback(async () => {
    await fetchOverview(true);
  }, [fetchOverview]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
  };
};
