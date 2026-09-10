from app.services.shortage_detector import shortage_detector
from app.services.bottleneck_detector import bottleneck_detector
from app.services.workload_analyzer import workload_analyzer
from app.services.anomaly_detector import anomaly_detector
from app.services.recommendation_engine import recommendation_engine
from app.schemas.requests import (
    AllocationHistoryRecord,
    RequestHistoryRecord,
    HostelHistoryRecord,
    ConflictHistoryRecord,
    FacultyWorkloadRecord,
)
from app.schemas.responses import AcademicDemandDto, HostelOccupancyDto

def test_shortage_detection():
    demands = [
        AcademicDemandDto(
            resource_category="LABORATORY",
            current_demand=2,
            predicted_demand=5,
            demand_growth_pct=150.0,
            confidence=90.0,
            explanation="Test",
            model_version="test-v1"
        )
    ]
    allocs = [
        AllocationHistoryRecord(resource_id=1, category="LABORATORY")
    ]
    shortages = shortage_detector.detect_academic_shortages(demands, allocs)
    assert len(shortages) == 1
    assert shortages[0].risk_level == "HIGH_RISK"
    assert shortages[0].potential_shortage == 4

def test_workload_analysis():
    workloads = [
        FacultyWorkloadRecord(faculty_id=1, faculty_name="Prof. Sharma", assigned_hours=24.0, max_hours=20.0, workload_status="OVERLOADED"),
        FacultyWorkloadRecord(faculty_id=2, faculty_name="Dr. Rao", assigned_hours=14.0, max_hours=20.0, workload_status="NORMAL"),
    ]
    insights = workload_analyzer.analyze_workload(workloads)
    assert len(insights) == 2
    assert insights[0].workload_status == "OVERLOADED"
    assert insights[0].is_imbalanced is True
    assert insights[1].workload_status == "NORMAL"

def test_anomaly_detection():
    allocs = [
        AllocationHistoryRecord(id=i, resource_id=101, resource_name="Lab", allocated_students=40, capacity=60, duration_hours=2.0)
        for i in range(10)
    ]
    # Add an extreme outlier allocation
    allocs.append(AllocationHistoryRecord(id=99, resource_id=101, resource_name="Lab", allocated_students=250, capacity=60, duration_hours=8.0))
    anomalies = anomaly_detector.detect_anomalies(allocs, [], [], [])
    assert len(anomalies) >= 1
    assert any(a.anomaly_type == "USAGE_SPIKE" for a in anomalies)
