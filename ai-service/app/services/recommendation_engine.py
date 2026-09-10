from datetime import datetime
from typing import List, Dict, Any

from ..schemas.responses import (
    RecommendationDto,
    AcademicDemandDto,
    ResourceShortageDto,
    HostelOccupancyDto,
    HostelShortageDto,
    BottleneckDto,
    WorkloadInsightDto,
    AnomalyDto,
)

class RecommendationEngine:
    def generate_recommendations(
        self,
        demands: List[AcademicDemandDto],
        shortages: List[ResourceShortageDto],
        hostel_shortages: List[HostelShortageDto],
        bottlenecks: List[BottleneckDto],
        workloads: List[WorkloadInsightDto],
        anomalies: List[AnomalyDto],
    ) -> List[RecommendationDto]:
        """
        Synthesizes explainable, advisory decision-support recommendations based on predictive and analytical findings.
        """
        recs: List[RecommendationDto] = []
        now_str = datetime.utcnow().isoformat() + "Z"
        rec_counter = 1

        # 1. Resource Shortage & Capacity Expansion Recommendations
        for s in shortages:
            if s.risk_level in ["HIGH_RISK", "MEDIUM_RISK"]:
                priority = "HIGH" if s.risk_level == "HIGH_RISK" else "MEDIUM"
                recs.append(RecommendationDto(
                    id=f"rec-cap-{rec_counter}",
                    type="RESOURCE_CAPACITY",
                    priority=priority,
                    entity_id=None,
                    entity_name=f"{s.resource_category} Facilities",
                    recommendation=(
                        f"Consider commissioning or scheduling {s.potential_shortage} additional {s.resource_category.lower()} "
                        f"sessions/units before the upcoming term."
                    ),
                    reason=s.explanation,
                    supporting_metrics={
                        "availableUnits": s.available_units,
                        "predictedDemand": s.predicted_demand,
                        "potentialShortage": s.potential_shortage,
                        "riskLevel": s.risk_level,
                    },
                    generated_at=now_str,
                ))
                rec_counter += 1

        # 2. Hostel Bed Deficit Recommendations
        for hs in hostel_shortages:
            if hs.risk_level in ["HIGH_RISK", "MEDIUM_RISK"]:
                priority = "HIGH" if hs.risk_level == "HIGH_RISK" else "MEDIUM"
                recs.append(RecommendationDto(
                    id=f"rec-hostel-{rec_counter}",
                    type="HOSTEL_CAPACITY",
                    priority=priority,
                    entity_id=hs.hostel_id,
                    entity_name=hs.hostel_name,
                    recommendation=(
                        f"Initiate early room-sharing review or reserve contingency beds at {hs.hostel_name} "
                        f"to absorb {hs.expected_shortage} anticipated pending applications."
                    ),
                    reason=hs.explanation,
                    supporting_metrics={
                        "totalActiveBeds": hs.total_active_beds,
                        "availableBeds": hs.available_beds,
                        "expectedShortage": hs.expected_shortage,
                        "riskLevel": hs.risk_level,
                    },
                    generated_at=now_str,
                ))
                rec_counter += 1

        # 3. Conflict Prevention & Bottleneck Mitigation
        for b in bottlenecks:
            if b.category == "CONFLICT":
                recs.append(RecommendationDto(
                    id=f"rec-conflict-{rec_counter}",
                    type="CONFLICT_PREVENTION",
                    priority="HIGH",
                    entity_id=b.entity_id,
                    entity_name=b.entity_name,
                    recommendation=b.recommended_action,
                    reason=b.explanation,
                    supporting_metrics={
                        "conflictCount": b.conflict_count,
                        "severity": b.severity,
                    },
                    generated_at=now_str,
                ))
                rec_counter += 1

        # 4. Faculty Workload Balancing
        overloaded_faculty = [w for w in workloads if w.workload_status == "OVERLOADED"]
        if overloaded_faculty:
            names = ", ".join(f.faculty_name for f in overloaded_faculty[:3])
            recs.append(RecommendationDto(
                id=f"rec-workload-{rec_counter}",
                type="WORKLOAD_BALANCING",
                priority="HIGH",
                entity_id=overloaded_faculty[0].faculty_id,
                entity_name="Department Instruction Roster",
                recommendation=(
                    f"Rebalance course assignments for overloaded instructors ({names}) "
                    f"to reduce teaching hours below the {overloaded_faculty[0].max_hours:.0f}-hour threshold."
                ),
                reason="Excessive instructional load increases burnout risk and timetable scheduling conflicts.",
                supporting_metrics={
                    "overloadedCount": len(overloaded_faculty),
                    "highestAssignedHours": max(f.assigned_hours for f in overloaded_faculty),
                },
                generated_at=now_str,
            ))
            rec_counter += 1

        # 5. Anomaly Resolution / Maintenance Recommendations
        for a in anomalies:
            if a.anomaly_type == "COMPLAINT_SPIKE":
                recs.append(RecommendationDto(
                    id=f"rec-maint-{rec_counter}",
                    type="MAINTENANCE_PRIORITY",
                    priority="HIGH",
                    entity_id=a.entity_id,
                    entity_name=a.entity_name,
                    recommendation=(
                        f"Deploy dedicated maintenance technicians to {a.entity_name} to address accumulated student complaints."
                    ),
                    reason=a.reason,
                    supporting_metrics={
                        "observedGrievances": a.observed_value,
                        "expectedBaseline": a.expected_baseline,
                    },
                    generated_at=now_str,
                ))
                rec_counter += 1

        # Default recommendation if everything is healthy
        if not recs:
            recs.append(RecommendationDto(
                id=f"rec-opt-1",
                type="RESOURCE_CAPACITY",
                priority="LOW",
                entity_id=None,
                entity_name="Campus Infrastructure",
                recommendation="Continue standard scheduling procedures. Academic and residential utilization metrics are operating within optimal tolerance limits.",
                reason="Current capacity and forecasted demand exhibit balanced distribution with zero critical deficits detected.",
                supporting_metrics={"status": "OPTIMAL"},
                generated_at=now_str,
            ))

        return recs

recommendation_engine = RecommendationEngine()
