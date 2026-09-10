import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import { WardenHostelOption } from '../types/wardenAllocation';

export const useWardenHostels = () => {
  const [hostels, setHostels] = useState<WardenHostelOption[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<number | undefined>(() => {
    const saved = localStorage.getItem('ahrao_warden_selected_hostel');
    return saved ? Number(saved) : undefined;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHostels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getHostels();
      if (res.success && res.data) {
        setHostels(res.data);
        if (res.data.length > 0) {
          // If no hostel currently selected, or selected hostel is not in the list, default to first
          setSelectedHostelId((prev) => {
            const exists = res.data.some((h) => h.id === prev);
            const nextId = exists && prev !== undefined ? prev : res.data[0].id;
            localStorage.setItem('ahrao_warden_selected_hostel', String(nextId));
            return nextId;
          });
        } else {
          setSelectedHostelId(undefined);
          localStorage.removeItem('ahrao_warden_selected_hostel');
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load assigned hostels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHostels();
  }, [fetchHostels]);

  const selectHostel = useCallback((id: number) => {
    setSelectedHostelId(id);
    localStorage.setItem('ahrao_warden_selected_hostel', String(id));
  }, []);

  const selectedHostel = hostels.find((h) => h.id === selectedHostelId);

  return {
    hostels,
    selectedHostelId,
    selectedHostel,
    selectHostel,
    loading,
    error,
    refetch: fetchHostels,
  };
};
