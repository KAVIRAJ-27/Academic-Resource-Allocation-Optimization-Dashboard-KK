import numpy as np
from typing import List
from ..schemas.requests import (
    AllocationHistoryRecord,
    RequestHistoryRecord,
    HostelHistoryRecord,
    ConflictHistoryRecord,
)
from ..schemas.responses import AnomalyDto
from ..models.model_store import model_store
from ..training.train_anomaly_model import train_anomaly_detection_model
from ..config import settings

class AnomalyDetector:
    def detect_anomalies(
        self,
        allocations: List[AllocationHistoryRecord],
        requests: List[RequestHistoryRecord],
        hostels: List[HostelHistoryRecord],
        conflicts: List[ConflictHistoryRecord],
    ) -> List[AnomalyDto]:
        """
        Detects operational anomalies using IsolationForest and statistical outlier analysis.
        """
        anomalies: List[AnomalyDto] = []

        # 1. Academic Allocation Capacity Outliers
        if len(allocations) >= settings.MIN_TRAINING_RECORDS:
            student_counts = [float(a.allocated_students or 0) for a in allocations]
            mean_students = float(np.mean(student_counts))
            std_students = float(np.std(student_counts))

            # Train or load Isolation Forest
            feature_matrix = np.array([[
                float(a.allocated_students or 0),
                float(a.capacity or 60),
                float(a.duration_hours or 1.0)
            ] for a in allocations])

            if len(feature_matrix) >= settings.MIN_TRAINING_RECORDS:
                loaded = model_store.load_model("anomaly_model")
                if loaded:
                    iso_model, _ = loaded
                else:
                    iso_model, _ = train_anomaly_detection_model(feature_matrix)

                iso_scores = iso_model.score_samples(feature_matrix)
                preds = iso_model.predict(feature_matrix)  # -1 = anomaly, 1 = normal

                for i, (pred, score) in enumerate(zip(preds, iso_scores)):
                    alloc = allocations[i]
                    students = float(alloc.allocated_students or 0)
                    z_score = abs((students - mean_students) / max(std_students, 1.0))
                    
                    if pred == -1 or z_score > 2.5 or (alloc.capacity and students > alloc.capacity * 1.5):
                        severity = "CRITICAL" if (score < -0.65 or z_score > 3.0) else "HIGH"
                        name = alloc.resource_name or f"Resource #{alloc.resource_id}"
                        anomalies.append(AnomalyDto(
                            id=f"anom-alloc-{alloc.id or i}",
                            anomaly_type="USAGE_SPIKE",
                            entity_id=alloc.resource_id,
                            entity_name=name,
                            observed_value=float(alloc.allocated_students or 0),
                            expected_baseline=round(mean_students, 1),
                            severity=severity,
                            anomaly_score=round(float(abs(score)), 3),
                            reason=(
                                f"Unusual allocation pattern detected for {name}: booked with {alloc.allocated_students} students "
                                f"(baseline mean: {mean_students:.1f} ± {std_students:.1f}) for {alloc.duration_hours} hrs."
                            ),
                        ))

        # 2. Residential Complaint / Incident Bursts
        for h in hostels:
            complaints = h.complaint_count or 0
            if complaints >= 5:
                anomalies.append(AnomalyDto(
                    id=f"anom-complaint-{h.hostel_id}",
                    anomaly_type="COMPLAINT_SPIKE",
                    entity_id=h.hostel_id,
                    entity_name=h.hostel_name,
                    observed_value=float(complaints),
                    expected_baseline=1.5,
                    severity="HIGH" if complaints >= 8 else "MEDIUM",
                    anomaly_score=0.78,
                    reason=(
                        f"Abnormal grievance surge at {h.hostel_name}: {complaints} unresolved complaints recorded "
                        f"significantly exceeding historical baseline of 1.5 complaints per period."
                    ),
                ))

        # 3. High Conflict Frequency Anomaly
        if len(conflicts) >= 4:
            anomalies.append(AnomalyDto(
                id="anom-conflict-burst",
                anomaly_type="CONFLICT_BURST",
                entity_id=None,
                entity_name="Campus Scheduling Matrix",
                observed_value=float(len(conflicts)),
                expected_baseline=1.0,
                severity="CRITICAL" if len(conflicts) >= 8 else "HIGH",
                anomaly_score=0.82,
                reason=(
                    f"Elevated conflict incidence detected: {len(conflicts)} hard constraint clashes observed across "
                    f"academic allocations during the selected filter timeframe."
                ),
            ))

        return anomalies

anomaly_detector = AnomalyDetector()
