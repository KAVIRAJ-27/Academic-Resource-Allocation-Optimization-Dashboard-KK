import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StudentAcademicOverview,
  StudentSubject,
  StudentSubjectDetails,
  StudentTimetableEntry,
} from '../types/studentAcademic';
import { studentAcademicApi } from '../services/api/studentAcademicApi';

export const useStudentAcademics = () => {
  const [overview, setOverview] = useState<StudentAcademicOverview | null>(null);
  const [subjects, setSubjects] = useState<StudentSubject[]>([]);
  const [timetable, setTimetable] = useState<StudentTimetableEntry[]>([]);
  const [availableSemesters, setAvailableSemesters] = useState<number[]>([]);
  const [totalCredits, setTotalCredits] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  // Modal subject details
  const [selectedSubject, setSelectedSubject] = useState<StudentSubjectDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await studentAcademicApi.getAcademicOverview();
      if (res.success && res.data) {
        setOverview(res.data.overview);
        setSubjects(res.data.subjects || []);
        setTimetable(res.data.timetable || []);
        setAvailableSemesters(res.data.availableSemesters || []);
        setTotalCredits(res.data.totalCredits || 0);

        if (res.data.overview?.currentSemester) {
          setSelectedSemester(res.data.overview.currentSemester);
        }
      } else {
        setError(res.message || 'Failed to load academic records.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to academic services.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const fetchSubjectDetails = useCallback(async (subjectId: number) => {
    setDetailsLoading(true);
    setDetailsError(null);
    try {
      const res = await studentAcademicApi.getSubjectDetails(subjectId);
      if (res.success && res.data) {
        setSelectedSubject(res.data);
      } else {
        setDetailsError(res.message || 'Failed to retrieve subject details.');
      }
    } catch (err: any) {
      setDetailsError(err.response?.data?.message || err.message || 'Subject details unavailable.');
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const clearSelectedSubject = useCallback(() => {
    setSelectedSubject(null);
    setDetailsError(null);
  }, []);

  // Filtered subjects
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subj) => {
      // Semester filter
      if (selectedSemester !== undefined && selectedSemester !== null) {
        if (subj.semesterNumber !== undefined && subj.semesterNumber !== selectedSemester) {
          return false;
        }
      }

      // Type filter
      if (selectedType && selectedType !== 'ALL') {
        if (subj.subjectType !== selectedType) {
          return false;
        }
      }

      // Search filter (code or name)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const codeMatch = subj.code.toLowerCase().includes(term);
        const nameMatch = subj.name.toLowerCase().includes(term);
        const facultyMatch = subj.facultyName?.toLowerCase().includes(term);
        if (!codeMatch && !nameMatch && !facultyMatch) {
          return false;
        }
      }

      return true;
    });
  }, [subjects, selectedSemester, selectedType, searchTerm]);

  return {
    overview,
    subjects,
    filteredSubjects,
    timetable,
    availableSemesters,
    totalCredits,
    loading,
    error,
    refresh: fetchOverview,

    // Filters
    searchTerm,
    setSearchTerm,
    selectedSemester,
    setSelectedSemester,
    selectedType,
    setSelectedType,

    // Details Modal
    selectedSubject,
    detailsLoading,
    detailsError,
    fetchSubjectDetails,
    clearSelectedSubject,
  };
};
