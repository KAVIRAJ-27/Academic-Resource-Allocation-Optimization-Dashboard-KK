import { useState, useEffect, useCallback } from 'react';
import { hodApi } from '../services/api/hodApi';
import {
  HodDepartmentWorkloadOverview,
  HodFacultyWorkloadDetail,
  HodDepartmentAssignmentItem,
} from '../types/hod';

export interface UseHodWorkloadReturn {
  overview: HodDepartmentWorkloadOverview | null;
  assignments: HodDepartmentAssignmentItem[];
  loading: boolean;
  error: string | null;
  activeTab: 'workload' | 'assignments';
  selectedFacultyWorkload: HodFacultyWorkloadDetail | null;
  detailLoading: boolean;
  setActiveTab: (tab: 'workload' | 'assignments') => void;
  refresh: () => void;
  viewFacultyWorkload: (facultyId: number) => Promise<void>;
  closeFacultyWorkload: () => void;
}

export const useHodWorkload = (): UseHodWorkloadReturn => {
  const [overview, setOverview] = useState<HodDepartmentWorkloadOverview | null>(null);
  const [assignments, setAssignments] = useState<HodDepartmentAssignmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workload' | 'assignments'>('workload');

  const [selectedFacultyWorkload, setSelectedFacultyWorkload] = useState<HodFacultyWorkloadDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchWorkloadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, assignmentsRes] = await Promise.all([
        hodApi.getWorkloadOverview(),
        hodApi.getDepartmentAssignments(),
      ]);

      if (overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data);
      } else {
        setError(overviewRes.message || 'Failed to load department workload');
      }

      if (assignmentsRes.success && assignmentsRes.data) {
        setAssignments(assignmentsRes.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error fetching department workload data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkloadData();
  }, [fetchWorkloadData]);

  const refresh = () => {
    fetchWorkloadData();
  };

  const viewFacultyWorkload = async (facultyId: number) => {
    setDetailLoading(true);
    try {
      const res = await hodApi.getFacultyWorkloadDetail(facultyId);
      if (res.success && res.data) {
        setSelectedFacultyWorkload(res.data);
      } else {
        throw new Error(res.message || 'Failed to load faculty workload details');
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error fetching faculty workload');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeFacultyWorkload = () => {
    setSelectedFacultyWorkload(null);
  };

  return {
    overview,
    assignments,
    loading,
    error,
    activeTab,
    selectedFacultyWorkload,
    detailLoading,
    setActiveTab,
    refresh,
    viewFacultyWorkload,
    closeFacultyWorkload,
  };
};
