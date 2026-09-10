import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  Building2,
  Cpu,
  Clock,
  Wrench,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  Monitor,
  Calendar,
  Box,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Tv,
  AirVent,
  Tv2,
  FolderTree,
  Filter
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  ContentSection
} from '../../components/layout';
import {
  Card,
  StatCard,
  Badge,
  Button,
  Input,
  Select,
  Modal,
  ConfirmDialog,
  Pagination,
  Skeleton,
  getStatusBadgeVariant
} from '../../components/ui';
import { EmptyState } from '../../components/common/EmptyState';
import {
  useResourceOverview,
  useResourceReferenceData,
  useResourceCategories,
  useAdminResources,
  useAdminClassrooms,
  useAdminLaboratories,
  useAdminEquipment,
  useAdminTimeSlots
} from '../../hooks/useAdminResources';
import {
  ResourceCategoryItem,
  ResourceSummaryItem,
  ResourceDetailsItem,
  ClassroomSummaryItem,
  ClassroomDetailsItem,
  LaboratorySummaryItem,
  LaboratoryDetailsItem,
  EquipmentSummaryItem,
  EquipmentDetailsItem,
  TimeSlotSummaryItem,
  TimeSlotDetailsItem,
  ResourceStatusType,
  EquipmentStatusType,
  adminResourceApi
} from '../../services/api/adminResourceApi';

export type ResourceTab =
  | 'overview'
  | 'categories'
  | 'resources'
  | 'classrooms'
  | 'laboratories'
  | 'equipment'
  | 'time-slots';

interface ResourceManagementPageProps {
  initialTab?: ResourceTab;
}

export const ResourceManagementPage: React.FC<ResourceManagementPageProps> = ({ initialTab }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tab: pathTab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  // Determine active tab from url path or query param
  const getActiveTab = (): ResourceTab => {
    if (pathTab) {
      if (pathTab === 'categories') return 'categories';
      if (pathTab === 'list' || pathTab === 'resources') return 'resources';
      if (pathTab === 'classrooms') return 'classrooms';
      if (pathTab === 'laboratories') return 'laboratories';
      if (pathTab === 'equipment') return 'equipment';
      if (pathTab === 'time-slots') return 'time-slots';
      if (pathTab === 'overview') return 'overview';
    }
    const queryTab = searchParams.get('tab') as ResourceTab;
    if (queryTab && ['overview', 'categories', 'resources', 'classrooms', 'laboratories', 'equipment', 'time-slots'].includes(queryTab)) {
      return queryTab;
    }
    return initialTab || 'overview';
  };

  const activeTab = getActiveTab();

  const handleTabChange = (newTab: ResourceTab) => {
    setSearchParams({ tab: newTab });
  };

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, message });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Hooks for modules
  const { overview, loading: overviewLoading, refetchOverview } = useResourceOverview();
  const { referenceData, loading: refLoading } = useResourceReferenceData();

  const categoriesModule = useResourceCategories(0, 10);
  const resourcesModule = useAdminResources(0, 10);
  const classroomsModule = useAdminClassrooms(0, 10);
  const laboratoriesModule = useAdminLaboratories(0, 10);
  const equipmentModule = useAdminEquipment(0, 10);
  const timeSlotsModule = useAdminTimeSlots(0, 10);

  // Status Confirm Dialog State
  const [statusConfirm, setStatusConfirm] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'primary';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    variant: 'primary',
    onConfirm: async () => {}
  });
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  // Delete Confirm Dialog State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: async () => {}
  });
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // --------------------------------------------------------------------------
  // Category Modal State
  // --------------------------------------------------------------------------
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    item?: ResourceCategoryItem;
    formData: { code: string; name: string; description: string };
    submitting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    mode: 'create',
    formData: { code: '', name: '', description: '' },
    submitting: false,
    error: null
  });

  // --------------------------------------------------------------------------
  // Resource Modal State
  // --------------------------------------------------------------------------
  const [resourceModal, setResourceModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    item?: ResourceSummaryItem;
    formData: {
      categoryId: string;
      departmentId: string;
      code: string;
      name: string;
      description: string;
      capacity: string;
      location: string;
      quantity: string;
    };
    submitting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    mode: 'create',
    formData: {
      categoryId: '',
      departmentId: '',
      code: '',
      name: '',
      description: '',
      capacity: '30',
      location: '',
      quantity: '1'
    },
    submitting: false,
    error: null
  });

  // --------------------------------------------------------------------------
  // Classroom Modal State
  // --------------------------------------------------------------------------
  const [classroomModal, setClassroomModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    item?: ClassroomSummaryItem;
    formData: {
      resourceCode: string;
      resourceName: string;
      building: string;
      floor: string;
      roomNumber: string;
      capacity: string;
      roomType: string;
      hasProjector: boolean;
      hasAc: boolean;
      hasSmartBoard: boolean;
      description: string;
    };
    submitting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    mode: 'create',
    formData: {
      resourceCode: '',
      resourceName: '',
      building: '',
      floor: '1',
      roomNumber: '',
      capacity: '60',
      roomType: 'LECTURE_HALL',
      hasProjector: true,
      hasAc: false,
      hasSmartBoard: false,
      description: ''
    },
    submitting: false,
    error: null
  });

  // --------------------------------------------------------------------------
  // Laboratory Modal State
  // --------------------------------------------------------------------------
  const [laboratoryModal, setLaboratoryModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    item?: LaboratorySummaryItem;
    formData: {
      resourceCode: string;
      resourceName: string;
      departmentId: string;
      building: string;
      floor: string;
      roomNumber: string;
      capacity: string;
      labType: string;
      computerCount: string;
      description: string;
    };
    submitting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    mode: 'create',
    formData: {
      resourceCode: '',
      resourceName: '',
      departmentId: '',
      building: '',
      floor: '1',
      roomNumber: '',
      capacity: '40',
      labType: 'COMPUTER_SCIENCE',
      computerCount: '40',
      description: ''
    },
    submitting: false,
    error: null
  });

  // --------------------------------------------------------------------------
  // Equipment Modal State
  // --------------------------------------------------------------------------
  const [equipmentModal, setEquipmentModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    item?: EquipmentSummaryItem;
    formData: {
      resourceId: string;
      serialNumber: string;
      manufacturer: string;
      model: string;
      purchaseDate: string;
      warrantyExpiry: string;
      conditionStatus: string;
      quantity: string;
    };
    submitting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    mode: 'create',
    formData: {
      resourceId: '',
      serialNumber: '',
      manufacturer: '',
      model: '',
      purchaseDate: '',
      warrantyExpiry: '',
      conditionStatus: 'EXCELLENT',
      quantity: '1'
    },
    submitting: false,
    error: null
  });

  // --------------------------------------------------------------------------
  // Time Slot Modal State
  // --------------------------------------------------------------------------
  const [timeSlotModal, setTimeSlotModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    item?: TimeSlotSummaryItem;
    formData: {
      name: string;
      dayOfWeek: string;
      startTime: string;
      endTime: string;
    };
    submitting: boolean;
    error: string | null;
  }>({
    isOpen: false,
    mode: 'create',
    formData: {
      name: '',
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '10:00'
    },
    submitting: false,
    error: null
  });

  // --------------------------------------------------------------------------
  // Details Modal State (Generic for Resource, Classroom, Lab, Equipment, TimeSlot)
  // --------------------------------------------------------------------------
  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    title: string;
    loading: boolean;
    data: any;
    type: 'resource' | 'classroom' | 'laboratory' | 'equipment' | 'time-slot';
  }>({
    isOpen: false,
    title: '',
    loading: false,
    data: null,
    type: 'resource'
  });

  // ==========================================================================
  // HANDLERS FOR CATEGORIES
  // ==========================================================================
  const handleOpenCategoryCreate = () => {
    setCategoryModal({
      isOpen: true,
      mode: 'create',
      formData: { code: '', name: '', description: '' },
      submitting: false,
      error: null
    });
  };

  const handleOpenCategoryEdit = (cat: ResourceCategoryItem) => {
    setCategoryModal({
      isOpen: true,
      mode: 'edit',
      item: cat,
      formData: { code: cat.code, name: cat.name, description: cat.description || '' },
      submitting: false,
      error: null
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryModal.formData.name.trim()) {
      setCategoryModal((prev) => ({ ...prev, error: 'Category name is required' }));
      return;
    }
    if (categoryModal.mode === 'create' && !categoryModal.formData.code.trim()) {
      setCategoryModal((prev) => ({ ...prev, error: 'Category code is required' }));
      return;
    }

    try {
      setCategoryModal((prev) => ({ ...prev, submitting: true, error: null }));
      if (categoryModal.mode === 'create') {
        await categoriesModule.createCategory({
          code: categoryModal.formData.code.trim().toUpperCase(),
          name: categoryModal.formData.name.trim(),
          description: categoryModal.formData.description.trim() || undefined
        });
        showToast('Resource category created successfully');
      } else if (categoryModal.item) {
        await categoriesModule.updateCategory(categoryModal.item.id, {
          name: categoryModal.formData.name.trim(),
          description: categoryModal.formData.description.trim() || undefined
        });
        showToast('Resource category updated successfully');
      }
      setCategoryModal((prev) => ({ ...prev, isOpen: false, submitting: false }));
      refetchOverview();
    } catch (err: any) {
      setCategoryModal((prev) => ({
        ...prev,
        submitting: false,
        error: err?.response?.data?.message || err?.message || 'Operation failed'
      }));
    }
  };

  const handleToggleCategoryStatus = (cat: ResourceCategoryItem) => {
    const nextStatus = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStatusConfirm({
      isOpen: true,
      title: `${nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} Category`,
      description: `Are you sure you want to mark "${cat.name}" as ${nextStatus}? Inactive categories cannot have new resources registered under them.`,
      confirmText: nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate',
      variant: nextStatus === 'ACTIVE' ? 'primary' : 'warning',
      onConfirm: async () => {
        try {
          setStatusSubmitting(true);
          await categoriesModule.changeStatus(cat.id, nextStatus);
          showToast(`Category marked as ${nextStatus}`);
          setStatusConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Failed to update category status', 'error');
        } finally {
          setStatusSubmitting(false);
        }
      }
    });
  };

  const handleDeleteCategory = (cat: ResourceCategoryItem) => {
    setDeleteConfirm({
      isOpen: true,
      title: `Delete Category "${cat.name}"`,
      description: `This action permanently removes the category if no resources reference it. Are you sure you wish to proceed?`,
      onConfirm: async () => {
        try {
          setDeleteSubmitting(true);
          await categoriesModule.deleteCategory(cat.id);
          showToast('Category removed successfully');
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Cannot delete category with associated resources', 'error');
        } finally {
          setDeleteSubmitting(false);
        }
      }
    });
  };

  // ==========================================================================
  // HANDLERS FOR RESOURCES
  // ==========================================================================
  const handleOpenResourceCreate = () => {
    const firstCat = referenceData?.categories?.[0]?.id.toString() || '';
    setResourceModal({
      isOpen: true,
      mode: 'create',
      formData: {
        categoryId: firstCat,
        departmentId: '',
        code: '',
        name: '',
        description: '',
        capacity: '30',
        location: '',
        quantity: '1'
      },
      submitting: false,
      error: null
    });
  };

  const handleOpenResourceEdit = (res: ResourceSummaryItem) => {
    setResourceModal({
      isOpen: true,
      mode: 'edit',
      item: res,
      formData: {
        categoryId: '',
        departmentId: '',
        code: res.code,
        name: res.name,
        description: '',
        capacity: res.capacity ? res.capacity.toString() : '',
        location: res.location || '',
        quantity: res.quantity ? res.quantity.toString() : '1'
      },
      submitting: false,
      error: null
    });
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceModal.formData.name.trim()) {
      setResourceModal((prev) => ({ ...prev, error: 'Resource name is required' }));
      return;
    }
    if (resourceModal.mode === 'create') {
      if (!resourceModal.formData.code.trim()) {
        setResourceModal((prev) => ({ ...prev, error: 'Resource code is required' }));
        return;
      }
      if (!resourceModal.formData.categoryId) {
        setResourceModal((prev) => ({ ...prev, error: 'Please select a resource category' }));
        return;
      }
    }

    try {
      setResourceModal((prev) => ({ ...prev, submitting: true, error: null }));
      const cap = resourceModal.formData.capacity ? parseInt(resourceModal.formData.capacity, 10) : undefined;
      const qty = resourceModal.formData.quantity ? parseInt(resourceModal.formData.quantity, 10) : 1;
      const dept = resourceModal.formData.departmentId ? parseInt(resourceModal.formData.departmentId, 10) : undefined;

      if (resourceModal.mode === 'create') {
        await resourcesModule.createResource({
          categoryId: parseInt(resourceModal.formData.categoryId, 10),
          departmentId: dept,
          code: resourceModal.formData.code.trim().toUpperCase(),
          name: resourceModal.formData.name.trim(),
          description: resourceModal.formData.description.trim() || undefined,
          capacity: cap,
          location: resourceModal.formData.location.trim() || undefined,
          quantity: qty
        });
        showToast('Academic resource registered successfully');
      } else if (resourceModal.item) {
        await resourcesModule.updateResource(resourceModal.item.id, {
          departmentId: dept,
          name: resourceModal.formData.name.trim(),
          description: resourceModal.formData.description.trim() || undefined,
          capacity: cap,
          location: resourceModal.formData.location.trim() || undefined,
          quantity: qty
        });
        showToast('Resource updated successfully');
      }
      setResourceModal((prev) => ({ ...prev, isOpen: false, submitting: false }));
      refetchOverview();
    } catch (err: any) {
      setResourceModal((prev) => ({
        ...prev,
        submitting: false,
        error: err?.response?.data?.message || err?.message || 'Operation failed'
      }));
    }
  };

  const handleToggleResourceStatus = (res: ResourceSummaryItem, newStatus: ResourceStatusType) => {
    const isMaintenance = newStatus === 'MAINTENANCE';
    setStatusConfirm({
      isOpen: true,
      title: isMaintenance ? 'Set Resource to Maintenance' : `Change Resource Status to ${newStatus}`,
      description: isMaintenance
        ? `Are you sure you want to mark "${res.name}" as MAINTENANCE? This flags the physical space or equipment as unavailable for timetable scheduling and upcoming resource allocations.`
        : `Change status of "${res.name}" to ${newStatus}?`,
      confirmText: isMaintenance ? 'Mark Maintenance' : `Set ${newStatus}`,
      variant: isMaintenance ? 'warning' : newStatus === 'INACTIVE' ? 'danger' : 'primary',
      onConfirm: async () => {
        try {
          setStatusSubmitting(true);
          await resourcesModule.changeStatus(res.id, newStatus);
          showToast(`Resource status changed to ${newStatus}`);
          setStatusConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Failed to update resource status', 'error');
        } finally {
          setStatusSubmitting(false);
        }
      }
    });
  };

  const handleDeleteResource = (res: ResourceSummaryItem) => {
    setDeleteConfirm({
      isOpen: true,
      title: `Delete Resource "${res.name}"`,
      description: `Deleting this resource will remove associated inventory records. If it is referenced in allocation schedules, deletion is strictly protected. Continue?`,
      onConfirm: async () => {
        try {
          setDeleteSubmitting(true);
          await resourcesModule.deleteResource(res.id);
          showToast('Resource deleted successfully');
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Cannot delete resource due to existing dependencies', 'error');
        } finally {
          setDeleteSubmitting(false);
        }
      }
    });
  };

  const handleViewResourceDetails = async (id: number) => {
    try {
      setDetailsModal({
        isOpen: true,
        title: 'Resource Details',
        loading: true,
        data: null,
        type: 'resource'
      });
      const res = await adminResourceApi.getResourceById(id);
      setDetailsModal((prev) => ({ ...prev, loading: false, data: res.data }));
    } catch (err: any) {
      showToast('Failed to load resource details', 'error');
      setDetailsModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // ==========================================================================
  // HANDLERS FOR CLASSROOMS
  // ==========================================================================
  const handleOpenClassroomCreate = () => {
    setClassroomModal({
      isOpen: true,
      mode: 'create',
      formData: {
        resourceCode: '',
        resourceName: '',
        building: '',
        floor: '1',
        roomNumber: '',
        capacity: '60',
        roomType: 'LECTURE_HALL',
        hasProjector: true,
        hasAc: false,
        hasSmartBoard: false,
        description: ''
      },
      submitting: false,
      error: null
    });
  };

  const handleOpenClassroomEdit = (cls: ClassroomSummaryItem) => {
    setClassroomModal({
      isOpen: true,
      mode: 'edit',
      item: cls,
      formData: {
        resourceCode: cls.resourceCode,
        resourceName: cls.resourceName,
        building: cls.building,
        floor: cls.floor.toString(),
        roomNumber: cls.roomNumber,
        capacity: cls.capacity.toString(),
        roomType: cls.roomType,
        hasProjector: cls.hasProjector,
        hasAc: cls.hasAc,
        hasSmartBoard: cls.hasSmartBoard,
        description: ''
      },
      submitting: false,
      error: null
    });
  };

  const handleSaveClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classroomModal.formData.building.trim()) {
      setClassroomModal((prev) => ({ ...prev, error: 'Building name is required' }));
      return;
    }
    if (!classroomModal.formData.roomNumber.trim()) {
      setClassroomModal((prev) => ({ ...prev, error: 'Room number is required' }));
      return;
    }
    const cap = parseInt(classroomModal.formData.capacity, 10);
    if (isNaN(cap) || cap <= 0) {
      setClassroomModal((prev) => ({ ...prev, error: 'Seating capacity must be a positive integer' }));
      return;
    }

    try {
      setClassroomModal((prev) => ({ ...prev, submitting: true, error: null }));
      const floorNum = parseInt(classroomModal.formData.floor, 10) || 0;

      if (classroomModal.mode === 'create') {
        if (!classroomModal.formData.resourceCode.trim() || !classroomModal.formData.resourceName.trim()) {
          setClassroomModal((prev) => ({ ...prev, error: 'Resource Code and Name are required' }));
          return;
        }
        await classroomsModule.createClassroom({
          resourceCode: classroomModal.formData.resourceCode.trim().toUpperCase(),
          resourceName: classroomModal.formData.resourceName.trim(),
          building: classroomModal.formData.building.trim(),
          floor: floorNum,
          roomNumber: classroomModal.formData.roomNumber.trim(),
          capacity: cap,
          roomType: classroomModal.formData.roomType,
          hasProjector: classroomModal.formData.hasProjector,
          hasAc: classroomModal.formData.hasAc,
          hasSmartBoard: classroomModal.formData.hasSmartBoard,
          description: classroomModal.formData.description.trim() || undefined
        });
        showToast('Classroom created and registered in resource inventory');
      } else if (classroomModal.item) {
        await classroomsModule.updateClassroom(classroomModal.item.id, {
          building: classroomModal.formData.building.trim(),
          floor: floorNum,
          roomNumber: classroomModal.formData.roomNumber.trim(),
          capacity: cap,
          roomType: classroomModal.formData.roomType,
          hasProjector: classroomModal.formData.hasProjector,
          hasAc: classroomModal.formData.hasAc,
          hasSmartBoard: classroomModal.formData.hasSmartBoard,
          description: classroomModal.formData.description.trim() || undefined
        });
        showToast('Classroom specifications updated');
      }
      setClassroomModal((prev) => ({ ...prev, isOpen: false, submitting: false }));
      refetchOverview();
    } catch (err: any) {
      setClassroomModal((prev) => ({
        ...prev,
        submitting: false,
        error: err?.response?.data?.message || err?.message || 'Operation failed'
      }));
    }
  };

  const handleToggleClassroomStatus = (cls: ClassroomSummaryItem, newStatus: ResourceStatusType) => {
    setStatusConfirm({
      isOpen: true,
      title: `${newStatus === 'MAINTENANCE' ? 'Flag Classroom for Maintenance' : `Update Classroom Status to ${newStatus}`}`,
      description: `Classroom "${cls.roomNumber}" in ${cls.building} will be updated to ${newStatus}.`,
      confirmText: `Set ${newStatus}`,
      variant: newStatus === 'MAINTENANCE' ? 'warning' : 'primary',
      onConfirm: async () => {
        try {
          setStatusSubmitting(true);
          await classroomsModule.changeStatus(cls.id, newStatus);
          showToast(`Classroom marked as ${newStatus}`);
          setStatusConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Failed to update classroom status', 'error');
        } finally {
          setStatusSubmitting(false);
        }
      }
    });
  };

  const handleDeleteClassroom = (cls: ClassroomSummaryItem) => {
    setDeleteConfirm({
      isOpen: true,
      title: `Delete Classroom "${cls.roomNumber}"`,
      description: `Are you sure you want to remove this classroom record? If scheduled in timetable or active allocations, deletion is blocked.`,
      onConfirm: async () => {
        try {
          setDeleteSubmitting(true);
          await classroomsModule.deleteClassroom(cls.id);
          showToast('Classroom removed successfully');
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Cannot delete classroom due to active references', 'error');
        } finally {
          setDeleteSubmitting(false);
        }
      }
    });
  };

  const handleViewClassroomDetails = async (id: number) => {
    try {
      setDetailsModal({
        isOpen: true,
        title: 'Classroom Specifications',
        loading: true,
        data: null,
        type: 'classroom'
      });
      const res = await adminResourceApi.getClassroomById(id);
      setDetailsModal((prev) => ({ ...prev, loading: false, data: res.data }));
    } catch (err: any) {
      showToast('Failed to load classroom details', 'error');
      setDetailsModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // ==========================================================================
  // HANDLERS FOR LABORATORIES
  // ==========================================================================
  const handleOpenLaboratoryCreate = () => {
    const firstDept = referenceData?.departments?.[0]?.id.toString() || '';
    setLaboratoryModal({
      isOpen: true,
      mode: 'create',
      formData: {
        resourceCode: '',
        resourceName: '',
        departmentId: firstDept,
        building: '',
        floor: '1',
        roomNumber: '',
        capacity: '40',
        labType: 'COMPUTER_SCIENCE',
        computerCount: '40',
        description: ''
      },
      submitting: false,
      error: null
    });
  };

  const handleOpenLaboratoryEdit = (lab: LaboratorySummaryItem) => {
    setLaboratoryModal({
      isOpen: true,
      mode: 'edit',
      item: lab,
      formData: {
        resourceCode: lab.resourceCode,
        resourceName: lab.resourceName,
        departmentId: lab.departmentId ? lab.departmentId.toString() : '',
        building: lab.building,
        floor: lab.floor.toString(),
        roomNumber: lab.roomNumber,
        capacity: lab.capacity.toString(),
        labType: lab.labType,
        computerCount: lab.computerCount.toString(),
        description: ''
      },
      submitting: false,
      error: null
    });
  };

  const handleSaveLaboratory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laboratoryModal.formData.building.trim()) {
      setLaboratoryModal((prev) => ({ ...prev, error: 'Building name is required' }));
      return;
    }
    if (!laboratoryModal.formData.roomNumber.trim()) {
      setLaboratoryModal((prev) => ({ ...prev, error: 'Lab/Room number is required' }));
      return;
    }
    const cap = parseInt(laboratoryModal.formData.capacity, 10);
    if (isNaN(cap) || cap <= 0) {
      setLaboratoryModal((prev) => ({ ...prev, error: 'Capacity must be positive' }));
      return;
    }

    try {
      setLaboratoryModal((prev) => ({ ...prev, submitting: true, error: null }));
      const floorNum = parseInt(laboratoryModal.formData.floor, 10) || 0;
      const compCount = parseInt(laboratoryModal.formData.computerCount, 10) || 0;
      const deptId = laboratoryModal.formData.departmentId ? parseInt(laboratoryModal.formData.departmentId, 10) : undefined;

      if (laboratoryModal.mode === 'create') {
        if (!laboratoryModal.formData.resourceCode.trim() || !laboratoryModal.formData.resourceName.trim()) {
          setLaboratoryModal((prev) => ({ ...prev, error: 'Resource Code and Name are required' }));
          return;
        }
        await laboratoriesModule.createLaboratory({
          resourceCode: laboratoryModal.formData.resourceCode.trim().toUpperCase(),
          resourceName: laboratoryModal.formData.resourceName.trim(),
          departmentId: deptId,
          building: laboratoryModal.formData.building.trim(),
          floor: floorNum,
          roomNumber: laboratoryModal.formData.roomNumber.trim(),
          capacity: cap,
          labType: laboratoryModal.formData.labType,
          computerCount: compCount,
          description: laboratoryModal.formData.description.trim() || undefined
        });
        showToast('Laboratory registered successfully');
      } else if (laboratoryModal.item) {
        await laboratoriesModule.updateLaboratory(laboratoryModal.item.id, {
          departmentId: deptId,
          building: laboratoryModal.formData.building.trim(),
          floor: floorNum,
          roomNumber: laboratoryModal.formData.roomNumber.trim(),
          capacity: cap,
          labType: laboratoryModal.formData.labType,
          computerCount: compCount,
          description: laboratoryModal.formData.description.trim() || undefined
        });
        showToast('Laboratory specifications updated');
      }
      setLaboratoryModal((prev) => ({ ...prev, isOpen: false, submitting: false }));
      refetchOverview();
    } catch (err: any) {
      setLaboratoryModal((prev) => ({
        ...prev,
        submitting: false,
        error: err?.response?.data?.message || err?.message || 'Operation failed'
      }));
    }
  };

  const handleToggleLaboratoryStatus = (lab: LaboratorySummaryItem, newStatus: ResourceStatusType) => {
    setStatusConfirm({
      isOpen: true,
      title: `${newStatus === 'MAINTENANCE' ? 'Set Laboratory to Maintenance' : `Update Laboratory Status to ${newStatus}`}`,
      description: `Laboratory "${lab.resourceName}" (${lab.roomNumber}) will be updated to ${newStatus}.`,
      confirmText: `Set ${newStatus}`,
      variant: newStatus === 'MAINTENANCE' ? 'warning' : 'primary',
      onConfirm: async () => {
        try {
          setStatusSubmitting(true);
          await laboratoriesModule.changeStatus(lab.id, newStatus);
          showToast(`Laboratory marked as ${newStatus}`);
          setStatusConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Failed to update lab status', 'error');
        } finally {
          setStatusSubmitting(false);
        }
      }
    });
  };

  const handleDeleteLaboratory = (lab: LaboratorySummaryItem) => {
    setDeleteConfirm({
      isOpen: true,
      title: `Delete Laboratory "${lab.resourceName}"`,
      description: `Are you sure you want to remove this laboratory record? Active timetable or resource dependencies will prevent deletion.`,
      onConfirm: async () => {
        try {
          setDeleteSubmitting(true);
          await laboratoriesModule.deleteLaboratory(lab.id);
          showToast('Laboratory deleted successfully');
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Cannot delete laboratory with existing dependencies', 'error');
        } finally {
          setDeleteSubmitting(false);
        }
      }
    });
  };

  const handleViewLaboratoryDetails = async (id: number) => {
    try {
      setDetailsModal({
        isOpen: true,
        title: 'Laboratory Details',
        loading: true,
        data: null,
        type: 'laboratory'
      });
      const res = await adminResourceApi.getLaboratoryById(id);
      setDetailsModal((prev) => ({ ...prev, loading: false, data: res.data }));
    } catch (err: any) {
      showToast('Failed to load laboratory details', 'error');
      setDetailsModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // ==========================================================================
  // HANDLERS FOR EQUIPMENT
  // ==========================================================================
  const handleOpenEquipmentCreate = () => {
    const firstResource = referenceData?.equipmentResources?.[0]?.id.toString() || '';
    setEquipmentModal({
      isOpen: true,
      mode: 'create',
      formData: {
        resourceId: firstResource,
        serialNumber: '',
        manufacturer: '',
        model: '',
        purchaseDate: '',
        warrantyExpiry: '',
        conditionStatus: 'EXCELLENT',
        quantity: '1'
      },
      submitting: false,
      error: null
    });
  };

  const handleOpenEquipmentEdit = (eq: EquipmentSummaryItem) => {
    setEquipmentModal({
      isOpen: true,
      mode: 'edit',
      item: eq,
      formData: {
        resourceId: eq.resourceId.toString(),
        serialNumber: eq.serialNumber,
        manufacturer: eq.manufacturer || '',
        model: eq.model || '',
        purchaseDate: '',
        warrantyExpiry: '',
        conditionStatus: eq.conditionStatus || 'GOOD',
        quantity: eq.quantity.toString()
      },
      submitting: false,
      error: null
    });
  };

  const handleSaveEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentModal.formData.serialNumber.trim()) {
      setEquipmentModal((prev) => ({ ...prev, error: 'Serial number is required' }));
      return;
    }
    const qty = parseInt(equipmentModal.formData.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setEquipmentModal((prev) => ({ ...prev, error: 'Quantity must be at least 1' }));
      return;
    }

    try {
      setEquipmentModal((prev) => ({ ...prev, submitting: true, error: null }));
      if (equipmentModal.mode === 'create') {
        if (!equipmentModal.formData.resourceId) {
          setEquipmentModal((prev) => ({ ...prev, error: 'Parent resource asset is required' }));
          return;
        }
        await equipmentModule.createEquipment({
          resourceId: parseInt(equipmentModal.formData.resourceId, 10),
          serialNumber: equipmentModal.formData.serialNumber.trim().toUpperCase(),
          manufacturer: equipmentModal.formData.manufacturer.trim() || undefined,
          model: equipmentModal.formData.model.trim() || undefined,
          purchaseDate: equipmentModal.formData.purchaseDate || undefined,
          warrantyExpiry: equipmentModal.formData.warrantyExpiry || undefined,
          conditionStatus: equipmentModal.formData.conditionStatus,
          quantity: qty
        });
        showToast('Equipment asset registered successfully');
      } else if (equipmentModal.item) {
        await equipmentModule.updateEquipment(equipmentModal.item.id, {
          manufacturer: equipmentModal.formData.manufacturer.trim() || undefined,
          model: equipmentModal.formData.model.trim() || undefined,
          purchaseDate: equipmentModal.formData.purchaseDate || undefined,
          warrantyExpiry: equipmentModal.formData.warrantyExpiry || undefined,
          conditionStatus: equipmentModal.formData.conditionStatus,
          quantity: qty
        });
        showToast('Equipment details updated');
      }
      setEquipmentModal((prev) => ({ ...prev, isOpen: false, submitting: false }));
      refetchOverview();
    } catch (err: any) {
      setEquipmentModal((prev) => ({
        ...prev,
        submitting: false,
        error: err?.response?.data?.message || err?.message || 'Operation failed'
      }));
    }
  };

  const handleToggleEquipmentStatus = (eq: EquipmentSummaryItem, newStatus: EquipmentStatusType) => {
    setStatusConfirm({
      isOpen: true,
      title: `Update Equipment Status to ${newStatus}`,
      description: `Equipment item "${eq.serialNumber}" will be updated to ${newStatus}.`,
      confirmText: `Set ${newStatus}`,
      variant: newStatus === 'UNDER_MAINTENANCE' ? 'warning' : newStatus === 'DECOMMISSIONED' ? 'danger' : 'primary',
      onConfirm: async () => {
        try {
          setStatusSubmitting(true);
          await equipmentModule.changeStatus(eq.id, newStatus);
          showToast(`Equipment status changed to ${newStatus}`);
          setStatusConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Failed to update equipment status', 'error');
        } finally {
          setStatusSubmitting(false);
        }
      }
    });
  };

  const handleDeleteEquipment = (eq: EquipmentSummaryItem) => {
    setDeleteConfirm({
      isOpen: true,
      title: `Delete Equipment "${eq.serialNumber}"`,
      description: `Are you sure you want to delete this equipment item from the inventory?`,
      onConfirm: async () => {
        try {
          setDeleteSubmitting(true);
          await equipmentModule.deleteEquipment(eq.id);
          showToast('Equipment deleted successfully');
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Cannot delete equipment item', 'error');
        } finally {
          setDeleteSubmitting(false);
        }
      }
    });
  };

  const handleViewEquipmentDetails = async (id: number) => {
    try {
      setDetailsModal({
        isOpen: true,
        title: 'Equipment Item Details',
        loading: true,
        data: null,
        type: 'equipment'
      });
      const res = await adminResourceApi.getEquipmentById(id);
      setDetailsModal((prev) => ({ ...prev, loading: false, data: res.data }));
    } catch (err: any) {
      showToast('Failed to load equipment details', 'error');
      setDetailsModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // ==========================================================================
  // HANDLERS FOR TIME SLOTS
  // ==========================================================================
  const handleOpenTimeSlotCreate = () => {
    setTimeSlotModal({
      isOpen: true,
      mode: 'create',
      formData: {
        name: '',
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '10:00'
      },
      submitting: false,
      error: null
    });
  };

  const handleOpenTimeSlotEdit = (ts: TimeSlotSummaryItem) => {
    setTimeSlotModal({
      isOpen: true,
      mode: 'edit',
      item: ts,
      formData: {
        name: ts.name,
        dayOfWeek: ts.dayOfWeek,
        startTime: ts.startTime,
        endTime: ts.endTime
      },
      submitting: false,
      error: null
    });
  };

  const handleSaveTimeSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeSlotModal.formData.name.trim()) {
      setTimeSlotModal((prev) => ({ ...prev, error: 'Time slot name is required (e.g. Period 1)' }));
      return;
    }
    if (!timeSlotModal.formData.startTime || !timeSlotModal.formData.endTime) {
      setTimeSlotModal((prev) => ({ ...prev, error: 'Start time and end time are required' }));
      return;
    }
    if (timeSlotModal.formData.startTime >= timeSlotModal.formData.endTime) {
      setTimeSlotModal((prev) => ({ ...prev, error: 'Start time must be earlier than end time' }));
      return;
    }

    try {
      setTimeSlotModal((prev) => ({ ...prev, submitting: true, error: null }));
      if (timeSlotModal.mode === 'create') {
        await timeSlotsModule.createTimeSlot({
          name: timeSlotModal.formData.name.trim(),
          dayOfWeek: timeSlotModal.formData.dayOfWeek,
          startTime: timeSlotModal.formData.startTime,
          endTime: timeSlotModal.formData.endTime
        });
        showToast('Time slot configured successfully');
      } else if (timeSlotModal.item) {
        await timeSlotsModule.updateTimeSlot(timeSlotModal.item.id, {
          name: timeSlotModal.formData.name.trim(),
          dayOfWeek: timeSlotModal.formData.dayOfWeek,
          startTime: timeSlotModal.formData.startTime,
          endTime: timeSlotModal.formData.endTime
        });
        showToast('Time slot updated successfully');
      }
      setTimeSlotModal((prev) => ({ ...prev, isOpen: false, submitting: false }));
      refetchOverview();
    } catch (err: any) {
      setTimeSlotModal((prev) => ({
        ...prev,
        submitting: false,
        error: err?.response?.data?.message || err?.message || 'Operation failed'
      }));
    }
  };

  const handleToggleTimeSlotStatus = (ts: TimeSlotSummaryItem) => {
    const nextStatus = ts.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStatusConfirm({
      isOpen: true,
      title: `${nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'} Time Slot`,
      description: `Mark slot "${ts.name}" (${ts.startTime} - ${ts.endTime}) as ${nextStatus}? Inactive time slots are hidden from future timetable builders.`,
      confirmText: nextStatus === 'ACTIVE' ? 'Activate' : 'Deactivate',
      variant: nextStatus === 'ACTIVE' ? 'primary' : 'warning',
      onConfirm: async () => {
        try {
          setStatusSubmitting(true);
          await timeSlotsModule.changeStatus(ts.id, nextStatus);
          showToast(`Time slot marked as ${nextStatus}`);
          setStatusConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Failed to update time slot status', 'error');
        } finally {
          setStatusSubmitting(false);
        }
      }
    });
  };

  const handleDeleteTimeSlot = (ts: TimeSlotSummaryItem) => {
    setDeleteConfirm({
      isOpen: true,
      title: `Delete Time Slot "${ts.name}"`,
      description: `Delete time slot (${ts.dayOfWeek} ${ts.startTime} - ${ts.endTime})? If linked to timetable schedules, deletion is strictly protected.`,
      onConfirm: async () => {
        try {
          setDeleteSubmitting(true);
          await timeSlotsModule.deleteTimeSlot(ts.id);
          showToast('Time slot removed successfully');
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
          refetchOverview();
        } catch (err: any) {
          showToast(err?.response?.data?.message || 'Cannot delete time slot with active timetable entries', 'error');
        } finally {
          setDeleteSubmitting(false);
        }
      }
    });
  };

  const handleViewTimeSlotDetails = async (id: number) => {
    try {
      setDetailsModal({
        isOpen: true,
        title: 'Time Slot Details',
        loading: true,
        data: null,
        type: 'time-slot'
      });
      const res = await adminResourceApi.getTimeSlotById(id);
      setDetailsModal((prev) => ({ ...prev, loading: false, data: res.data }));
    } catch (err: any) {
      showToast('Failed to load time slot details', 'error');
      setDetailsModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Navigation tab tabs list
  const tabItems: Array<{ id: ResourceTab; label: string; icon: React.FC<any>; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'categories', label: 'Categories', icon: FolderTree, count: overview?.totalCategories },
    { id: 'resources', label: 'Resources', icon: Layers, count: overview?.totalResources },
    { id: 'classrooms', label: 'Classrooms', icon: Building2, count: overview?.totalClassrooms },
    { id: 'laboratories', label: 'Laboratories', icon: Cpu, count: overview?.totalLaboratories },
    { id: 'equipment', label: 'Equipment', icon: Box, count: overview?.totalEquipment },
    { id: 'time-slots', label: 'Time Slots', icon: Clock, count: overview?.totalTimeSlots }
  ];

  return (
    <PageContainer>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm font-medium transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-950/90 text-rose-300 border border-rose-500/30'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title="Academic Resource Management"
        description="Physical space inventory, lecture halls, laboratory configurations, equipment tracking, and timetable slot scheduling"
        badge={
          <Badge variant="teal" dot size="sm">
            Phase 10 Baseline Active
          </Badge>
        }
        primaryAction={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchOverview();
              if (activeTab === 'categories') categoriesModule.refetch();
              if (activeTab === 'resources') resourcesModule.refetch();
              if (activeTab === 'classrooms') classroomsModule.refetch();
              if (activeTab === 'laboratories') laboratoriesModule.refetch();
              if (activeTab === 'equipment') equipmentModule.refetch();
              if (activeTab === 'time-slots') timeSlotsModule.refetch();
              showToast('Resource data refreshed');
            }}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh
          </Button>
        }
      />

      {/* Navigation Tabs Bar */}
      <div className="mb-6 border-b border-[#1E2330]">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-px">
          {tabItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-teal-500 text-teal-400 bg-teal-500/5'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 text-xs rounded-full font-mono ${
                      isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-[#1E2330] text-gray-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. OVERVIEW TAB                                                      */}
      {/* ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {overviewLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Primary KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Academic Resources"
                  value={overview?.totalResources ?? 0}
                  description="All registered space & equipment"
                  icon={Layers}
                  badge={<Badge variant="teal">Inventory</Badge>}
                />
                <StatCard
                  title="Available Resources"
                  value={overview?.availableResources ?? 0}
                  description="Ready for allocation"
                  icon={CheckCircle}
                  badge={<Badge variant="success">Operational</Badge>}
                />
                <StatCard
                  title="In Maintenance"
                  value={overview?.maintenanceResources ?? 0}
                  description="Under service or repairs"
                  icon={Wrench}
                  badge={<Badge variant="warning">Maintenance</Badge>}
                />
                <StatCard
                  title="Classrooms & Halls"
                  value={overview?.totalClassrooms ?? 0}
                  description="Lecture halls & seminar rooms"
                  icon={Building2}
                  badge={<Badge variant="blue">Physical Rooms</Badge>}
                />
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Laboratories"
                  value={overview?.totalLaboratories ?? 0}
                  description="Departmental lab facilities"
                  icon={Cpu}
                  badge={<Badge variant="purple">Specialized</Badge>}
                />
                <StatCard
                  title="Equipment Items"
                  value={overview?.totalEquipment ?? 0}
                  description="Individual tracked apparatus"
                  icon={Box}
                  badge={<Badge variant="orange">Assets</Badge>}
                />
                <StatCard
                  title="Scheduled Time Slots"
                  value={overview?.totalTimeSlots ?? 0}
                  description="Master institutional periods"
                  icon={Clock}
                  badge={<Badge variant="teal">Time Master</Badge>}
                />
              </div>

              {/* No resources zero state */}
              {overview?.totalResources === 0 && (
                <Card className="p-8 text-center bg-[#11141C] border-[#1E2330]">
                  <Layers className="w-12 h-12 text-gray-500 mx-auto mb-3 opacity-60" />
                  <h3 className="text-lg font-semibold text-gray-200 mb-1">
                    No academic resources have been configured yet.
                  </h3>
                  <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                    Get started by adding resource categories, registering classrooms, setting up laboratories,
                    or scheduling standard institutional time slots.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button size="sm" onClick={() => handleTabChange('categories')}>
                      Manage Categories
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleTabChange('classrooms')}>
                      Add Classroom
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleTabChange('time-slots')}>
                      Configure Time Slots
                    </Button>
                  </div>
                </Card>
              )}

              {/* Module Quick Jumper Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <Card
                  className="p-5 hover:border-teal-500/40 cursor-pointer transition-all bg-[#11141C] border-[#1E2330] group"
                  onClick={() => handleTabChange('categories')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/20 transition-colors">
                      <FolderTree className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">Resource Categories</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Classroom, Laboratory, Equipment, Auditorium, and Seminar Hall taxonomic categories.
                  </p>
                </Card>

                <Card
                  className="p-5 hover:border-purple-500/40 cursor-pointer transition-all bg-[#11141C] border-[#1E2330] group"
                  onClick={() => handleTabChange('classrooms')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">Classroom Management</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Room numbers, seating capacities, smart boards, projector capabilities, and building floors.
                  </p>
                </Card>

                <Card
                  className="p-5 hover:border-blue-500/40 cursor-pointer transition-all bg-[#11141C] border-[#1E2330] group"
                  onClick={() => handleTabChange('laboratories')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">Laboratory Directory</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Department affiliations, workstation capacities, specialized lab types, and equipment links.
                  </p>
                </Card>

                <Card
                  className="p-5 hover:border-amber-500/40 cursor-pointer transition-all bg-[#11141C] border-[#1E2330] group"
                  onClick={() => handleTabChange('equipment')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition-colors">
                      <Box className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">Apparatus & Equipment</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Serial numbers, manufacturers, model identifiers, warranty schedules, and operational conditions.
                  </p>
                </Card>

                <Card
                  className="p-5 hover:border-emerald-500/40 cursor-pointer transition-all bg-[#11141C] border-[#1E2330] group"
                  onClick={() => handleTabChange('time-slots')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                      <Clock className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">Master Time Slots</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Weekly scheduling periods, standard class durations, and institutional timetable slots.
                  </p>
                </Card>

                <Card
                  className="p-5 hover:border-cyan-500/40 cursor-pointer transition-all bg-[#11141C] border-[#1E2330] group"
                  onClick={() => handleTabChange('resources')}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-base font-semibold text-white mb-1">All Academic Resources</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Unified catalog table with multi-factor search, category filtering, and status controls.
                  </p>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. CATEGORIES TAB                                                    */}
      {/* ==================================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141C] p-4 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search categories..."
                  value={categoriesModule.search}
                  onChange={(e) => categoriesModule.setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={categoriesModule.status}
                onChange={(e) => categoriesModule.setStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' }
                ]}
                className="w-36"
              />
            </div>
            <Button size="sm" onClick={handleOpenCategoryCreate}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Category
            </Button>
          </div>

          <Card className="overflow-hidden border-[#1E2330] bg-[#11141C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0E1017] text-gray-400 uppercase text-[11px] font-semibold border-b border-[#1E2330]">
                  <tr>
                    <th className="px-5 py-3">Category Code</th>
                    <th className="px-5 py-3">Category Name</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Resources</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2330] text-gray-300">
                  {categoriesModule.loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-5 py-4">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : !categoriesModule.data?.content || categoriesModule.data.content.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <EmptyState
                          title="No Resource Categories Found"
                          description="No category records match your current filter criteria."
                          icon={FolderTree}
                          actionLabel="Create First Category"
                          onAction={handleOpenCategoryCreate}
                        />
                      </td>
                    </tr>
                  ) : (
                    categoriesModule.data.content.map((cat) => (
                      <tr key={cat.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-teal-400">
                          {cat.code}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-white">{cat.name}</td>
                        <td className="px-5 py-3.5 text-gray-400 max-w-xs truncate">
                          {cat.description || <span className="text-gray-600 italic">No description</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#1E2330] text-gray-300">
                            {cat.totalResources} assets
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={getStatusBadgeVariant(cat.status)} size="sm">
                            {cat.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenCategoryEdit(cat)}
                              title="Edit Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleCategoryStatus(cat)}
                              title={cat.status === 'ACTIVE' ? 'Deactivate Category' : 'Activate Category'}
                            >
                              {cat.status === 'ACTIVE' ? (
                                <XCircle className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(cat)}
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {categoriesModule.data && categoriesModule.data.totalPages > 1 && (
              <div className="p-4 border-t border-[#1E2330]">
                <Pagination
                  currentPage={categoriesModule.page + 1}
                  totalPages={categoriesModule.data.totalPages}
                  totalRecords={categoriesModule.data.totalElements}
                  pageSize={categoriesModule.size}
                  onPageChange={(p) => categoriesModule.setPage(p - 1)}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. ACADEMIC RESOURCES TAB                                            */}
      {/* ==================================================================== */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#11141C] p-4 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[180px] max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search code or name..."
                  value={resourcesModule.search}
                  onChange={(e) => resourcesModule.setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={resourcesModule.categoryId ? resourcesModule.categoryId.toString() : ''}
                onChange={(e) => resourcesModule.setCategoryId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                options={[
                  { value: '', label: 'All Categories' },
                  ...(referenceData?.categories.map((c) => ({ value: c.id.toString(), label: c.name })) || [])
                ]}
                className="w-40"
              />
              <Select
                value={resourcesModule.departmentId ? resourcesModule.departmentId.toString() : ''}
                onChange={(e) => resourcesModule.setDepartmentId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                options={[
                  { value: '', label: 'All Departments' },
                  ...(referenceData?.departments.map((d) => ({ value: d.id.toString(), label: d.name })) || [])
                ]}
                className="w-44"
              />
              <Select
                value={resourcesModule.status}
                onChange={(e) => resourcesModule.setStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'ALLOCATED', label: 'Allocated' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'INACTIVE', label: 'Inactive' }
                ]}
                className="w-36"
              />
            </div>
            <Button size="sm" onClick={handleOpenResourceCreate}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Resource
            </Button>
          </div>

          <Card className="overflow-hidden border-[#1E2330] bg-[#11141C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0E1017] text-gray-400 uppercase text-[11px] font-semibold border-b border-[#1E2330]">
                  <tr>
                    <th className="px-5 py-3">Resource Code</th>
                    <th className="px-5 py-3">Resource Name</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Capacity</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2330] text-gray-300">
                  {resourcesModule.loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8} className="px-5 py-4">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : !resourcesModule.data?.content || resourcesModule.data.content.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center">
                        <EmptyState
                          title="No Academic Resources Found"
                          description="No resources match your filter criteria. Configure physical rooms, lab assets, or equipment."
                          icon={Layers}
                          actionLabel="Register Resource"
                          onAction={handleOpenResourceCreate}
                        />
                      </td>
                    </tr>
                  ) : (
                    resourcesModule.data.content.map((res) => (
                      <tr key={res.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-teal-400">
                          {res.code}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-white">{res.name}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                            {res.categoryName}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400">
                          {res.departmentName || <span className="text-gray-600">Institutional</span>}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-300">
                          {res.capacity ? `${res.capacity} seats` : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs">
                          {res.location || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={getStatusBadgeVariant(res.status)} size="sm">
                            {res.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewResourceDetails(res.id)}
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenResourceEdit(res)}
                              title="Edit Resource"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            {res.status !== 'MAINTENANCE' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleResourceStatus(res, 'MAINTENANCE')}
                                title="Set to Maintenance"
                              >
                                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleResourceStatus(res, 'AVAILABLE')}
                                title="Mark Available"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteResource(res)}
                              title="Delete Resource"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {resourcesModule.data && resourcesModule.data.totalPages > 1 && (
              <div className="p-4 border-t border-[#1E2330]">
                <Pagination
                  currentPage={resourcesModule.page + 1}
                  totalPages={resourcesModule.data.totalPages}
                  totalRecords={resourcesModule.data.totalElements}
                  pageSize={resourcesModule.size}
                  onPageChange={(p) => resourcesModule.setPage(p - 1)}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. CLASSROOMS TAB                                                    */}
      {/* ==================================================================== */}
      {activeTab === 'classrooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141C] p-4 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search room or hall..."
                  value={classroomsModule.search}
                  onChange={(e) => classroomsModule.setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Input
                placeholder="Building filter..."
                value={classroomsModule.building}
                onChange={(e) => classroomsModule.setBuilding(e.target.value)}
                className="w-40"
              />
              <Select
                value={classroomsModule.status}
                onChange={(e) => classroomsModule.setStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'ALLOCATED', label: 'Allocated' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'INACTIVE', label: 'Inactive' }
                ]}
                className="w-36"
              />
            </div>
            <Button size="sm" onClick={handleOpenClassroomCreate}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Classroom
            </Button>
          </div>

          <Card className="overflow-hidden border-[#1E2330] bg-[#11141C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0E1017] text-gray-400 uppercase text-[11px] font-semibold border-b border-[#1E2330]">
                  <tr>
                    <th className="px-5 py-3">Room / Code</th>
                    <th className="px-5 py-3">Classroom Name</th>
                    <th className="px-5 py-3">Building & Floor</th>
                    <th className="px-5 py-3">Capacity</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Amenities</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2330] text-gray-300">
                  {classroomsModule.loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8} className="px-5 py-4">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : !classroomsModule.data?.content || classroomsModule.data.content.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center">
                        <EmptyState
                          title="No Classrooms Configured"
                          description="No lecture halls, seminar spaces, or classrooms have been recorded in the system."
                          icon={Building2}
                          actionLabel="Register First Classroom"
                          onAction={handleOpenClassroomCreate}
                        />
                      </td>
                    </tr>
                  ) : (
                    classroomsModule.data.content.map((cls) => (
                      <tr key={cls.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-white font-mono text-xs">{cls.roomNumber}</div>
                          <div className="text-[11px] text-teal-400/80 font-mono">{cls.resourceCode}</div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-white">{cls.resourceName}</td>
                        <td className="px-5 py-3.5 text-gray-300 text-xs">
                          {cls.building}, Floor {cls.floor}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-300">
                          {cls.capacity} seats
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1E2330] text-gray-300">
                            {cls.roomType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {cls.hasProjector && (
                              <span className="p-1 rounded bg-teal-500/10 text-teal-400 text-[10px] flex items-center gap-1" title="Projector Available">
                                <Tv className="w-3 h-3" />
                              </span>
                            )}
                            {cls.hasAc && (
                              <span className="p-1 rounded bg-blue-500/10 text-blue-400 text-[10px] flex items-center gap-1" title="Air Conditioned">
                                <AirVent className="w-3 h-3" />
                              </span>
                            )}
                            {cls.hasSmartBoard && (
                              <span className="p-1 rounded bg-purple-500/10 text-purple-400 text-[10px] flex items-center gap-1" title="Smart Interactive Board">
                                <Tv2 className="w-3 h-3" />
                              </span>
                            )}
                            {!cls.hasProjector && !cls.hasAc && !cls.hasSmartBoard && (
                              <span className="text-gray-600 text-xs italic">Standard</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={getStatusBadgeVariant(cls.status)} size="sm">
                            {cls.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewClassroomDetails(cls.id)}
                              title="View Specifications"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenClassroomEdit(cls)}
                              title="Edit Classroom"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            {cls.status !== 'MAINTENANCE' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleClassroomStatus(cls, 'MAINTENANCE')}
                                title="Set to Maintenance"
                              >
                                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleClassroomStatus(cls, 'AVAILABLE')}
                                title="Mark Available"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClassroom(cls)}
                              title="Delete Classroom"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {classroomsModule.data && classroomsModule.data.totalPages > 1 && (
              <div className="p-4 border-t border-[#1E2330]">
                <Pagination
                  currentPage={classroomsModule.page + 1}
                  totalPages={classroomsModule.data.totalPages}
                  totalRecords={classroomsModule.data.totalElements}
                  pageSize={classroomsModule.size}
                  onPageChange={(p) => classroomsModule.setPage(p - 1)}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. LABORATORIES TAB                                                  */}
      {/* ==================================================================== */}
      {activeTab === 'laboratories' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141C] p-4 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search lab name or room..."
                  value={laboratoriesModule.search}
                  onChange={(e) => laboratoriesModule.setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={laboratoriesModule.departmentId ? laboratoriesModule.departmentId.toString() : ''}
                onChange={(e) => laboratoriesModule.setDepartmentId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                options={[
                  { value: '', label: 'All Departments' },
                  ...(referenceData?.departments.map((d) => ({ value: d.id.toString(), label: d.name })) || [])
                ]}
                className="w-48"
              />
              <Select
                value={laboratoriesModule.status}
                onChange={(e) => laboratoriesModule.setStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'AVAILABLE', label: 'Available' },
                  { value: 'ALLOCATED', label: 'Allocated' },
                  { value: 'MAINTENANCE', label: 'Maintenance' },
                  { value: 'INACTIVE', label: 'Inactive' }
                ]}
                className="w-36"
              />
            </div>
            <Button size="sm" onClick={handleOpenLaboratoryCreate}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Laboratory
            </Button>
          </div>

          <Card className="overflow-hidden border-[#1E2330] bg-[#11141C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0E1017] text-gray-400 uppercase text-[11px] font-semibold border-b border-[#1E2330]">
                  <tr>
                    <th className="px-5 py-3">Lab Room / Code</th>
                    <th className="px-5 py-3">Laboratory Name</th>
                    <th className="px-5 py-3">Department</th>
                    <th className="px-5 py-3">Building & Floor</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Capacity & PCs</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2330] text-gray-300">
                  {laboratoriesModule.loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8} className="px-5 py-4">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : !laboratoriesModule.data?.content || laboratoriesModule.data.content.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center">
                        <EmptyState
                          title="No Laboratories Configured"
                          description="No laboratory suites or technical workshops are registered in the system."
                          icon={Cpu}
                          actionLabel="Register First Laboratory"
                          onAction={handleOpenLaboratoryCreate}
                        />
                      </td>
                    </tr>
                  ) : (
                    laboratoriesModule.data.content.map((lab) => (
                      <tr key={lab.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-white font-mono text-xs">{lab.roomNumber}</div>
                          <div className="text-[11px] text-blue-400/80 font-mono">{lab.resourceCode}</div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-white">{lab.resourceName}</td>
                        <td className="px-5 py-3.5 text-gray-300 text-xs">
                          {lab.departmentName || <span className="text-gray-600">Institutional</span>}
                        </td>
                        <td className="px-5 py-3.5 text-gray-300 text-xs">
                          {lab.building}, Floor {lab.floor}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium">
                            {lab.labType}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-xs font-mono text-gray-300">{lab.capacity} seats</div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Monitor className="w-3 h-3 text-teal-400" />
                            {lab.computerCount} workstations
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={getStatusBadgeVariant(lab.status)} size="sm">
                            {lab.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewLaboratoryDetails(lab.id)}
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenLaboratoryEdit(lab)}
                              title="Edit Laboratory"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            {lab.status !== 'MAINTENANCE' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleLaboratoryStatus(lab, 'MAINTENANCE')}
                                title="Set to Maintenance"
                              >
                                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleLaboratoryStatus(lab, 'AVAILABLE')}
                                title="Mark Available"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLaboratory(lab)}
                              title="Delete Laboratory"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {laboratoriesModule.data && laboratoriesModule.data.totalPages > 1 && (
              <div className="p-4 border-t border-[#1E2330]">
                <Pagination
                  currentPage={laboratoriesModule.page + 1}
                  totalPages={laboratoriesModule.data.totalPages}
                  totalRecords={laboratoriesModule.data.totalElements}
                  pageSize={laboratoriesModule.size}
                  onPageChange={(p) => laboratoriesModule.setPage(p - 1)}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 6. EQUIPMENT TAB                                                     */}
      {/* ==================================================================== */}
      {activeTab === 'equipment' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141C] p-4 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search serial, model..."
                  value={equipmentModule.search}
                  onChange={(e) => equipmentModule.setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={equipmentModule.status}
                onChange={(e) => equipmentModule.setStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Conditions' },
                  { value: 'FUNCTIONAL', label: 'Functional' },
                  { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
                  { value: 'DEFECTIVE', label: 'Defective' },
                  { value: 'DECOMMISSIONED', label: 'Decommissioned' }
                ]}
                className="w-44"
              />
            </div>
            <Button size="sm" onClick={handleOpenEquipmentCreate}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Equipment
            </Button>
          </div>

          <Card className="overflow-hidden border-[#1E2330] bg-[#11141C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0E1017] text-gray-400 uppercase text-[11px] font-semibold border-b border-[#1E2330]">
                  <tr>
                    <th className="px-5 py-3">Serial Number</th>
                    <th className="px-5 py-3">Asset Item</th>
                    <th className="px-5 py-3">Manufacturer & Model</th>
                    <th className="px-5 py-3">Condition</th>
                    <th className="px-5 py-3">Quantity</th>
                    <th className="px-5 py-3">Operational Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2330] text-gray-300">
                  {equipmentModule.loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={7} className="px-5 py-4">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : !equipmentModule.data?.content || equipmentModule.data.content.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center">
                        <EmptyState
                          title="No Equipment Found"
                          description="No individual laboratory apparatus, smart projectors, or hardware units configured."
                          icon={Box}
                          actionLabel="Register Equipment Item"
                          onAction={handleOpenEquipmentCreate}
                        />
                      </td>
                    </tr>
                  ) : (
                    equipmentModule.data.content.map((eq) => (
                      <tr key={eq.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-amber-400">
                          {eq.serialNumber}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-white">{eq.resourceName}</div>
                          <div className="text-[11px] text-gray-500 font-mono">{eq.resourceCode}</div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-300 text-xs">
                          {eq.manufacturer ? `${eq.manufacturer} ` : ''}
                          {eq.model && <span className="text-gray-400">({eq.model})</span>}
                          {!eq.manufacturer && !eq.model && <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs px-2 py-0.5 rounded bg-[#1E2330] text-gray-300">
                            {eq.conditionStatus || 'OPERATIONAL'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-300">
                          {eq.quantity} units
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant={
                              eq.status === 'FUNCTIONAL'
                                ? 'success'
                                : eq.status === 'UNDER_MAINTENANCE'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {eq.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewEquipmentDetails(eq.id)}
                              title="View Equipment"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEquipmentEdit(eq)}
                              title="Edit Equipment"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleToggleEquipmentStatus(
                                  eq,
                                  eq.status === 'FUNCTIONAL' ? 'UNDER_MAINTENANCE' : 'FUNCTIONAL'
                                )
                              }
                              title={
                                eq.status === 'FUNCTIONAL'
                                  ? 'Flag Under Maintenance'
                                  : 'Mark Functional'
                              }
                            >
                              {eq.status === 'FUNCTIONAL' ? (
                                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEquipment(eq)}
                              title="Delete Equipment"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {equipmentModule.data && equipmentModule.data.totalPages > 1 && (
              <div className="p-4 border-t border-[#1E2330]">
                <Pagination
                  currentPage={equipmentModule.page + 1}
                  totalPages={equipmentModule.data.totalPages}
                  totalRecords={equipmentModule.data.totalElements}
                  pageSize={equipmentModule.size}
                  onPageChange={(p) => equipmentModule.setPage(p - 1)}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 7. TIME SLOTS TAB                                                    */}
      {/* ==================================================================== */}
      {activeTab === 'time-slots' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11141C] p-4 rounded-xl border border-[#1E2330]">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <Input
                  placeholder="Search slot name (Period 1)..."
                  value={timeSlotsModule.search}
                  onChange={(e) => timeSlotsModule.setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={timeSlotsModule.dayOfWeek}
                onChange={(e) => timeSlotsModule.setDayOfWeek(e.target.value)}
                options={[
                  { value: '', label: 'All Days' },
                  { value: 'MONDAY', label: 'Monday' },
                  { value: 'TUESDAY', label: 'Tuesday' },
                  { value: 'WEDNESDAY', label: 'Wednesday' },
                  { value: 'THURSDAY', label: 'Thursday' },
                  { value: 'FRIDAY', label: 'Friday' },
                  { value: 'SATURDAY', label: 'Saturday' }
                ]}
                className="w-36"
              />
              <Select
                value={timeSlotsModule.status}
                onChange={(e) => timeSlotsModule.setStatus(e.target.value)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' }
                ]}
                className="w-36"
              />
            </div>
            <Button size="sm" onClick={handleOpenTimeSlotCreate}>
              <Plus className="w-4 h-4 mr-1.5" />
              Add Time Slot
            </Button>
          </div>

          <Card className="overflow-hidden border-[#1E2330] bg-[#11141C]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0E1017] text-gray-400 uppercase text-[11px] font-semibold border-b border-[#1E2330]">
                  <tr>
                    <th className="px-5 py-3">Slot Designation</th>
                    <th className="px-5 py-3">Day of Week</th>
                    <th className="px-5 py-3">Start Time</th>
                    <th className="px-5 py-3">End Time</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2330] text-gray-300">
                  {timeSlotsModule.loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-5 py-4">
                          <Skeleton className="h-6 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : !timeSlotsModule.data?.content || timeSlotsModule.data.content.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <EmptyState
                          title="No Time Slots Configured"
                          description="Define the standard class hours and lecture time frames required for the future timetable generator."
                          icon={Clock}
                          actionLabel="Define First Time Slot"
                          onAction={handleOpenTimeSlotCreate}
                        />
                      </td>
                    </tr>
                  ) : (
                    timeSlotsModule.data.content.map((ts) => (
                      <tr key={ts.id} className="hover:bg-[#161B26] transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-teal-400" />
                          {ts.name}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
                            {ts.dayOfWeek}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-sm text-gray-200">
                          {ts.startTime}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-sm text-gray-200">
                          {ts.endTime}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={getStatusBadgeVariant(ts.status)} size="sm">
                            {ts.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewTimeSlotDetails(ts.id)}
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenTimeSlotEdit(ts)}
                              title="Edit Time Slot"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleTimeSlotStatus(ts)}
                              title={ts.status === 'ACTIVE' ? 'Deactivate Slot' : 'Activate Slot'}
                            >
                              {ts.status === 'ACTIVE' ? (
                                <XCircle className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTimeSlot(ts)}
                              title="Delete Time Slot"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {timeSlotsModule.data && timeSlotsModule.data.totalPages > 1 && (
              <div className="p-4 border-t border-[#1E2330]">
                <Pagination
                  currentPage={timeSlotsModule.page + 1}
                  totalPages={timeSlotsModule.data.totalPages}
                  totalRecords={timeSlotsModule.data.totalElements}
                  pageSize={timeSlotsModule.size}
                  onPageChange={(p) => timeSlotsModule.setPage(p - 1)}
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODALS & CONFIRM DIALOGS                                             */}
      {/* ==================================================================== */}

      {/* Status Confirm Dialog */}
      <ConfirmDialog
        isOpen={statusConfirm.isOpen}
        title={statusConfirm.title}
        description={statusConfirm.description}
        confirmText={statusConfirm.confirmText}
        variant={statusConfirm.variant}
        isLoading={statusSubmitting}
        onConfirm={statusConfirm.onConfirm}
        onClose={() => setStatusConfirm((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Delete Protected Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.title}
        description={deleteConfirm.description}
        confirmText="Confirm Delete"
        variant="danger"
        isLoading={deleteSubmitting}
        onConfirm={deleteConfirm.onConfirm}
        onClose={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Category Create/Edit Modal */}
      <Modal
        isOpen={categoryModal.isOpen}
        title={categoryModal.mode === 'create' ? 'Create Resource Category' : 'Edit Resource Category'}
        description="Categorize physical assets (Classrooms, Laboratories, Equipment, Auditoriums)"
        onClose={() => setCategoryModal((prev) => ({ ...prev, isOpen: false }))}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveCategory} isLoading={categoryModal.submitting}>
              {categoryModal.mode === 'create' ? 'Create Category' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          {categoryModal.error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
              {categoryModal.error}
            </div>
          )}
          {categoryModal.mode === 'create' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Category Code <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. CLASSROOM, LABORATORY, EQUIPMENT"
                value={categoryModal.formData.code}
                onChange={(e) =>
                  setCategoryModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, code: e.target.value }
                  }))
                }
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">
                Category Code (Immutable)
              </label>
              <div className="px-3 py-2 bg-[#0E1017] border border-[#1E2330] rounded-lg text-xs font-mono text-gray-400">
                {categoryModal.formData.code}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
              Category Name <span className="text-rose-400">*</span>
            </label>
            <Input
              placeholder="e.g. Academic Lecture Hall"
              value={categoryModal.formData.name}
              onChange={(e) =>
                setCategoryModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, name: e.target.value }
                }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
              Description
            </label>
            <Input
              placeholder="Optional description of the category..."
              value={categoryModal.formData.description}
              onChange={(e) =>
                setCategoryModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, description: e.target.value }
                }))
              }
            />
          </div>
        </form>
      </Modal>

      {/* Resource Create/Edit Modal */}
      <Modal
        isOpen={resourceModal.isOpen}
        title={resourceModal.mode === 'create' ? 'Register Academic Resource' : 'Update Resource'}
        description="Physical space or equipment record in institutional inventory"
        onClose={() => setResourceModal((prev) => ({ ...prev, isOpen: false }))}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResourceModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveResource} isLoading={resourceModal.submitting}>
              {resourceModal.mode === 'create' ? 'Register Resource' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveResource} className="space-y-4">
          {resourceModal.error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
              {resourceModal.error}
            </div>
          )}
          {resourceModal.mode === 'create' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <Select
                  value={resourceModal.formData.categoryId}
                  onChange={(e) =>
                    setResourceModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, categoryId: e.target.value }
                    }))
                  }
                  options={
                    referenceData?.categories.map((c) => ({
                      value: c.id.toString(),
                      label: `${c.name} (${c.code})`
                    })) || []
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Department
                </label>
                <Select
                  value={resourceModal.formData.departmentId}
                  onChange={(e) =>
                    setResourceModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, departmentId: e.target.value }
                    }))
                  }
                  options={[
                    { value: '', label: 'Institutional / Common' },
                    ...(referenceData?.departments.map((d) => ({
                      value: d.id.toString(),
                      label: d.name
                    })) || [])
                  ]}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resourceModal.mode === 'create' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Resource Code <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="e.g. RES-CSE-LH1"
                  value={resourceModal.formData.code}
                  onChange={(e) =>
                    setResourceModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, code: e.target.value }
                    }))
                  }
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">
                  Resource Code
                </label>
                <div className="px-3 py-2 bg-[#0E1017] border border-[#1E2330] rounded-lg text-xs font-mono text-gray-400">
                  {resourceModal.formData.code}
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Resource Name <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. CSE Main Lecture Hall"
                value={resourceModal.formData.name}
                onChange={(e) =>
                  setResourceModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, name: e.target.value }
                  }))
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Seating Capacity
              </label>
              <Input
                type="number"
                min="1"
                placeholder="60"
                value={resourceModal.formData.capacity}
                onChange={(e) =>
                  setResourceModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, capacity: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Location
              </label>
              <Input
                placeholder="Block B, 3rd Floor"
                value={resourceModal.formData.location}
                onChange={(e) =>
                  setResourceModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, location: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Quantity
              </label>
              <Input
                type="number"
                min="1"
                value={resourceModal.formData.quantity}
                onChange={(e) =>
                  setResourceModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, quantity: e.target.value }
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
              Description
            </label>
            <Input
              placeholder="Technical features, acoustic insulation, access instructions..."
              value={resourceModal.formData.description}
              onChange={(e) =>
                setResourceModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, description: e.target.value }
                }))
              }
            />
          </div>
        </form>
      </Modal>

      {/* Classroom Create/Edit Modal */}
      <Modal
        isOpen={classroomModal.isOpen}
        title={classroomModal.mode === 'create' ? 'Register New Classroom' : 'Edit Classroom Specifications'}
        description="Physical lecture space with seating capacity and pedagogical amenities"
        onClose={() => setClassroomModal((prev) => ({ ...prev, isOpen: false }))}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClassroomModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveClassroom} isLoading={classroomModal.submitting}>
              {classroomModal.mode === 'create' ? 'Create Classroom' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveClassroom} className="space-y-4">
          {classroomModal.error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
              {classroomModal.error}
            </div>
          )}
          {classroomModal.mode === 'create' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Resource Code <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="e.g. CLS-B1-101"
                  value={classroomModal.formData.resourceCode}
                  onChange={(e) =>
                    setClassroomModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, resourceCode: e.target.value }
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Classroom Name <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="e.g. Ramanujan Hall"
                  value={classroomModal.formData.resourceName}
                  onChange={(e) =>
                    setClassroomModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, resourceName: e.target.value }
                    }))
                  }
                  required
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Building Name <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. Academic Block A"
                value={classroomModal.formData.building}
                onChange={(e) =>
                  setClassroomModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, building: e.target.value }
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Floor
              </label>
              <Input
                type="number"
                placeholder="1"
                value={classroomModal.formData.floor}
                onChange={(e) =>
                  setClassroomModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, floor: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Room Number <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. 101, 302B"
                value={classroomModal.formData.roomNumber}
                onChange={(e) =>
                  setClassroomModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, roomNumber: e.target.value }
                  }))
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Seating Capacity <span className="text-rose-400">*</span>
              </label>
              <Input
                type="number"
                min="1"
                placeholder="60"
                value={classroomModal.formData.capacity}
                onChange={(e) =>
                  setClassroomModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, capacity: e.target.value }
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Room Type
              </label>
              <Select
                value={classroomModal.formData.roomType}
                onChange={(e) =>
                  setClassroomModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, roomType: e.target.value }
                  }))
                }
                options={[
                  { value: 'LECTURE_HALL', label: 'Lecture Hall' },
                  { value: 'SEMINAR_ROOM', label: 'Seminar Room' },
                  { value: 'TUTORIAL_ROOM', label: 'Tutorial Room' },
                  { value: 'AUDITORIUM', label: 'Auditorium' }
                ]}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
              Equipped Amenities
            </label>
            <div className="flex flex-wrap items-center gap-4 p-3 bg-[#0E1017] border border-[#1E2330] rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={classroomModal.formData.hasProjector}
                  onChange={(e) =>
                    setClassroomModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, hasProjector: e.target.checked }
                    }))
                  }
                  className="rounded border-[#1E2330] bg-[#11141C] text-teal-500 focus:ring-teal-500/20"
                />
                <span>Digital Projector</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={classroomModal.formData.hasAc}
                  onChange={(e) =>
                    setClassroomModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, hasAc: e.target.checked }
                    }))
                  }
                  className="rounded border-[#1E2330] bg-[#11141C] text-teal-500 focus:ring-teal-500/20"
                />
                <span>Air Conditioning (AC)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={classroomModal.formData.hasSmartBoard}
                  onChange={(e) =>
                    setClassroomModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, hasSmartBoard: e.target.checked }
                    }))
                  }
                  className="rounded border-[#1E2330] bg-[#11141C] text-teal-500 focus:ring-teal-500/20"
                />
                <span>Smart Board</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
              Description / Notes
            </label>
            <Input
              placeholder="Audio PA system, tier-seating layout..."
              value={classroomModal.formData.description}
              onChange={(e) =>
                setClassroomModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, description: e.target.value }
                }))
              }
            />
          </div>
        </form>
      </Modal>

      {/* Laboratory Create/Edit Modal */}
      <Modal
        isOpen={laboratoryModal.isOpen}
        title={laboratoryModal.mode === 'create' ? 'Register Laboratory' : 'Edit Laboratory Specifications'}
        description="Departmental laboratory facility with computing or experimental workstations"
        onClose={() => setLaboratoryModal((prev) => ({ ...prev, isOpen: false }))}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLaboratoryModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveLaboratory} isLoading={laboratoryModal.submitting}>
              {laboratoryModal.mode === 'create' ? 'Register Lab' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveLaboratory} className="space-y-4">
          {laboratoryModal.error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
              {laboratoryModal.error}
            </div>
          )}
          {laboratoryModal.mode === 'create' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Resource Code <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="e.g. LAB-CSE-01"
                  value={laboratoryModal.formData.resourceCode}
                  onChange={(e) =>
                    setLaboratoryModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, resourceCode: e.target.value }
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Laboratory Name <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="e.g. Artificial Intelligence Computing Lab"
                  value={laboratoryModal.formData.resourceName}
                  onChange={(e) =>
                    setLaboratoryModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, resourceName: e.target.value }
                    }))
                  }
                  required
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Affiliated Department
              </label>
              <Select
                value={laboratoryModal.formData.departmentId}
                onChange={(e) =>
                  setLaboratoryModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, departmentId: e.target.value }
                  }))
                }
                options={[
                  { value: '', label: 'Common Institutional Lab' },
                  ...(referenceData?.departments.map((d) => ({
                    value: d.id.toString(),
                    label: d.name
                  })) || [])
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Laboratory Domain Type
              </label>
              <Select
                value={laboratoryModal.formData.labType}
                onChange={(e) =>
                  setLaboratoryModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, labType: e.target.value }
                  }))
                }
                options={[
                  { value: 'COMPUTER_SCIENCE', label: 'Computer Science' },
                  { value: 'ELECTRONICS', label: 'Electronics & Circuits' },
                  { value: 'PHYSICS', label: 'Physics Laboratory' },
                  { value: 'CHEMISTRY', label: 'Chemistry Laboratory' },
                  { value: 'MECHANICAL', label: 'Mechanical Engineering Workshop' },
                  { value: 'CIVIL', label: 'Civil Structures Lab' },
                  { value: 'GENERAL', label: 'General Science Workshop' }
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Building <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="Tech Tower"
                value={laboratoryModal.formData.building}
                onChange={(e) =>
                  setLaboratoryModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, building: e.target.value }
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Floor
              </label>
              <Input
                type="number"
                placeholder="2"
                value={laboratoryModal.formData.floor}
                onChange={(e) =>
                  setLaboratoryModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, floor: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Room Number <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="LAB-204"
                value={laboratoryModal.formData.roomNumber}
                onChange={(e) =>
                  setLaboratoryModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, roomNumber: e.target.value }
                  }))
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Student Capacity <span className="text-rose-400">*</span>
              </label>
              <Input
                type="number"
                min="1"
                placeholder="40"
                value={laboratoryModal.formData.capacity}
                onChange={(e) =>
                  setLaboratoryModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, capacity: e.target.value }
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Computer / Workstation Count
              </label>
              <Input
                type="number"
                min="0"
                placeholder="40"
                value={laboratoryModal.formData.computerCount}
                onChange={(e) =>
                  setLaboratoryModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, computerCount: e.target.value }
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
              Description / Safety Details
            </label>
            <Input
              placeholder="Gigabit network drop, fume hoods, safety eyewash station..."
              value={laboratoryModal.formData.description}
              onChange={(e) =>
                setLaboratoryModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, description: e.target.value }
                }))
              }
            />
          </div>
        </form>
      </Modal>

      {/* Equipment Create/Edit Modal */}
      <Modal
        isOpen={equipmentModal.isOpen}
        title={equipmentModal.mode === 'create' ? 'Register Equipment Asset' : 'Edit Equipment Details'}
        description="Relational apparatus record with serial number tracking and warranty lifecycle"
        onClose={() => setEquipmentModal((prev) => ({ ...prev, isOpen: false }))}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEquipmentModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEquipment} isLoading={equipmentModal.submitting}>
              {equipmentModal.mode === 'create' ? 'Register Asset' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveEquipment} className="space-y-4">
          {equipmentModal.error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
              {equipmentModal.error}
            </div>
          )}
          {equipmentModal.mode === 'create' && (
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Parent Asset / Resource <span className="text-rose-400">*</span>
              </label>
              <Select
                value={equipmentModal.formData.resourceId}
                onChange={(e) =>
                  setEquipmentModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, resourceId: e.target.value }
                  }))
                }
                options={
                  referenceData?.equipmentResources.map((r) => ({
                    value: r.id.toString(),
                    label: `${r.name} (${r.code})`
                  })) || []
                }
              />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {equipmentModal.mode === 'create' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                  Serial Number <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="e.g. SN-DELL-88492"
                  value={equipmentModal.formData.serialNumber}
                  onChange={(e) =>
                    setEquipmentModal((prev) => ({
                      ...prev,
                      formData: { ...prev.formData, serialNumber: e.target.value }
                    }))
                  }
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1.5">
                  Serial Number (Immutable)
                </label>
                <div className="px-3 py-2 bg-[#0E1017] border border-[#1E2330] rounded-lg text-xs font-mono text-gray-400">
                  {equipmentModal.formData.serialNumber}
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Quantity <span className="text-rose-400">*</span>
              </label>
              <Input
                type="number"
                min="1"
                value={equipmentModal.formData.quantity}
                onChange={(e) =>
                  setEquipmentModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, quantity: e.target.value }
                  }))
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Manufacturer
              </label>
              <Input
                placeholder="e.g. Dell, Keysight, Sony"
                value={equipmentModal.formData.manufacturer}
                onChange={(e) =>
                  setEquipmentModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, manufacturer: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Model Identifier
              </label>
              <Input
                placeholder="e.g. PowerEdge R740, VPL-FHZ75"
                value={equipmentModal.formData.model}
                onChange={(e) =>
                  setEquipmentModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, model: e.target.value }
                  }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Purchase Date
              </label>
              <Input
                type="date"
                value={equipmentModal.formData.purchaseDate}
                onChange={(e) =>
                  setEquipmentModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, purchaseDate: e.target.value }
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Warranty Expiry Date
              </label>
              <Input
                type="date"
                value={equipmentModal.formData.warrantyExpiry}
                onChange={(e) =>
                  setEquipmentModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, warrantyExpiry: e.target.value }
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
              Condition Status
            </label>
            <Select
              value={equipmentModal.formData.conditionStatus}
              onChange={(e) =>
                setEquipmentModal((prev) => ({
                  ...prev,
                  formData: { ...prev.formData, conditionStatus: e.target.value }
                }))
              }
              options={[
                { value: 'EXCELLENT', label: 'Excellent - Brand New' },
                { value: 'GOOD', label: 'Good - Fully Operational' },
                { value: 'FAIR', label: 'Fair - Minor Wear' },
                { value: 'NEEDS_SERVICE', label: 'Needs Service / Inspection' }
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* Time Slot Create/Edit Modal */}
      <Modal
        isOpen={timeSlotModal.isOpen}
        title={timeSlotModal.mode === 'create' ? 'Define Time Slot' : 'Edit Time Slot'}
        description="Weekly instructional period and timetable scheduling window"
        onClose={() => setTimeSlotModal((prev) => ({ ...prev, isOpen: false }))}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeSlotModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveTimeSlot} isLoading={timeSlotModal.submitting}>
              {timeSlotModal.mode === 'create' ? 'Save Time Slot' : 'Save Changes'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveTimeSlot} className="space-y-4">
          {timeSlotModal.error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
              {timeSlotModal.error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Period Name <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. Period 1, Morning Slot A"
                value={timeSlotModal.formData.name}
                onChange={(e) =>
                  setTimeSlotModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, name: e.target.value }
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Day of Week <span className="text-rose-400">*</span>
              </label>
              <Select
                value={timeSlotModal.formData.dayOfWeek}
                onChange={(e) =>
                  setTimeSlotModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, dayOfWeek: e.target.value }
                  }))
                }
                options={[
                  { value: 'MONDAY', label: 'Monday' },
                  { value: 'TUESDAY', label: 'Tuesday' },
                  { value: 'WEDNESDAY', label: 'Wednesday' },
                  { value: 'THURSDAY', label: 'Thursday' },
                  { value: 'FRIDAY', label: 'Friday' },
                  { value: 'SATURDAY', label: 'Saturday' },
                  { value: 'SUNDAY', label: 'Sunday' }
                ]}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                Start Time (HH:mm) <span className="text-rose-400">*</span>
              </label>
              <Input
                type="time"
                value={timeSlotModal.formData.startTime}
                onChange={(e) =>
                  setTimeSlotModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, startTime: e.target.value }
                  }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1.5">
                End Time (HH:mm) <span className="text-rose-400">*</span>
              </label>
              <Input
                type="time"
                value={timeSlotModal.formData.endTime}
                onChange={(e) =>
                  setTimeSlotModal((prev) => ({
                    ...prev,
                    formData: { ...prev.formData, endTime: e.target.value }
                  }))
                }
                required
              />
            </div>
          </div>
          <div className="p-3 bg-[#0E1017] border border-[#1E2330] rounded-lg text-xs text-gray-400 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              Validation: Start time must precede End time (e.g. 09:00 to 10:00). Inverse time values are rejected.
            </span>
          </div>
        </form>
      </Modal>

      {/* Details View Modal */}
      <Modal
        isOpen={detailsModal.isOpen}
        title={detailsModal.title}
        onClose={() => setDetailsModal((prev) => ({ ...prev, isOpen: false }))}
        footer={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDetailsModal((prev) => ({ ...prev, isOpen: false }))}
          >
            Close
          </Button>
        }
      >
        {detailsModal.loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : detailsModal.data ? (
          <div className="space-y-4 text-sm text-gray-300">
            {detailsModal.type === 'resource' && (
              <>
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#0E1017] rounded-lg border border-[#1E2330]">
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-semibold">Resource Code</div>
                    <div className="font-mono text-teal-400 font-semibold">{detailsModal.data.code}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-semibold">Status</div>
                    <Badge variant={getStatusBadgeVariant(detailsModal.data.status)} size="sm">
                      {detailsModal.data.status}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-semibold">Category</div>
                    <div>{detailsModal.data.categoryName} ({detailsModal.data.categoryCode})</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-semibold">Department</div>
                    <div>{detailsModal.data.departmentName || 'Institutional'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-semibold">Capacity</div>
                    <div>{detailsModal.data.capacity ? `${detailsModal.data.capacity} seats` : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase font-semibold">Location</div>
                    <div>{detailsModal.data.location || 'N/A'}</div>
                  </div>
                </div>
                {detailsModal.data.description && (
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Description</div>
                    <p className="text-xs text-gray-300 bg-[#0E1017] p-3 rounded-lg border border-[#1E2330]">
                      {detailsModal.data.description}
                    </p>
                  </div>
                )}
                {detailsModal.data.classroomDetails && (
                  <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                    <div className="text-xs font-semibold text-purple-300 uppercase mb-2">
                      Classroom Space Mapping
                    </div>
                    <div className="text-xs text-gray-300 grid grid-cols-2 gap-2">
                      <div>Room: {detailsModal.data.classroomDetails.roomNumber}</div>
                      <div>Building: {detailsModal.data.classroomDetails.building}</div>
                      <div>Floor: {detailsModal.data.classroomDetails.floor}</div>
                      <div>Type: {detailsModal.data.classroomDetails.roomType}</div>
                    </div>
                  </div>
                )}
                {detailsModal.data.laboratoryDetails && (
                  <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <div className="text-xs font-semibold text-blue-300 uppercase mb-2">
                      Laboratory Mapping
                    </div>
                    <div className="text-xs text-gray-300 grid grid-cols-2 gap-2">
                      <div>Room: {detailsModal.data.laboratoryDetails.roomNumber}</div>
                      <div>Lab Type: {detailsModal.data.laboratoryDetails.labType}</div>
                      <div>Workstations: {detailsModal.data.laboratoryDetails.computerCount}</div>
                      <div>Building: {detailsModal.data.laboratoryDetails.building}</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {detailsModal.type === 'classroom' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#0E1017] rounded-lg border border-[#1E2330]">
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Room Number</div>
                  <div className="font-mono text-teal-400 font-semibold">{detailsModal.data.roomNumber}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Building & Floor</div>
                  <div>{detailsModal.data.building}, Floor {detailsModal.data.floor}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Capacity</div>
                  <div>{detailsModal.data.capacity} seats</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Type</div>
                  <div>{detailsModal.data.roomType}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Amenities</div>
                  <div className="text-xs space-y-0.5 mt-1">
                    <div>Projector: {detailsModal.data.hasProjector ? 'Yes' : 'No'}</div>
                    <div>Air Conditioning: {detailsModal.data.hasAc ? 'Yes' : 'No'}</div>
                    <div>Smart Board: {detailsModal.data.hasSmartBoard ? 'Yes' : 'No'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Status</div>
                  <Badge variant={getStatusBadgeVariant(detailsModal.data.status)} size="sm">
                    {detailsModal.data.status}
                  </Badge>
                </div>
              </div>
            )}

            {detailsModal.type === 'laboratory' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#0E1017] rounded-lg border border-[#1E2330]">
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Lab Room</div>
                  <div className="font-mono text-blue-400 font-semibold">{detailsModal.data.roomNumber}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Department</div>
                  <div>{detailsModal.data.departmentName || 'Institutional'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Location</div>
                  <div>{detailsModal.data.building}, Floor {detailsModal.data.floor}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Domain Type</div>
                  <div>{detailsModal.data.labType}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Student Capacity</div>
                  <div>{detailsModal.data.capacity} seats</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Workstations / PCs</div>
                  <div>{detailsModal.data.computerCount} units</div>
                </div>
              </div>
            )}

            {detailsModal.type === 'equipment' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#0E1017] rounded-lg border border-[#1E2330]">
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Serial Number</div>
                  <div className="font-mono text-amber-400 font-semibold">{detailsModal.data.serialNumber}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Asset Name</div>
                  <div>{detailsModal.data.resourceName}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Manufacturer</div>
                  <div>{detailsModal.data.manufacturer || '—'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Model</div>
                  <div>{detailsModal.data.model || '—'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Condition</div>
                  <div>{detailsModal.data.conditionStatus || 'GOOD'}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Status</div>
                  <Badge variant={getStatusBadgeVariant(detailsModal.data.status)} size="sm">
                    {detailsModal.data.status}
                  </Badge>
                </div>
              </div>
            )}

            {detailsModal.type === 'time-slot' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#0E1017] rounded-lg border border-[#1E2330]">
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Slot Name</div>
                  <div className="font-semibold text-white">{detailsModal.data.name}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Day of Week</div>
                  <div>{detailsModal.data.dayOfWeek}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Schedule Period</div>
                  <div className="font-mono text-teal-400">
                    {detailsModal.data.startTime} – {detailsModal.data.endTime}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-400 uppercase font-semibold">Status</div>
                  <Badge variant={getStatusBadgeVariant(detailsModal.data.status)} size="sm">
                    {detailsModal.data.status}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </PageContainer>
  );
};

export default ResourceManagementPage;
