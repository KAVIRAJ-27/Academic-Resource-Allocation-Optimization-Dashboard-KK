import { useState, useEffect, useCallback } from 'react';
import { FacultySubjectDetails } from '../types/faculty';
import { facultySubjectApi } from '../services/api/facultySubjectApi';

export const useFacultySubjectDetails = (subjectId?: number) => {
  const [details, setDetails] = useState<FacultySubjectDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!subjectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await facultySubjectApi.getSubjectDetails(subjectId);
      if (res.success && res.data) {
        setDetails(res.data);
      } else {
        setError(res.message || 'Failed to load subject details.');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || 'Subject details unavailable or unauthorized.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    details,
    loading,
    error,
    refresh: fetchDetails,
  };
};
