from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AllocationHistoryRecord(BaseModel):
    id: Optional[int] = None
    resource_id: int
    resource_name: Optional[str] = "Resource"
    category: Optional[str] = "CLASSROOM"  # CLASSROOM, LABORATORY, EQUIPMENT, SEMINAR_HALL
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    allocated_students: Optional[int] = 0
    capacity: Optional[int] = 60
    duration_hours: Optional[float] = 1.0
    status: Optional[str] = "COMPLETED"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    semester_id: Optional[int] = None
    academic_year_id: Optional[int] = None

class RequestHistoryRecord(BaseModel):
    id: Optional[int] = None
    resource_category: Optional[str] = "CLASSROOM"
    department_id: Optional[int] = None
    status: Optional[str] = "PENDING"
    requested_capacity: Optional[int] = 40
    created_at: Optional[str] = None
    academic_year_id: Optional[int] = None
    semester_id: Optional[int] = None

class ConflictHistoryRecord(BaseModel):
    id: Optional[int] = None
    conflict_code: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    resource_id: Optional[int] = None
    resource_name: Optional[str] = None
    department_id: Optional[int] = None
    created_at: Optional[str] = None

class HostelHistoryRecord(BaseModel):
    hostel_id: int
    hostel_name: str
    total_beds: int
    occupied_beds: int
    available_beds: int
    reserved_beds: Optional[int] = 0
    maintenance_beds: Optional[int] = 0
    pending_requests: Optional[int] = 0
    complaint_count: Optional[int] = 0
    snapshot_date: Optional[str] = None

class FacultyWorkloadRecord(BaseModel):
    faculty_id: int
    faculty_name: str
    department_id: Optional[int] = None
    department_name: Optional[str] = None
    assigned_hours: float
    max_hours: Optional[float] = 20.0
    subject_count: int = 1
    workload_status: str = "NORMAL"  # LOW, NORMAL, HIGH, OVERLOADED

# High-level request payload sent from Spring Boot
class AiPredictPayload(BaseModel):
    department_id: Optional[int] = None
    hostel_id: Optional[int] = None
    academic_year_id: Optional[int] = None
    semester_id: Optional[int] = None
    resource_category: Optional[str] = None
    prediction_horizon: Optional[str] = "NEXT_MONTH"  # NEXT_MONTH, NEXT_SEMESTER
    allocations: List[AllocationHistoryRecord] = Field(default_factory=list)
    requests: List[RequestHistoryRecord] = Field(default_factory=list)
    conflicts: List[ConflictHistoryRecord] = Field(default_factory=list)
    hostels: List[HostelHistoryRecord] = Field(default_factory=list)
    workloads: List[FacultyWorkloadRecord] = Field(default_factory=list)

class ModelTrainRequest(BaseModel):
    model_type: str  # academic-demand, utilization, hostel-occupancy, anomaly
    training_data: Dict[str, Any] = Field(default_factory=dict)
