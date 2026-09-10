from fastapi import APIRouter
from typing import List

from ..schemas.requests import AiPredictPayload
from ..schemas.responses import RecommendationDto
from ..services.academic_predictor import academic_predictor
from ..services.hostel_predictor import hostel_predictor
from ..services.shortage_detector import shortage_detector
from ..services.bottleneck_detector import bottleneck_detector
from ..services.workload_analyzer import workload_analyzer
from ..services.anomaly_detector import anomaly_detector
from ..services.recommendation_engine import recommendation_engine

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.post("/generate", response_model=List[RecommendationDto])
def generate_recommendations(payload: AiPredictPayload) -> List[RecommendationDto]:
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

    return recommendation_engine.generate_recommendations(
        demands, academic_shortages, hostel_shortages, bottlenecks, workload_insights, anomalies
    )
