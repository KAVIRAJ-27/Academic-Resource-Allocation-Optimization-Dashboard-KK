import { useState, useEffect, useCallback } from 'react';
import { academicAllocationApi } from '../services/api/academicAllocationApi';
import { AcademicAllocationDetailDto } from '../types/academicAllocation';

export const useAcademicAllocationDetail = (allocationId: number | null) => {
  const [allocation, setAllocation] = useState<AcademicAllocationDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!allocationId) {
      setAllocation(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await academicAllocationApi.getAllocationById(allocationId);
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
    fetchDetail();
  }, [fetchDetail]);

  return {
    allocation,
    loading,
    error,
    refetch: fetchDetail,
  };
};
