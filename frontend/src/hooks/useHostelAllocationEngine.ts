import { useState, useCallback } from 'react';
import { hostelAllocationApi } from '../services/api/hostelAllocationApi';
import {
  HostelAllocationPreviewDto,
  HostelAllocationResponseDto,
  HostelAllocationRequestDto,
  AutoHostelAllocationRequestDto,
  HostelAllocationPreviewRequestDto,
} from '../types/hostelAllocation';

export const useHostelAllocationEngine = () => {
  const [preview, setPreview] = useState<HostelAllocationPreviewDto | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPreview = useCallback(async (request: HostelAllocationPreviewRequestDto): Promise<HostelAllocationPreviewDto | null> => {
    try {
      setPreviewLoading(true);
      setError(null);
      const res = await hostelAllocationApi.previewAllocation(request);
      if (res.success && res.data) {
        setPreview(res.data);
        return res.data;
      }
      return null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to simulate allocation preview';
      setError(msg);
      return null;
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  const autoAllocate = useCallback(async (request: AutoHostelAllocationRequestDto): Promise<HostelAllocationResponseDto | null> => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await hostelAllocationApi.autoAllocate(request);
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to auto-allocate bed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const manualAllocate = useCallback(async (request: HostelAllocationRequestDto): Promise<HostelAllocationResponseDto | null> => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await hostelAllocationApi.allocate(request);
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to allocate bed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return {
    preview,
    previewLoading,
    actionLoading,
    error,
    runPreview,
    autoAllocate,
    manualAllocate,
    resetState,
  };
};
