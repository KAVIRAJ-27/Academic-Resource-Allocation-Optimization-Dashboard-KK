import { useState, useEffect, useCallback } from 'react';
import {
  FacultyAvailableResource,
  FacultySubject,
  CreateFacultyResourceRequestPayload,
  FacultyResourceRequestItem,
} from '../types/faculty';
import { facultyResourceRequestApi } from '../services/api/facultyResourceRequestApi';
import { facultySubjectApi } from '../services/api/facultySubjectApi';

export const useCreateFacultyResourceRequest = () => {
  const [resources, setResources] = useState<FacultyAvailableResource[]>([]);
  const [subjects, setSubjects] = useState<FacultySubject[]>([]);
  const [loadingResources, setLoadingResources] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = useCallback(async (categoryId?: number) => {
    setLoadingResources(true);
    try {
      const res = await facultyResourceRequestApi.getAvailableResources(categoryId);
      if (res.success && res.data) {
        setResources(res.data);
      }
    } catch {
      // Keep empty if failed
    } finally {
      setLoadingResources(false);
    }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await facultySubjectApi.getSubjects({ size: 100 });
      if (res.success && res.data?.content) {
        setSubjects(res.data.content);
      }
    } catch {
      // Non-critical; academic context is optional
    }
  }, []);

  useEffect(() => {
    fetchResources();
    fetchSubjects();
  }, [fetchResources, fetchSubjects]);

  const submitRequest = async (
    payload: CreateFacultyResourceRequestPayload
  ): Promise<FacultyResourceRequestItem | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await facultyResourceRequestApi.createRequest(payload);
      if (res.success && res.data) {
        return res.data;
      } else {
        setError(res.message || 'Failed to submit resource request');
        return null;
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit resource request';
      setError(msg);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    resources,
    subjects,
    loadingResources,
    submitting,
    error,
    fetchResources,
    submitRequest,
  };
};
