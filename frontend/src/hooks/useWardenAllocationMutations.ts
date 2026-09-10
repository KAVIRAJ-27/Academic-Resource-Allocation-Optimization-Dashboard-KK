import { useState, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import { CreateHostelAllocationRequest, WardenAllocationSummary } from '../types/wardenAllocation';

export const useWardenAllocationMutations = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAllocation = useCallback(
    async (data: CreateHostelAllocationRequest): Promise<WardenAllocationSummary | null> => {
      try {
        setSubmitting(true);
        setError(null);
        const res = await wardenApi.createAllocation(data);
        if (res.success && res.data) {
          return res.data;
        }
        return null;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to create allocation';
        setError(msg);
        throw new Error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const releaseAllocation = useCallback(
    async (allocationId: number): Promise<WardenAllocationSummary | null> => {
      try {
        setSubmitting(true);
        setError(null);
        const res = await wardenApi.releaseAllocation(allocationId);
        if (res.success && res.data) {
          return res.data;
        }
        return null;
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Failed to release allocation';
        setError(msg);
        throw new Error(msg);
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return {
    submitting,
    error,
    clearError: () => setError(null),
    createAllocation,
    releaseAllocation,
  };
};
