export interface StudentHostelAllocation {
  id: number;
  status: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  allocatedAt: string;
  releasedAt?: string;
  academicYearName?: string;
}

export interface StudentHostelDetails {
  id: number;
  name: string;
  code: string;
  type: string; // 'BOYS' | 'GIRLS' | 'CO_ED' | 'GENERAL'
  address?: string;
  capacity: number;
  status: string;
}

export interface StudentHostelBlock {
  id: number;
  name: string;
  code: string;
  numberOfFloors: number;
  status: string;
}

export interface StudentHostelFloor {
  id: number;
  name: string;
  floorNumber: number;
  status: string;
}

export interface StudentHostelRoom {
  id: number;
  roomNumber: string;
  roomType: string;
  capacity: number;
  currentOccupancy?: number;
  status: string;
}

export interface StudentHostelBed {
  id: number;
  bedNumber: string;
  status: string;
}

export interface StudentHostelFacility {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  status: string;
}

export interface StudentHostelWarden {
  id: number;
  name: string;
  employeeId?: string;
  contactNumber?: string;
  email?: string;
}

export interface StudentHostelAllocationHistory {
  id: number;
  hostelName?: string;
  blockName?: string;
  roomNumber?: string;
  bedNumber?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  academicYearName?: string;
}

export interface StudentHostelResponse {
  allocated: boolean;
  currentAllocation?: StudentHostelAllocation;
  hostel?: StudentHostelDetails;
  block?: StudentHostelBlock;
  floor?: StudentHostelFloor;
  room?: StudentHostelRoom;
  bed?: StudentHostelBed;
  facilities: StudentHostelFacility[];
  wardens: StudentHostelWarden[];
  history: StudentHostelAllocationHistory[];
}
