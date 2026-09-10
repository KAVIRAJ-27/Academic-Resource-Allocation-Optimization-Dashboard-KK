import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import {
  WardenMaintenanceDetail,
  UpdateMaintenanceStatusRequest,
  AssignMaintenanceRequest,
} from '../types/wardenOperations';

export const useWardenMaintenanceDetail = (maintenanceId?: number | string) => {
  const [maintenance, setMaintenance] = useState<WardenMaintenanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutating, setMutating] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!maintenanceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getMaintenanceRequest(Number(maintenanceId));
      if (res.success && res.data) {
        setMaintenance(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load maintenance details');
      setMaintenance(null);
    } finally {
      setLoading(false);
    }
  }, [maintenanceId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const updateStatus = useCallback(
    async (data: UpdateMaintenanceStatusRequest) => {
      if (!maintenanceId) return null;
      try {
        setMutating(true);
        const res = await wardenApi.updateMaintenanceStatus(Number(maintenanceId), data);
        if (res.success && res.data) {
          setMaintenance(res.data);
          return res.data;
        }
        return null;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update maintenance status';
        throw new Error(msg);
      } finally {
        setMutating(false);
      }
    },
    [maintenanceId]
  );

  const assignTechnician = useCallback(
    async (data: AssignMaintenanceRequest) => {
      if (!maintenanceId) return null;
      try {
        setMutating(true);
        const res = await wardenApi.assignMaintenance(Number(maintenanceId), data);
        if (res.success && res.data) {
          setMaintenance(res.data);
          return res.data;
        }
        return null;
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to assign technician';
        throw new Error(msg);
      } finally {
        setMutating(false);
      }
    },
    [maintenanceId]
  );

  return {
    maintenance,
    loading,
    error,
    mutating,
    updateStatus,
    assignTechnician,
    refetch: fetchDetail,
  };
};
