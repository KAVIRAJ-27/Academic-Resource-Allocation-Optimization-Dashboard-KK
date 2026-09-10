from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class HealthResponse(BaseModel):
    status: str = "UP"
    app_name: str = "AHRAO-AI-Service"
    version: str = "1.0.0"

class ModelEvaluationMetrics(BaseModel):
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2: Optional[float] = None
    records_count: int = 0

class ModelMetadataDto(BaseModel):
    model_name: str
    algorithm: str
    trained_at: str
    feature_count: int
    training_records: int
    metrics: ModelEvaluationMetrics

class AcademicDemandDto(BaseModel):
    resource_category: str
    current_demand: int
    predicted_demand: int
    demand_growth_pct: float
    confidence: Optional[float] = None
    confidence_label: Optional[str] = "Model confidence supported"
    explanation: str
    model_version: str

class ResourceUtilizationDto(BaseModel):
    resource_id: int
    resource_name: str
    resource_category: str
    current_utilization: float
    predicted_utilization: float
    utilization_delta: float
    prediction_period: str
    explanation: str
    model_version: str

class ResourceShortageDto(BaseModel):
    resource_category: str
    available_units: int
    predicted_demand: int
    potential_shortage: int
    risk_level: str  # LOW_RISK, MEDIUM_RISK, HIGH_RISK
    explanation: str

class BottleneckDto(BaseModel):
    id: Optional[str] = None
    entity_id: Optional[int] = None
    entity_name: str
    category: str  # ACADEMIC, HOSTEL, WORKLOAD, CONFLICT
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    conflict_count: int = 0
    utilization_pct: float = 0.0
    explanation: str
    recommended_action: str

class HostelOccupancyDto(BaseModel):
    hostel_id: int
    hostel_name: str
    total_beds: int
    current_occupancy: int
    current_occupancy_pct: float
    predicted_occupancy: int
    predicted_occupancy_pct: float
    expected_available_beds: int
    occupancy_trend: str  # INCREASING, STABLE, DECREASING
    explanation: str
    model_version: str

class HostelShortageDto(BaseModel):
    hostel_id: int
    hostel_name: str
    total_active_beds: int
    available_beds: int
    predicted_demand: int
    expected_shortage: int
    risk_level: str  # LOW_RISK, MEDIUM_RISK, HIGH_RISK
    explanation: str

class WorkloadInsightDto(BaseModel):
    faculty_id: int
    faculty_name: str
    department_name: Optional[str] = None
    assigned_hours: float
    max_hours: float
    workload_status: str  # LOW, NORMAL, HIGH, OVERLOADED
    variance_from_avg: float
    is_imbalanced: bool
    explanation: str

class AnomalyDto(BaseModel):
    id: Optional[str] = None
    anomaly_type: str  # USAGE_SPIKE, UNUSUAL_ALLOCATION, HOSTEL_SURGE, COMPLAINT_SPIKE, CONFLICT_BURST
    entity_id: Optional[int] = None
    entity_name: str
    observed_value: float
    expected_baseline: float
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    anomaly_score: float
    reason: str

class RecommendationDto(BaseModel):
    id: str
    type: str  # RESOURCE_CAPACITY, WORKLOAD_BALANCING, HOSTEL_CAPACITY, CONFLICT_PREVENTION, MAINTENANCE_PRIORITY
    priority: str  # HIGH, MEDIUM, LOW
    entity_id: Optional[int] = None
    entity_name: str
    recommendation: str
    reason: str
    supporting_metrics: Dict[str, Any] = Field(default_factory=dict)
    generated_at: str

class AiOverviewDto(BaseModel):
    status: str = "SUCCESS"
    message: Optional[str] = None
    active_predictions_count: int = 0
    high_risk_shortages_count: int = 0
    detected_bottlenecks_count: int = 0
    anomalies_count: int = 0
    recommendations_count: int = 0
    top_recommendations: List[RecommendationDto] = Field(default_factory=list)
    critical_bottlenecks: List[BottleneckDto] = Field(default_factory=list)
    academic_demand_summary: List[AcademicDemandDto] = Field(default_factory=list)
    hostel_occupancy_summary: List[HostelOccupancyDto] = Field(default_factory=list)
