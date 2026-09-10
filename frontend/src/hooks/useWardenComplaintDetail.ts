import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import { WardenComplaintDetail, UpdateComplaintStatusRequest } from '../types/wardenOperations';

export const useWardenComplaintDetail = (complaintId?: number | string) => {
  const [complaint, setComplaint] = useState<WardenComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!complaintId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getComplaint(Number(complaintId));
      if (res.success && res.data) {
        setComplaint(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load complaint details');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const updateStatus = useCallback(
    async (data: UpdateComplaintStatusRequest) => {
      if (!complaintId) return null;
      try {
        setMutating(true);
        const res = await wardenApi.updateComplaintStatus(Number(complaintId), data);
        if (res.success && res.data) {
          setComplaint(res.data);
          return res.data;
        }
        return null;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update complaint status';
        throw new Error(msg);
      } finally {
        setMutating(false);
      }
    },
    [complaintId]
  );

  return {
    complaint,
    loading,
    error,
    mutating,
    updateStatus,
    refetch: fetchDetail,
  };
};
