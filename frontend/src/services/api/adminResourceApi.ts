import { apiClient } from './apiClient';
import { ApiResponse, PagedResponse } from '../../types/api';

// ============================================================================
// 1. RESOURCE CATEGORY TYPES
// ============================================================================
export interface ResourceCategoryItem {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalResources: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceCategoryRequest {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateResourceCategoryRequest {
  name: string;
  description?: string;
}

// ============================================================================
// 2. RESOURCE TYPES
// ============================================================================
export type ResourceStatusType = 'AVAILABLE' | 'ALLOCATED' | 'MAINTENANCE' | 'INACTIVE';

export interface ResourceSummaryItem {
  id: number;
  code: string;
  name: string;
  categoryCode: string;
  categoryName: string;
  departmentName?: string;
  capacity?: number;
  location?: string;
  status: ResourceStatusType;
  quantity: number;
  availableQuantity: number;
  createdAt: string;
}

export interface ResourceDetailsItem {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  categoryCode: string;
  categoryName: string;
  departmentId?: number;
  departmentName?: string;
  description?: string;
  capacity?: number;
  location?: string;
  status: ResourceStatusType;
  quantity: number;
  availableQuantity: number;
  classroomDetails?: ClassroomSummaryItem;
  laboratoryDetails?: LaboratorySummaryItem;
  equipmentList?: EquipmentSummaryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateResourceRequest {
  categoryId: number;
  departmentId?: number;
  code: string;
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  quantity?: number;
}

export interface UpdateResourceRequest {
  departmentId?: number;
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  quantity?: number;
}

// ============================================================================
// 3. CLASSROOM TYPES
// ============================================================================
export interface ClassroomSummaryItem {
  id: number;
  resourceId: number;
  resourceCode: string;
  resourceName: string;
  building: string;
  floor: number;
  roomNumber: string;
  capacity: number;
  roomType: string;
  hasProjector: boolean;
  hasAc: boolean;
  hasSmartBoard: boolean;
  status: ResourceStatusType;
  createdAt: string;
}

export interface ClassroomDetailsItem {
  id: number;
  resourceId: number;
  resourceCode: string;
  resourceName: string;
  building: string;
  floor: number;
  roomNumber: string;
  capacity: number;
  roomType: string;
  hasProjector: boolean;
  hasAc: boolean;
  hasSmartBoard: boolean;
  description?: string;
  status: ResourceStatusType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClassroomRequest {
  resourceCode: string;
  resourceName: string;
  building: string;
  floor: number;
  roomNumber: string;
  capacity: number;
  roomType?: string;
  hasProjector?: boolean;
  hasAc?: boolean;
  hasSmartBoard?: boolean;
  description?: string;
}

export interface UpdateClassroomRequest {
  building: string;
  floor: number;
  roomNumber: string;
  capacity: number;
  roomType?: string;
  hasProjector?: boolean;
  hasAc?: boolean;
  hasSmartBoard?: boolean;
  description?: string;
}

// ============================================================================
// 4. LABORATORY TYPES
// ============================================================================
export interface LaboratorySummaryItem {
  id: number;
  resourceId: number;
  resourceCode: string;
  resourceName: string;
  departmentId?: number;
  departmentName?: string;
  building: string;
  floor: number;
  roomNumber: string;
  capacity: number;
  labType: string;
  computerCount: number;
  status: ResourceStatusType;
  createdAt: string;
}

export interface LaboratoryDetailsItem {
  id: number;
  resourceId: number;
  resourceCode: string;
  resourceName: string;
  departmentId?: number;
  departmentName?: string;
  building: string;
  floor: number;
  roomNumber: string;
  capacity: number;
  labType: string;
  computerCount: number;
  description?: string;
  status: ResourceStatusType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLaboratoryRequest {
  resourceCode: string;
  resourceName: string;
  departmentId?: number;
  building: string;
  floor: number;
  roomNumber: string;
  capacity: number;
  labType?: string;
  computerCount?: number;
  description?: string;
}

export interface UpdateLaboratoryRequest {
  departmentId?: number;
  building: string;
  floor: number;
  roomNumber: string;
  capacity: number;
  labType?: string;
  computerCount?: number;
  description?: string;
}

// ============================================================================
// 5. EQUIPMENT TYPES
// ============================================================================
export type EquipmentStatusType = 'FUNCTIONAL' | 'UNDER_MAINTENANCE' | 'DEFECTIVE' | 'DECOMMISSIONED';

export interface EquipmentSummaryItem {
  id: number;
  resourceId: number;
  resourceCode: string;
  resourceName: string;
  serialNumber: string;
  manufacturer?: string;
  model?: string;
  conditionStatus?: string;
  quantity: number;
  status: EquipmentStatusType;
  createdAt: string;
}

export interface EquipmentDetailsItem {
  id: number;
  resourceId: number;
  resourceCode: string;
  resourceName: string;
  serialNumber: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  conditionStatus?: string;
  quantity: number;
  status: EquipmentStatusType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipmentRequest {
  resourceId: number;
  serialNumber: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  conditionStatus?: string;
  quantity: number;
}

export interface UpdateEquipmentRequest {
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  conditionStatus?: string;
  quantity: number;
}

// ============================================================================
// 6. TIME SLOT TYPES
// ============================================================================
export interface TimeSlotSummaryItem {
  id: number;
  name: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface TimeSlotDetailsItem {
  id: number;
  name: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimeSlotRequest {
  name: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface UpdateTimeSlotRequest {
  name: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

// ============================================================================
// 7. OVERVIEW & REFERENCE DATA TYPES
// ============================================================================
export interface ResourceOverviewData {
  totalResources: number;
  availableResources: number;
  allocatedResources: number;
  maintenanceResources: number;
  inactiveResources: number;
  totalClassrooms: number;
  totalLaboratories: number;
  totalEquipment: number;
  totalTimeSlots: number;
  totalCategories: number;
}

export interface ResourceReferenceData {
  categories: Array<{ id: number; code: string; name: string }>;
  departments: Array<{ id: number; code: string; name: string }>;
  equipmentResources: Array<{ id: number; code: string; name: string }>;
  resourceStatuses: string[];
  equipmentStatuses: string[];
  daysOfWeek: string[];
}

// ============================================================================
// 8. ADMIN RESOURCE API CLIENT
// ============================================================================
export const adminResourceApi = {
  // --- Resource Categories ---
  getCategories: async (params?: {
    search?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<ResourceCategoryItem>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<ResourceCategoryItem>>>(
      '/admin/resource-categories',
      { params }
    );
    return response.data;
  },

  getCategoryById: async (id: number): Promise<ApiResponse<ResourceCategoryItem>> => {
    const response = await apiClient.get<ApiResponse<ResourceCategoryItem>>(`/admin/resource-categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateResourceCategoryRequest): Promise<ApiResponse<ResourceCategoryItem>> => {
    const response = await apiClient.post<ApiResponse<ResourceCategoryItem>>('/admin/resource-categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: UpdateResourceCategoryRequest): Promise<ApiResponse<ResourceCategoryItem>> => {
    const response = await apiClient.put<ApiResponse<ResourceCategoryItem>>(`/admin/resource-categories/${id}`, data);
    return response.data;
  },

  changeCategoryStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<ApiResponse<ResourceCategoryItem>> => {
    const response = await apiClient.patch<ApiResponse<ResourceCategoryItem>>(
      `/admin/resource-categories/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  deleteCategory: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/resource-categories/${id}`);
    return response.data;
  },

  // --- Academic Resources ---
  getResources: async (params?: {
    search?: string;
    categoryId?: number;
    departmentId?: number;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<ResourceSummaryItem>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<ResourceSummaryItem>>>('/admin/resources', { params });
    return response.data;
  },

  getResourceById: async (id: number): Promise<ApiResponse<ResourceDetailsItem>> => {
    const response = await apiClient.get<ApiResponse<ResourceDetailsItem>>(`/admin/resources/${id}`);
    return response.data;
  },

  createResource: async (data: CreateResourceRequest): Promise<ApiResponse<ResourceDetailsItem>> => {
    const response = await apiClient.post<ApiResponse<ResourceDetailsItem>>('/admin/resources', data);
    return response.data;
  },

  updateResource: async (id: number, data: UpdateResourceRequest): Promise<ApiResponse<ResourceDetailsItem>> => {
    const response = await apiClient.put<ApiResponse<ResourceDetailsItem>>(`/admin/resources/${id}`, data);
    return response.data;
  },

  changeResourceStatus: async (
    id: number,
    status: ResourceStatusType
  ): Promise<ApiResponse<ResourceSummaryItem>> => {
    const response = await apiClient.patch<ApiResponse<ResourceSummaryItem>>(
      `/admin/resources/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  deleteResource: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/resources/${id}`);
    return response.data;
  },

  // --- Classrooms ---
  getClassrooms: async (params?: {
    search?: string;
    building?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<ClassroomSummaryItem>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<ClassroomSummaryItem>>>('/admin/classrooms', { params });
    return response.data;
  },

  getClassroomById: async (id: number): Promise<ApiResponse<ClassroomDetailsItem>> => {
    const response = await apiClient.get<ApiResponse<ClassroomDetailsItem>>(`/admin/classrooms/${id}`);
    return response.data;
  },

  createClassroom: async (data: CreateClassroomRequest): Promise<ApiResponse<ClassroomDetailsItem>> => {
    const response = await apiClient.post<ApiResponse<ClassroomDetailsItem>>('/admin/classrooms', data);
    return response.data;
  },

  updateClassroom: async (id: number, data: UpdateClassroomRequest): Promise<ApiResponse<ClassroomDetailsItem>> => {
    const response = await apiClient.put<ApiResponse<ClassroomDetailsItem>>(`/admin/classrooms/${id}`, data);
    return response.data;
  },

  changeClassroomStatus: async (
    id: number,
    status: ResourceStatusType
  ): Promise<ApiResponse<ClassroomSummaryItem>> => {
    const response = await apiClient.patch<ApiResponse<ClassroomSummaryItem>>(
      `/admin/classrooms/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  deleteClassroom: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/classrooms/${id}`);
    return response.data;
  },

  // --- Laboratories ---
  getLaboratories: async (params?: {
    search?: string;
    departmentId?: number;
    building?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<LaboratorySummaryItem>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<LaboratorySummaryItem>>>('/admin/laboratories', { params });
    return response.data;
  },

  getLaboratoryById: async (id: number): Promise<ApiResponse<LaboratoryDetailsItem>> => {
    const response = await apiClient.get<ApiResponse<LaboratoryDetailsItem>>(`/admin/laboratories/${id}`);
    return response.data;
  },

  createLaboratory: async (data: CreateLaboratoryRequest): Promise<ApiResponse<LaboratoryDetailsItem>> => {
    const response = await apiClient.post<ApiResponse<LaboratoryDetailsItem>>('/admin/laboratories', data);
    return response.data;
  },

  updateLaboratory: async (id: number, data: UpdateLaboratoryRequest): Promise<ApiResponse<LaboratoryDetailsItem>> => {
    const response = await apiClient.put<ApiResponse<LaboratoryDetailsItem>>(`/admin/laboratories/${id}`, data);
    return response.data;
  },

  changeLaboratoryStatus: async (
    id: number,
    status: ResourceStatusType
  ): Promise<ApiResponse<LaboratorySummaryItem>> => {
    const response = await apiClient.patch<ApiResponse<LaboratorySummaryItem>>(
      `/admin/laboratories/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  deleteLaboratory: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/laboratories/${id}`);
    return response.data;
  },

  // --- Equipment ---
  getEquipment: async (params?: {
    search?: string;
    resourceId?: number;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<EquipmentSummaryItem>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<EquipmentSummaryItem>>>('/admin/equipment', { params });
    return response.data;
  },

  getEquipmentById: async (id: number): Promise<ApiResponse<EquipmentDetailsItem>> => {
    const response = await apiClient.get<ApiResponse<EquipmentDetailsItem>>(`/admin/equipment/${id}`);
    return response.data;
  },

  createEquipment: async (data: CreateEquipmentRequest): Promise<ApiResponse<EquipmentDetailsItem>> => {
    const response = await apiClient.post<ApiResponse<EquipmentDetailsItem>>('/admin/equipment', data);
    return response.data;
  },

  updateEquipment: async (id: number, data: UpdateEquipmentRequest): Promise<ApiResponse<EquipmentDetailsItem>> => {
    const response = await apiClient.put<ApiResponse<EquipmentDetailsItem>>(`/admin/equipment/${id}`, data);
    return response.data;
  },

  changeEquipmentStatus: async (
    id: number,
    status: EquipmentStatusType
  ): Promise<ApiResponse<EquipmentSummaryItem>> => {
    const response = await apiClient.patch<ApiResponse<EquipmentSummaryItem>>(
      `/admin/equipment/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  deleteEquipment: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/equipment/${id}`);
    return response.data;
  },

  // --- Time Slots ---
  getTimeSlots: async (params?: {
    search?: string;
    dayOfWeek?: string;
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<ApiResponse<PagedResponse<TimeSlotSummaryItem>>> => {
    const response = await apiClient.get<ApiResponse<PagedResponse<TimeSlotSummaryItem>>>('/admin/time-slots', { params });
    return response.data;
  },

  getTimeSlotById: async (id: number): Promise<ApiResponse<TimeSlotDetailsItem>> => {
    const response = await apiClient.get<ApiResponse<TimeSlotDetailsItem>>(`/admin/time-slots/${id}`);
    return response.data;
  },

  createTimeSlot: async (data: CreateTimeSlotRequest): Promise<ApiResponse<TimeSlotDetailsItem>> => {
    const response = await apiClient.post<ApiResponse<TimeSlotDetailsItem>>('/admin/time-slots', data);
    return response.data;
  },

  updateTimeSlot: async (id: number, data: UpdateTimeSlotRequest): Promise<ApiResponse<TimeSlotDetailsItem>> => {
    const response = await apiClient.put<ApiResponse<TimeSlotDetailsItem>>(`/admin/time-slots/${id}`, data);
    return response.data;
  },

  changeTimeSlotStatus: async (
    id: number,
    status: 'ACTIVE' | 'INACTIVE'
  ): Promise<ApiResponse<TimeSlotSummaryItem>> => {
    const response = await apiClient.patch<ApiResponse<TimeSlotSummaryItem>>(
      `/admin/time-slots/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  deleteTimeSlot: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/admin/time-slots/${id}`);
    return response.data;
  },

  // --- Overview & Reference Data ---
  getOverview: async (): Promise<ApiResponse<ResourceOverviewData>> => {
    const response = await apiClient.get<ApiResponse<ResourceOverviewData>>('/admin/resources/overview');
    return response.data;
  },

  getReferenceData: async (): Promise<ApiResponse<ResourceReferenceData>> => {
    const response = await apiClient.get<ApiResponse<ResourceReferenceData>>('/admin/resources/reference-data');
    return response.data;
  }
};
