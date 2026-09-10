import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import { WardenOverview } from '../types/wardenOperations';

export const useWardenOverview = (hostelId?: number) => {
  const [overview, setOverview] = useState<WardenOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getOverview(hostelId);
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load overview telemetry');
    } finally {
      setLoading(false);
    }
  }, [hostelId]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    overview,
    loading,
    error,
    refetch: fetchOverview,
  };
};
