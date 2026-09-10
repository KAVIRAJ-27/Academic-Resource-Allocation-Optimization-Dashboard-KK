import { useState, useCallback } from 'react';
import { academicAllocationApi } from '../services/api/academicAllocationApi';
import {
  CreateAcademicAllocationRequest,
  AutoAcademicAllocationRequest,
  AcademicAllocationDetailDto,
} from '../types/academicAllocation';

export const useAcademicAllocationMutations = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allocate = useCallback(
    async (request: CreateAcademicAllocationRequest): Promise<AcademicAllocationDetailDto> => {
      try {
        setSubmitting(true);
        setError(null);
        const res = await academicAllocationApi.allocateResource(request);
        if (res.success && res.data) {
          return res.data;
        }
        throw new Error(res.message || 'Failed to allocate academic resource');
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to allocate resource';
        setError(msg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const autoAllocate = useCallback(
    async (request: AutoAcademicAllocationRequest): Promise<AcademicAllocationDetailDto> => {
      try {
        setSubmitting(true);
        setError(null);
        const res = await academicAllocationApi.autoAllocateResource(request);
        if (res.success && res.data) {
          return res.data;
        }
        throw new Error(res.message || 'Failed to auto-allocate academic resource');
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to auto-allocate resource';
        setError(msg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  const cancel = useCallback(
    async (id: number, remarks?: string): Promise<AcademicAllocationDetailDto> => {
      try {
        setSubmitting(true);
        setError(null);
        const res = await academicAllocationApi.cancelAllocation(id, remarks);
        if (res.success && res.data) {
          return res.data;
        }
        throw new Error(res.message || 'Failed to cancel allocation');
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to cancel allocation';
        setError(msg);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return {
    allocate,
    autoAllocate,
    cancel,
    submitting,
    error,
    clearError: () => setError(null),
  };
};
