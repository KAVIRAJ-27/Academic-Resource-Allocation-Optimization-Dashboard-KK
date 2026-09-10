from fastapi import APIRouter
from typing import List

from ..schemas.requests import AiPredictPayload
from ..schemas.responses import (
    AcademicDemandDto,
    ResourceUtilizationDto,
    ResourceShortageDto,
    BottleneckDto,
    HostelOccupancyDto,
    HostelShortageDto,
    WorkloadInsightDto,
    AnomalyDto,
    AiOverviewDto,
)
from ..services.academic_predictor import academic_predictor
from ..services.hostel_predictor import hostel_predictor
from ..services.shortage_detector import shortage_detector
from ..services.bottleneck_detector import bottleneck_detector
from ..services.workload_analyzer import workload_analyzer
from ..services.anomaly_detector import anomaly_detector
from ..services.recommendation_engine import recommendation_engine

router = APIRouter(prefix="/predict", tags=["Predictions & Insights"])

@router.post("/academic/demand", response_model=List[AcademicDemandDto])
def predict_academic_demand(payload: AiPredictPayload) -> List[AcademicDemandDto]:
    return academic_predictor.predict_demand(payload.allocations, payload.requests)

@router.post("/academic/utilization", response_model=List[ResourceUtilizationDto])
def predict_resource_utilization(payload: AiPredictPayload) -> List[ResourceUtilizationDto]:
    return academic_predictor.predict_utilization(payload.allocations)

@router.post("/academic/shortage", response_model=List[ResourceShortageDto])
def predict_academic_shortages(payload: AiPredictPayload) -> List[ResourceShortageDto]:
    demands = academic_predictor.predict_demand(payload.allocations, payload.requests)
    return shortage_detector.detect_academic_shortages(demands, payload.allocations)

@router.post("/academic/bottlenecks", response_model=List[BottleneckDto])
def detect_bottlenecks(payload: AiPredictPayload) -> List[BottleneckDto]:
    return bottleneck_detector.detect_bottlenecks(
        payload.allocations, payload.conflicts, payload.hostels, payload.workloads
    )

@router.post("/academic/workload", response_model=List[WorkloadInsightDto])
def analyze_workload(payload: AiPredictPayload) -> List[WorkloadInsightDto]:
    return workload_analyzer.analyze_workload(payload.workloads)

@router.post("/hostel/occupancy", response_model=List[HostelOccupancyDto])
def predict_hostel_occupancy(payload: AiPredictPayload) -> List[HostelOccupancyDto]:
    return hostel_predictor.predict_occupancy(payload.hostels)

@router.post("/hostel/shortage", response_model=List[HostelShortageDto])
def predict_hostel_shortages(payload: AiPredictPayload) -> List[HostelShortageDto]:
    hostel_preds = hostel_predictor.predict_occupancy(payload.hostels)
    return shortage_detector.detect_hostel_shortages(hostel_preds, payload.hostels)

@router.post("/anomalies", response_model=List[AnomalyDto])
def detect_anomalies(payload: AiPredictPayload) -> List[AnomalyDto]:
    return anomaly_detector.detect_anomalies(
        payload.allocations, payload.requests, payload.hostels, payload.conflicts
    )

@router.post("/overview", response_model=AiOverviewDto)
def get_ai_overview(payload: AiPredictPayload) -> AiOverviewDto:
    # 1. Compute predictions
    demands = academic_predictor.predict_demand(payload.allocations, payload.requests)
    academic_shortages = shortage_detector.detect_academic_shortages(demands, payload.allocations)
    hostel_preds = hostel_predictor.predict_occupancy(payload.hostels)
    hostel_shortages = shortage_detector.detect_hostel_shortages(hostel_preds, payload.hostels)
    bottlenecks = bottleneck_detector.detect_bottlenecks(
        payload.allocations, payload.conflicts, payload.hostels, payload.workloads
    )
    workload_insights = workload_analyzer.analyze_workload(payload.workloads)
    anomalies = anomaly_detector.detect_anomalies(
        payload.allocations, payload.requests, payload.hostels, payload.conflicts
    )

    # 2. Recommendations
    recommendations = recommendation_engine.generate_recommendations(
        demands, academic_shortages, hostel_shortages, bottlenecks, workload_insights, anomalies
    )

    high_risk_count = sum(1 for s in academic_shortages if s.risk_level == "HIGH_RISK") + \
                      sum(1 for hs in hostel_shortages if hs.risk_level == "HIGH_RISK")

    return AiOverviewDto(
        status="SUCCESS",
        message="AI predictions and recommendations successfully synthesized from real institutional data.",
        active_predictions_count=len(demands) + len(hostel_preds),
        high_risk_shortages_count=high_risk_count,
        detected_bottlenecks_count=len(bottlenecks),
        anomalies_count=len(anomalies),
        recommendations_count=len(recommendations),
        top_recommendations=recommendations[:5],
        critical_bottlenecks=[b for b in bottlenecks if b.severity in ["CRITICAL", "HIGH"]][:5],
        academic_demand_summary=demands,
        hostel_occupancy_summary=hostel_preds,
    )
