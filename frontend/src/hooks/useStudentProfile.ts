import { useState, useEffect, useCallback } from 'react';
import { studentApi } from '../services/api/studentApi';
import { StudentProfile, StudentProfileUpdateRequest } from '../types/student';

export const useStudentProfile = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        setError(res.message || 'Failed to retrieve student profile');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to connect to profile service');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (data: StudentProfileUpdateRequest): Promise<boolean> => {
    try {
      setUpdating(true);
      setUpdateError(null);
      const res = await studentApi.updateProfile(data);
      if (res.success && res.data) {
        setProfile(res.data);
        return true;
      } else {
        setUpdateError(res.message || 'Failed to update profile');
        return false;
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Update failed';
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
