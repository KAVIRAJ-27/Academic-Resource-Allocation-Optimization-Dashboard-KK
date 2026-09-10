export interface AiFilterParams {
  departmentId?: number;
  hostelId?: number;
  academicYearId?: number;
  semesterId?: number;
  resourceCategory?: string;
  horizon?: string;
}

export interface AcademicDemandPrediction {
  resource_category: string;
  current_demand: number;
  predicted_demand: number;
  demand_growth_pct: number;
  confidence?: number;
  confidence_label?: string;
  explanation: string;
  model_version: string;
}

export interface ResourceUtilizationPrediction {
  resource_id: number;
  resource_name: string;
  resource_category: string;
  current_utilization: number;
  predicted_utilization: number;
  utilization_delta: number;
  prediction_period: string;
  explanation: string;
  model_version: string;
}

export interface ResourceShortage {
  resource_category: string;
  available_units: number;
  predicted_demand: number;
  potential_shortage: number;
  risk_level: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  explanation: string;
}

export interface Bottleneck {
  id?: string;
  entity_id?: number;
  entity_name: string;
  category: 'ACADEMIC' | 'HOSTEL' | 'WORKLOAD' | 'CONFLICT';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  conflict_count: number;
  utilization_pct: number;
  explanation: string;
  recommended_action: string;
}

export interface HostelOccupancyPrediction {
  hostel_id: number;
  hostel_name: string;
  total_beds: number;
  current_occupancy: number;
  current_occupancy_pct: number;
  predicted_occupancy: number;
  predicted_occupancy_pct: number;
  expected_available_beds: number;
  occupancy_trend: 'INCREASING' | 'STABLE' | 'DECREASING';
  explanation: string;
  model_version: string;
}

export interface HostelShortage {
  hostel_id: number;
  hostel_name: string;
  total_active_beds: number;
  available_beds: number;
  predicted_demand: number;
  expected_shortage: number;
  risk_level: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  explanation: string;
}

export interface FacultyWorkloadInsight {
  faculty_id: number;
  faculty_name: string;
  department_name?: string;
  assigned_hours: number;
  max_hours: number;
  workload_status: 'LOW' | 'NORMAL' | 'HIGH' | 'OVERLOADED';
  variance_from_avg: number;
  is_imbalanced: boolean;
  explanation: string;
}

export interface Anomaly {
  id?: string;
  anomaly_type: 'USAGE_SPIKE' | 'UNUSUAL_ALLOCATION' | 'HOSTEL_SURGE' | 'COMPLAINT_SPIKE' | 'CONFLICT_BURST';
  entity_id?: number;
  entity_name: string;
  observed_value: number;
  expected_baseline: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  anomaly_score: number;
  reason: string;
}

export interface AiRecommendation {
  id: string;
  type: 'RESOURCE_CAPACITY' | 'WORKLOAD_BALANCING' | 'HOSTEL_CAPACITY' | 'CONFLICT_PREVENTION' | 'MAINTENANCE_PRIORITY';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  entity_id?: number;
  entity_name: string;
  recommendation: string;
  reason: string;
  supporting_metrics: Record<string, any>;
  generated_at: string;
}

export interface AiOverview {
  status: 'SUCCESS' | 'INSUFFICIENT_DATA' | 'AI_SERVICE_UNAVAILABLE' | 'ERROR';
  message?: string;
  active_predictions_count: number;
  high_risk_shortages_count: number;
  detected_bottlenecks_count: number;
  anomalies_count: number;
  recommendations_count: number;
  top_recommendations: AiRecommendation[];
  critical_bottlenecks: Bottleneck[];
  academic_demand_summary: AcademicDemandPrediction[];
  hostel_occupancy_summary: HostelOccupancyPrediction[];
}

export interface ModelTrainingResult {
  status: string;
  message: string;
  metadata?: Record<string, any>;
}
