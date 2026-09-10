import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import { WardenAllocationDetail } from '../types/wardenAllocation';

export const useWardenAllocationDetail = (allocationId: number | undefined) => {
  const [allocation, setAllocation] = useState<WardenAllocationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllocation = useCallback(async () => {
    if (!allocationId || isNaN(allocationId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getAllocation(allocationId);
      if (res.success && res.data) {
        setAllocation(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load allocation details');
      setAllocation(null);
    } finally {
      setLoading(false);
    }
  }, [allocationId]);

  useEffect(() => {
    fetchAllocation();
  }, [fetchAllocation]);

  return {
    allocation,
    loading,
    error,
    refetch: fetchAllocation,
  };
};
