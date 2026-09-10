import { useState, useEffect, useCallback } from 'react';
import { facultyProfileApi } from '../services/api/facultyProfileApi';
import { FacultyProfile, UpdateFacultyProfilePayload } from '../types/faculty';

export const useFacultyProfile = () => {
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await facultyProfileApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        setError(res.message || 'Failed to retrieve faculty profile');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to connect to faculty profile service');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (payload: UpdateFacultyProfilePayload): Promise<boolean> => {
    try {
      setUpdating(true);
      setUpdateError(null);
      const res = await facultyProfileApi.updateProfile(payload);
      if (res.success && res.data) {
        setProfile(res.data);
        return true;
      } else {
        setUpdateError(res.message || 'Failed to update faculty profile');
        return false;
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Profile update failed';
      setUpdateError(msg);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    updating,
    updateError,
    fetchProfile,
    updateProfile,
  };
};
