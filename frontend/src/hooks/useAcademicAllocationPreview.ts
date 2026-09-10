import { useState, useCallback } from 'react';
import { academicAllocationApi } from '../services/api/academicAllocationApi';
import {
  AcademicAllocationPreviewDto,
  PreviewAcademicAllocationRequest,
} from '../types/academicAllocation';

export const useAcademicAllocationPreview = () => {
  const [preview, setPreview] = useState<AcademicAllocationPreviewDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = useCallback(async (params: PreviewAcademicAllocationRequest) => {
    try {
      setLoading(true);
      setError(null);
      const res = await academicAllocationApi.previewAllocation(params);
      if (res.success && res.data) {
        setPreview(res.data);
      }
      return res.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to evaluate candidate preview';
      setError(msg);
      setPreview(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPreview = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return {
    preview,
    loading,
    error,
    fetchPreview,
    resetPreview,
  };
};
