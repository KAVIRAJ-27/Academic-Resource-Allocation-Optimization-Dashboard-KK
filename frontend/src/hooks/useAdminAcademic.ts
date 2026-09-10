import { useState, useEffect, useCallback, useRef } from 'react';
import {
  adminAcademicApi,
  InstitutionResponse,
  UpdateInstitutionRequest,
  DepartmentSummary,
  DepartmentDetails,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  AcademicYearSummary,
  AcademicYearDetails,
  CreateAcademicYearRequest,
  UpdateAcademicYearRequest,
  SemesterSummary,
  SemesterDetails,
  CreateSemesterRequest,
  UpdateSemesterRequest,
  ProgramSummary,
  ProgramDetails,
  CreateProgramRequest,
  UpdateProgramRequest,
  SubjectSummary,
  SubjectDetails,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  SectionSummary,
  SectionDetails,
  CreateSectionRequest,
  UpdateSectionRequest,
  AcademicReferenceData
} from '../services/api/adminAcademicApi';

// ============================================================================
// 1. INSTITUTION HOOK
// ============================================================================
export const useAdminInstitution = () => {
  const [institution, setInstitution] = useState<InstitutionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInstitution = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminAcademicApi.getInstitution();
      setInstitution(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch institution profile');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInstitution = async (data: UpdateInstitutionRequest): Promise<InstitutionResponse> => {
    const res = await adminAcademicApi.updateInstitution(data);
    setInstitution(res.data);
    return res.data;
  };

  useEffect(() => {
    fetchInstitution();
  }, [fetchInstitution]);

  return { institution, loading, error, refresh: fetchInstitution, updateInstitution };
};

// ============================================================================
// 2. REFERENCE DATA HOOK
// ============================================================================
export const useAcademicReferenceData = () => {
  const [referenceData, setReferenceData] = useState<AcademicReferenceData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReference = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAcademicApi.getReferenceData();
      setReferenceData(res.data);
    } catch {
      // silently handle, form fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReference();
  }, [fetchReference]);

  return { referenceData, loading, refresh: fetchReference };
};

// ============================================================================
// 3. DEPARTMENTS HOOK
// ============================================================================
export const useAdminDepartments = (pageSize = 10) => {
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(pageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchDepartments = useCallback(async (p: number, s: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: p, size, sortBy: 'name', sortDir: 'ASC' };
      if (s.trim()) params.search = s.trim();
      if (status !== 'ALL') params.status = status;
      const res = await adminAcademicApi.getDepartments(params);
      setDepartments(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchDepartments(page, search, statusFilter);
    }, 250);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [page, search, statusFilter, fetchDepartments]);

  const refresh = () => fetchDepartments(page, search, statusFilter);

  return {
    departments,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    statusFilter,
    setPage,
    setSearch: (val: string) => { setSearch(val); setPage(0); },
    setStatusFilter: (val: string) => { setStatusFilter(val); setPage(0); },
    refresh,
    getDepartmentDetails: (id: number) => adminAcademicApi.getDepartmentById(id),
    createDepartment: async (data: CreateDepartmentRequest) => {
      const res = await adminAcademicApi.createDepartment(data);
      refresh();
      return res.data;
    },
    updateDepartment: async (id: number, data: UpdateDepartmentRequest) => {
      const res = await adminAcademicApi.updateDepartment(id, data);
      refresh();
      return res.data;
    },
    changeStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE') => {
      const res = await adminAcademicApi.changeDepartmentStatus(id, status);
      refresh();
      return res.data;
    },
    deleteDepartment: async (id: number) => {
      await adminAcademicApi.deleteDepartment(id);
      refresh();
    }
  };
};

// ============================================================================
// 4. ACADEMIC YEARS HOOK
// ============================================================================
export const useAdminAcademicYears = (pageSize = 10) => {
  const [years, setYears] = useState<AcademicYearSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(pageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchYears = useCallback(async (p: number, s: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: p, size, sortBy: 'startDate', sortDir: 'DESC' };
      if (s.trim()) params.search = s.trim();
      if (status !== 'ALL') params.status = status;
      const res = await adminAcademicApi.getAcademicYears(params);
      setYears(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch academic years');
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchYears(page, search, statusFilter);
    }, 250);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [page, search, statusFilter, fetchYears]);

  const refresh = () => fetchYears(page, search, statusFilter);

  return {
    years,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    statusFilter,
    setPage,
    setSearch: (val: string) => { setSearch(val); setPage(0); },
    setStatusFilter: (val: string) => { setStatusFilter(val); setPage(0); },
    refresh,
    getYearDetails: (id: number) => adminAcademicApi.getAcademicYearById(id),
    createYear: async (data: CreateAcademicYearRequest) => {
      const res = await adminAcademicApi.createAcademicYear(data);
      refresh();
      return res.data;
    },
    updateYear: async (id: number, data: UpdateAcademicYearRequest) => {
      const res = await adminAcademicApi.updateAcademicYear(id, data);
      refresh();
      return res.data;
    },
    changeStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE') => {
      const res = await adminAcademicApi.changeAcademicYearStatus(id, status);
      refresh();
      return res.data;
    },
    activateYear: async (id: number) => {
      const res = await adminAcademicApi.activateAcademicYear(id);
      refresh();
      return res.data;
    },
    deleteYear: async (id: number) => {
      await adminAcademicApi.deleteAcademicYear(id);
      refresh();
    }
  };
};

// ============================================================================
// 5. SEMESTERS HOOK
// ============================================================================
export const useAdminSemesters = (pageSize = 10) => {
  const [semesters, setSemesters] = useState<SemesterSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(pageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSemesters = useCallback(async (p: number, s: string, yr: string, st: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: p, size, sortBy: 'semesterNumber', sortDir: 'ASC' };
      if (s.trim()) params.search = s.trim();
      if (yr !== 'ALL') params.academicYearId = Number(yr);
      if (st !== 'ALL') params.status = st;
      const res = await adminAcademicApi.getSemesters(params);
      setSemesters(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch semesters');
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchSemesters(page, search, academicYearFilter, statusFilter);
    }, 250);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [page, search, academicYearFilter, statusFilter, fetchSemesters]);

  const refresh = () => fetchSemesters(page, search, academicYearFilter, statusFilter);

  return {
    semesters,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    academicYearFilter,
    statusFilter,
    setPage,
    setSearch: (val: string) => { setSearch(val); setPage(0); },
    setAcademicYearFilter: (val: string) => { setAcademicYearFilter(val); setPage(0); },
    setStatusFilter: (val: string) => { setStatusFilter(val); setPage(0); },
    refresh,
    getSemesterDetails: (id: number) => adminAcademicApi.getSemesterById(id),
    createSemester: async (data: CreateSemesterRequest) => {
      const res = await adminAcademicApi.createSemester(data);
      refresh();
      return res.data;
    },
    updateSemester: async (id: number, data: UpdateSemesterRequest) => {
      const res = await adminAcademicApi.updateSemester(id, data);
      refresh();
      return res.data;
    },
    changeStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE') => {
      const res = await adminAcademicApi.changeSemesterStatus(id, status);
      refresh();
      return res.data;
    },
    deleteSemester: async (id: number) => {
      await adminAcademicApi.deleteSemester(id);
      refresh();
    }
  };
};

// ============================================================================
// 6. PROGRAMS HOOK
// ============================================================================
export const useAdminPrograms = (pageSize = 10) => {
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(pageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPrograms = useCallback(async (p: number, s: string, dept: string, type: string, st: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: p, size, sortBy: 'name', sortDir: 'ASC' };
      if (s.trim()) params.search = s.trim();
      if (dept !== 'ALL') params.departmentId = Number(dept);
      if (type !== 'ALL') params.programType = type;
      if (st !== 'ALL') params.status = st;
      const res = await adminAcademicApi.getPrograms(params);
      setPrograms(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchPrograms(page, search, departmentFilter, typeFilter, statusFilter);
    }, 250);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [page, search, departmentFilter, typeFilter, statusFilter, fetchPrograms]);

  const refresh = () => fetchPrograms(page, search, departmentFilter, typeFilter, statusFilter);

  return {
    programs,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    departmentFilter,
    typeFilter,
    statusFilter,
    setPage,
    setSearch: (val: string) => { setSearch(val); setPage(0); },
    setDepartmentFilter: (val: string) => { setDepartmentFilter(val); setPage(0); },
    setTypeFilter: (val: string) => { setTypeFilter(val); setPage(0); },
    setStatusFilter: (val: string) => { setStatusFilter(val); setPage(0); },
    refresh,
    getProgramDetails: (id: number) => adminAcademicApi.getProgramById(id),
    createProgram: async (data: CreateProgramRequest) => {
      const res = await adminAcademicApi.createProgram(data);
      refresh();
      return res.data;
    },
    updateProgram: async (id: number, data: UpdateProgramRequest) => {
      const res = await adminAcademicApi.updateProgram(id, data);
      refresh();
      return res.data;
    },
    changeStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE') => {
      const res = await adminAcademicApi.changeProgramStatus(id, status);
      refresh();
      return res.data;
    },
    deleteProgram: async (id: number) => {
      await adminAcademicApi.deleteProgram(id);
      refresh();
    }
  };
};

// ============================================================================
// 7. SUBJECTS HOOK
// ============================================================================
export const useAdminSubjects = (pageSize = 10) => {
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(pageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [semesterNumberFilter, setSemesterNumberFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSubjects = useCallback(async (
    p: number, s: string, dept: string, prog: string, sem: string, type: string, st: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: p, size, sortBy: 'code', sortDir: 'ASC' };
      if (s.trim()) params.search = s.trim();
      if (dept !== 'ALL') params.departmentId = Number(dept);
      if (prog !== 'ALL') params.programId = Number(prog);
      if (sem !== 'ALL') params.semesterNumber = Number(sem);
      if (type !== 'ALL') params.type = type;
      if (st !== 'ALL') params.status = st;
      const res = await adminAcademicApi.getSubjects(params);
      setSubjects(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchSubjects(page, search, departmentFilter, programFilter, semesterNumberFilter, typeFilter, statusFilter);
    }, 250);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [page, search, departmentFilter, programFilter, semesterNumberFilter, typeFilter, statusFilter, fetchSubjects]);

  const refresh = () => fetchSubjects(page, search, departmentFilter, programFilter, semesterNumberFilter, typeFilter, statusFilter);

  return {
    subjects,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    departmentFilter,
    programFilter,
    semesterNumberFilter,
    typeFilter,
    statusFilter,
    setPage,
    setSearch: (val: string) => { setSearch(val); setPage(0); },
    setDepartmentFilter: (val: string) => { setDepartmentFilter(val); setProgramFilter('ALL'); setPage(0); },
    setProgramFilter: (val: string) => { setProgramFilter(val); setPage(0); },
    setSemesterNumberFilter: (val: string) => { setSemesterNumberFilter(val); setPage(0); },
    setTypeFilter: (val: string) => { setTypeFilter(val); setPage(0); },
    setStatusFilter: (val: string) => { setStatusFilter(val); setPage(0); },
    refresh,
    getSubjectDetails: (id: number) => adminAcademicApi.getSubjectById(id),
    createSubject: async (data: CreateSubjectRequest) => {
      const res = await adminAcademicApi.createSubject(data);
      refresh();
      return res.data;
    },
    updateSubject: async (id: number, data: UpdateSubjectRequest) => {
      const res = await adminAcademicApi.updateSubject(id, data);
      refresh();
      return res.data;
    },
    changeStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE') => {
      const res = await adminAcademicApi.changeSubjectStatus(id, status);
      refresh();
      return res.data;
    },
    deleteSubject: async (id: number) => {
      await adminAcademicApi.deleteSubject(id);
      refresh();
    }
  };
};

// ============================================================================
// 8. SECTIONS HOOK
// ============================================================================
export const useAdminSections = (pageSize = 10) => {
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [size] = useState(pageSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSections = useCallback(async (
    p: number, s: string, dept: string, prog: string, sem: string, st: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: p, size, sortBy: 'name', sortDir: 'ASC' };
      if (s.trim()) params.search = s.trim();
      if (dept !== 'ALL') params.departmentId = Number(dept);
      if (prog !== 'ALL') params.programId = Number(prog);
      if (sem !== 'ALL') params.semesterId = Number(sem);
      if (st !== 'ALL') params.status = st;
      const res = await adminAcademicApi.getSections(params);
      setSections(res.data.content);
      setTotalElements(res.data.totalElements);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  }, [size]);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchSections(page, search, departmentFilter, programFilter, semesterFilter, statusFilter);
    }, 250);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [page, search, departmentFilter, programFilter, semesterFilter, statusFilter, fetchSections]);

  const refresh = () => fetchSections(page, search, departmentFilter, programFilter, semesterFilter, statusFilter);

  return {
    sections,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    search,
    departmentFilter,
    programFilter,
    semesterFilter,
    statusFilter,
    setPage,
    setSearch: (val: string) => { setSearch(val); setPage(0); },
    setDepartmentFilter: (val: string) => { setDepartmentFilter(val); setProgramFilter('ALL'); setPage(0); },
    setProgramFilter: (val: string) => { setProgramFilter(val); setPage(0); },
    setSemesterFilter: (val: string) => { setSemesterFilter(val); setPage(0); },
    setStatusFilter: (val: string) => { setStatusFilter(val); setPage(0); },
    refresh,
    getSectionDetails: (id: number) => adminAcademicApi.getSectionById(id),
    createSection: async (data: CreateSectionRequest) => {
      const res = await adminAcademicApi.createSection(data);
      refresh();
      return res.data;
    },
    updateSection: async (id: number, data: UpdateSectionRequest) => {
      const res = await adminAcademicApi.updateSection(id, data);
      refresh();
      return res.data;
    },
    changeStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE') => {
      const res = await adminAcademicApi.changeSectionStatus(id, status);
      refresh();
      return res.data;
    },
    deleteSection: async (id: number) => {
      await adminAcademicApi.deleteSection(id);
      refresh();
    }
  };
};
