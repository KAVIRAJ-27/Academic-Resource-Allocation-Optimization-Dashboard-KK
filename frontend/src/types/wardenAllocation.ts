export type HostelBedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED' | 'INACTIVE';
export type AllocationStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type RoomType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_SHARING' | 'DORMITORY';

export interface WardenHostelOption {
  id: number;
  name: string;
  code: string;
  type: string;
  address?: string;
  capacity: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  status: string;
}

export interface CurrentStudentAllocation {
  allocationId: number;
  studentId: number;
  studentName: string;
  registerNumber: string;
  rollNumber?: string;
  departmentName?: string;
  programName?: string;
  allocationStatus: string;
  startDate: string;
  endDate?: string;
}

export interface WardenBedSummary {
  id: number;
  bedNumber: string;
  status: HostelBedStatus;
  roomId: number;
  roomNumber: string;
  floorNumber: number;
  floorName: string;
  blockId: number;
  blockName: string;
  blockCode: string;
  hostelId: number;
  hostelName: string;
  currentStudent?: CurrentStudentAllocation;
}

export interface WardenBedDetail extends WardenBedSummary {
  allocationHistory?: WardenAllocationSummary[];
}

export interface WardenRoomSummary {
  id: number;
  roomNumber: string;
  floorId: number;
  floorNumber: number;
  floorName: string;
  blockId: number;
  blockName: string;
  blockCode: string;
  hostelId: number;
  hostelName: string;
  roomType: RoomType;
  capacity: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  status: string;
}

export interface WardenRoomDetail extends WardenRoomSummary {
  beds: WardenBedSummary[];
}

export interface ActiveAllocationInfo {
  allocationId: number;
  hostelId: number;
  hostelName: string;
  blockName: string;
  roomNumber: string;
  bedNumber: string;
  startDate: string;
  status: string;
}

export interface WardenStudentSearch {
  id: number;
  registerNumber: string;
  rollNumber?: string;
  name: string;
  email: string;
  phone?: string;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  programId?: number;
  programName?: string;
  programCode?: string;
  sectionName?: string;
  admissionYear: number;
  currentSemester: number;
  studentStatus: string;
  hasActiveAllocation: boolean;
  activeAllocation?: ActiveAllocationInfo;
}

export interface WardenAllocationSummary {
  id: number;
  studentId: number;
  studentName: string;
  registerNumber: string;
  rollNumber?: string;
  departmentName?: string;
  programName?: string;
  hostelId: number;
  hostelName: string;
  hostelCode: string;
  blockId: number;
  blockName: string;
  floorNumber: number;
  floorName: string;
  roomId: number;
  roomNumber: string;
  bedId: number;
  bedNumber: string;
  academicYearName?: string;
  startDate: string;
  endDate?: string;
  status: AllocationStatus;
  allocatedAt: string;
  releasedAt?: string;
}

export interface WardenAllocationDetail extends WardenAllocationSummary {
  studentEmail?: string;
  studentPhone?: string;
  admissionYear?: string;
  currentSemester?: number;
  hostelAddress?: string;
  roomCapacity?: number;
  roomType?: string;
}

export interface CreateHostelAllocationRequest {
  studentId: number;
  bedId: number;
  academicYearId?: number;
  startDate: string;
  endDate?: string | null;
}

export interface WardenRoomFilterParams {
  hostelId?: number;
  blockId?: number;
  floorNumber?: number;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface WardenBedFilterParams {
  hostelId?: number;
  blockId?: number;
  floorNumber?: number;
  roomId?: number;
  status?: HostelBedStatus;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface WardenStudentSearchParams {
  search?: string;
  departmentId?: number;
  programId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface WardenAllocationFilterParams {
  hostelId?: number;
  blockId?: number;
  floorNumber?: number;
  roomId?: number;
  status?: AllocationStatus;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
