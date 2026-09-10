import { useState, useEffect, useCallback } from 'react';
import { FacultyAcademicOverview, FacultyCourse } from '../types/faculty';
import { facultyAcademicApi } from '../services/api/facultyAcademicApi';

export const useFacultyAcademics = () => {
  const [overview, setOverview] = useState<FacultyAcademicOverview | null>(null);
  const [courses, setCourses] = useState<FacultyCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAcademics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, coursesRes] = await Promise.all([
        facultyAcademicApi.getAcademicOverview(),
        facultyAcademicApi.getAssignedCourses(),
      ]);

      if (overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data);
      } else {
        setError(overviewRes.message || 'Failed to load faculty academic overview.');
      }

      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to academic services.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcademics();
  }, [fetchAcademics]);

  return {
    overview,
    courses,
    loading,
    error,
    refresh: fetchAcademics,
  };
};
