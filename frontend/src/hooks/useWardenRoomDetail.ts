import { useState, useEffect, useCallback } from 'react';
import { wardenApi } from '../services/api/wardenApi';
import { WardenRoomDetail } from '../types/wardenAllocation';

export const useWardenRoomDetail = (roomId: number | undefined) => {
  const [room, setRoom] = useState<WardenRoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoom = useCallback(async () => {
    if (!roomId || isNaN(roomId)) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await wardenApi.getRoom(roomId);
      if (res.success && res.data) {
        setRoom(res.data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load room details');
      setRoom(null);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  return {
    room,
    loading,
    error,
    refetch: fetchRoom,
  };
};
