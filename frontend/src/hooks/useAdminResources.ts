import { useState, useEffect, useCallback, useRef } from 'react';
import {
  adminResourceApi,
  ResourceCategoryItem,
  CreateResourceCategoryRequest,
  UpdateResourceCategoryRequest,
  ResourceSummaryItem,
  CreateResourceRequest,
  UpdateResourceRequest,
  ClassroomSummaryItem,
  CreateClassroomRequest,
  UpdateClassroomRequest,
  LaboratorySummaryItem,
  CreateLaboratoryRequest,
  UpdateLaboratoryRequest,
  EquipmentSummaryItem,
  CreateEquipmentRequest,
  UpdateEquipmentRequest,
  TimeSlotSummaryItem,
  CreateTimeSlotRequest,
  UpdateTimeSlotRequest,
  ResourceOverviewData,
  ResourceReferenceData,
  ResourceStatusType,
  EquipmentStatusType
} from '../services/api/adminResourceApi';
import { PagedResponse } from '../types/api';

// ============================================================================
// 1. OVERVIEW HOOK
// ============================================================================
export const useResourceOverview = () => {
  const [overview, setOverview] = useState<ResourceOverviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminResourceApi.getOverview();
      setOverview(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch resource overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { overview, loading, error, refetchOverview: fetchOverview };
};

// ============================================================================
// 2. REFERENCE DATA HOOK
// ============================================================================
export const useResourceReferenceData = () => {
  const [referenceData, setReferenceData] = useState<ResourceReferenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReferenceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminResourceApi.getReferenceData();
      setReferenceData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load reference data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  return { referenceData, loading, error, refetchReferenceData: fetchReferenceData };
};

// ============================================================================
// 3. RESOURCE CATEGORIES HOOK
// ============================================================================
export const useResourceCategories = (initialPage = 0, initialSize = 10) => {
  const [data, setData] = useState<PagedResponse<ResourceCategoryItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('ASC');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminResourceApi.getCategories({
        search: search.trim() || undefined,
        status: status || undefined,
        page,
        size,
        sortBy,
        sortDir
      });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, status, sortBy, sortDir]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (req: CreateResourceCategoryRequest) => {
    const res = await adminResourceApi.createCategory(req);
    await fetchCategories();
    return res.data;
  };

  const updateCategory = async (id: number, req: UpdateResourceCategoryRequest) => {
    const res = await adminResourceApi.updateCategory(id, req);
    await fetchCategories();
    return res.data;
  };

  const changeStatus = async (id: number, newStatus: 'ACTIVE' | 'INACTIVE') => {
    const res = await adminResourceApi.changeCategoryStatus(id, newStatus);
    await fetchCategories();
    return res.data;
  };

  const deleteCategory = async (id: number) => {
    await adminResourceApi.deleteCategory(id);
    await fetchCategories();
  };

  return {
    data,
    loading,
    error,
    page,
    setPage,
    size,
    setSize,
    search,
    setSearch,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    changeStatus,
    deleteCategory
  };
};

// ============================================================================
// 4. ACADEMIC RESOURCES HOOK
// ============================================================================
export const useAdminResources = (initialPage = 0, initialSize = 10) => {
  const [data, setData] = useState<PagedResponse<ResourceSummaryItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [status, setStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('ASC');

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminResourceApi.getResources({
        search: search.trim() || undefined,
        categoryId: categoryId || undefined,
        departmentId: departmentId || undefined,
        status: status || undefined,
        page,
        size,
        sortBy,
        sortDir
      });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, categoryId, departmentId, status, sortBy, sortDir]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const createResource = async (req: CreateResourceRequest) => {
    const res = await adminResourceApi.createResource(req);
    await fetchResources();
    return res.data;
  };

  const updateResource = async (id: number, req: UpdateResourceRequest) => {
    const res = await adminResourceApi.updateResource(id, req);
    await fetchResources();
    return res.data;
  };

  const changeStatus = async (id: number, newStatus: ResourceStatusType) => {
    const res = await adminResourceApi.changeResourceStatus(id, newStatus);
    await fetchResources();
    return res.data;
  };

  const deleteResource = async (id: number) => {
    await adminResourceApi.deleteResource(id);
    await fetchResources();
  };

  return {
    data,
    loading,
    error,
    page,
    setPage,
    size,
    setSize,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    departmentId,
    setDepartmentId,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    refetch: fetchResources,
    createResource,
    updateResource,
    changeStatus,
    deleteResource
  };
};

// ============================================================================
// 5. CLASSROOMS HOOK
// ============================================================================
export const useAdminClassrooms = (initialPage = 0, initialSize = 10) => {
  const [data, setData] = useState<PagedResponse<ClassroomSummaryItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [search, setSearch] = useState('');
  const [building, setBuilding] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('building');
  const [sortDir, setSortDir] = useState('ASC');

  const fetchClassrooms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminResourceApi.getClassrooms({
        search: search.trim() || undefined,
        building: building.trim() || undefined,
        status: status || undefined,
        page,
        size,
        sortBy,
        sortDir
      });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch classrooms');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, building, status, sortBy, sortDir]);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const createClassroom = async (req: CreateClassroomRequest) => {
    const res = await adminResourceApi.createClassroom(req);
    await fetchClassrooms();
    return res.data;
  };

  const updateClassroom = async (id: number, req: UpdateClassroomRequest) => {
    const res = await adminResourceApi.updateClassroom(id, req);
    await fetchClassrooms();
    return res.data;
  };

  const changeStatus = async (id: number, newStatus: ResourceStatusType) => {
    const res = await adminResourceApi.changeClassroomStatus(id, newStatus);
    await fetchClassrooms();
    return res.data;
  };

  const deleteClassroom = async (id: number) => {
    await adminResourceApi.deleteClassroom(id);
    await fetchClassrooms();
  };

  return {
    data,
    loading,
    error,
    page,
    setPage,
    size,
    setSize,
    search,
    setSearch,
    building,
    setBuilding,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    refetch: fetchClassrooms,
    createClassroom,
    updateClassroom,
    changeStatus,
    deleteClassroom
  };
};

// ============================================================================
// 6. LABORATORIES HOOK
// ============================================================================
export const useAdminLaboratories = (initialPage = 0, initialSize = 10) => {
  const [data, setData] = useState<PagedResponse<LaboratorySummaryItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [building, setBuilding] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('building');
  const [sortDir, setSortDir] = useState('ASC');

  const fetchLaboratories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminResourceApi.getLaboratories({
        search: search.trim() || undefined,
        departmentId: departmentId || undefined,
        building: building.trim() || undefined,
        status: status || undefined,
        page,
        size,
        sortBy,
        sortDir
      });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch laboratories');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, departmentId, building, status, sortBy, sortDir]);

  useEffect(() => {
    fetchLaboratories();
  }, [fetchLaboratories]);

  const createLaboratory = async (req: CreateLaboratoryRequest) => {
    const res = await adminResourceApi.createLaboratory(req);
    await fetchLaboratories();
    return res.data;
  };

  const updateLaboratory = async (id: number, req: UpdateLaboratoryRequest) => {
    const res = await adminResourceApi.updateLaboratory(id, req);
    await fetchLaboratories();
    return res.data;
  };

  const changeStatus = async (id: number, newStatus: ResourceStatusType) => {
    const res = await adminResourceApi.changeLaboratoryStatus(id, newStatus);
    await fetchLaboratories();
    return res.data;
  };

  const deleteLaboratory = async (id: number) => {
    await adminResourceApi.deleteLaboratory(id);
    await fetchLaboratories();
  };

  return {
    data,
    loading,
    error,
    page,
    setPage,
    size,
    setSize,
    search,
    setSearch,
    departmentId,
    setDepartmentId,
    building,
    setBuilding,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    refetch: fetchLaboratories,
    createLaboratory,
    updateLaboratory,
    changeStatus,
    deleteLaboratory
  };
};

// ============================================================================
// 7. EQUIPMENT HOOK
// ============================================================================
export const useAdminEquipment = (initialPage = 0, initialSize = 10) => {
  const [data, setData] = useState<PagedResponse<EquipmentSummaryItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [search, setSearch] = useState('');
  const [resourceId, setResourceId] = useState<number | undefined>();
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('serialNumber');
  const [sortDir, setSortDir] = useState('ASC');

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminResourceApi.getEquipment({
        search: search.trim() || undefined,
        resourceId: resourceId || undefined,
        status: status || undefined,
        page,
        size,
        sortBy,
        sortDir
      });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch equipment');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, resourceId, status, sortBy, sortDir]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const createEquipment = async (req: CreateEquipmentRequest) => {
    const res = await adminResourceApi.createEquipment(req);
    await fetchEquipment();
    return res.data;
  };

  const updateEquipment = async (id: number, req: UpdateEquipmentRequest) => {
    const res = await adminResourceApi.updateEquipment(id, req);
    await fetchEquipment();
    return res.data;
  };

  const changeStatus = async (id: number, newStatus: EquipmentStatusType) => {
    const res = await adminResourceApi.changeEquipmentStatus(id, newStatus);
    await fetchEquipment();
    return res.data;
  };

  const deleteEquipment = async (id: number) => {
    await adminResourceApi.deleteEquipment(id);
    await fetchEquipment();
  };

  return {
    data,
    loading,
    error,
    page,
    setPage,
    size,
    setSize,
    search,
    setSearch,
    resourceId,
    setResourceId,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    refetch: fetchEquipment,
    createEquipment,
    updateEquipment,
    changeStatus,
    deleteEquipment
  };
};

// ============================================================================
// 8. TIME SLOTS HOOK
// ============================================================================
export const useAdminTimeSlots = (initialPage = 0, initialSize = 10) => {
  const [data, setData] = useState<PagedResponse<TimeSlotSummaryItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(initialPage);
  const [size, setSize] = useState(initialSize);
  const [search, setSearch] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('startTime');
  const [sortDir, setSortDir] = useState('ASC');

  const fetchTimeSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminResourceApi.getTimeSlots({
        search: search.trim() || undefined,
        dayOfWeek: dayOfWeek || undefined,
        status: status || undefined,
        page,
        size,
        sortBy,
        sortDir
      });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch time slots');
    } finally {
      setLoading(false);
    }
  }, [page, size, search, dayOfWeek, status, sortBy, sortDir]);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  const createTimeSlot = async (req: CreateTimeSlotRequest) => {
    const res = await adminResourceApi.createTimeSlot(req);
    await fetchTimeSlots();
    return res.data;
  };

  const updateTimeSlot = async (id: number, req: UpdateTimeSlotRequest) => {
    const res = await adminResourceApi.updateTimeSlot(id, req);
    await fetchTimeSlots();
    return res.data;
  };

  const changeStatus = async (id: number, newStatus: 'ACTIVE' | 'INACTIVE') => {
    const res = await adminResourceApi.changeTimeSlotStatus(id, newStatus);
    await fetchTimeSlots();
    return res.data;
  };

  const deleteTimeSlot = async (id: number) => {
    await adminResourceApi.deleteTimeSlot(id);
    await fetchTimeSlots();
  };

  return {
    data,
    loading,
    error,
    page,
    setPage,
    size,
    setSize,
    search,
    setSearch,
    dayOfWeek,
    setDayOfWeek,
    status,
    setStatus,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    refetch: fetchTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    changeStatus,
    deleteTimeSlot
  };
};
