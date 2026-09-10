import { useState, useEffect, useCallback } from 'react';
import { FacultyTimetableResponse, FacultyTimetableEntry } from '../types/faculty';
import { facultyTimetableApi } from '../services/api/facultyTimetableApi';

export const useFacultyTimetable = () => {
  const [timetableData, setTimetableData] = useState<FacultyTimetableResponse | null>(null);
  const [todayClasses, setTodayClasses] = useState<FacultyTimetableEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [dayOfWeek, setDayOfWeek] = useState<string>('ALL');
  const [subjectId, setSubjectId] = useState<number | undefined>(undefined);
  const [sectionId, setSectionId] = useState<number | undefined>(undefined);
  const [todayOnly, setTodayOnly] = useState<boolean>(false);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await facultyTimetableApi.getTimetable({
        dayOfWeek: dayOfWeek !== 'ALL' ? dayOfWeek : undefined,
        subjectId,
        sectionId,
        todayOnly,
      });

      if (res.success && res.data) {
        setTimetableData(res.data);
        setTodayClasses(res.data.todayEntries || []);
      } else {
        setError(res.message || 'Failed to load faculty timetable.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to timetable service.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [dayOfWeek, subjectId, sectionId, todayOnly]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const resetFilters = useCallback(() => {
    setDayOfWeek('ALL');
    setSubjectId(undefined);
    setSectionId(undefined);
    setTodayOnly(false);
  }, []);

  return {
    timetableData,
    todayClasses,
    loading,
    error,
    dayOfWeek,
    setDayOfWeek,
    subjectId,
    setSubjectId,
    sectionId,
    setSectionId,
    todayOnly,
    setTodayOnly,
    resetFilters,
    refresh: fetchTimetable,
  };
};
