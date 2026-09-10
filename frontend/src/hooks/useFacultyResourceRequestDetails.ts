import { useState, useEffect, useCallback } from 'react';
import { FacultyResourceRequestDetails } from '../types/faculty';
import { facultyResourceRequestApi } from '../services/api/facultyResourceRequestApi';

export const useFacultyResourceRequestDetails = (id: number | null) => {
  const [request, setRequest] = useState<FacultyResourceRequestDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (id === null || isNaN(id)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await facultyResourceRequestApi.getRequestById(id);
      if (res.success && res.data) {
        setRequest(res.data);
      } else {
        setError(res.message || 'Failed to load request details');
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load resource request details'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const cancelRequest = async (): Promise<boolean> => {
    if (!id) return false;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await facultyResourceRequestApi.cancelRequest(id);
      if (res.success) {
        await fetchDetails();
        return true;
      } else {
        setCancelError(res.message || 'Failed to cancel request');
        return false;
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to cancel resource request';
      setCancelError(msg);
      return false;
    } finally {
      setCancelling(false);
    }
  };

  return {
    request,
    loading,
    error,
    cancelling,
    cancelError,
    cancelRequest,
    refetch: fetchDetails,
  };
};
