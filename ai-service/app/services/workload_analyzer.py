import numpy as np
from typing import List, Dict, Any
from ..schemas.requests import FacultyWorkloadRecord
from ..schemas.responses import WorkloadInsightDto

class WorkloadAnalyzer:
    def analyze_workload(
        self,
        workloads: List[FacultyWorkloadRecord],
    ) -> List[WorkloadInsightDto]:
        """
        Analyzes faculty teaching hours for imbalances, overloaded instructors, and department disparities.
        """
        if not workloads:
            return []

        # Department averages
        dept_hours: Dict[int, List[float]] = {}
        for w in workloads:
            dept_id = w.department_id or 0
            dept_hours.setdefault(dept_id, []).append(w.assigned_hours)

        dept_averages = {
            d_id: float(np.mean(hrs)) if hrs else 16.0
            for d_id, hrs in dept_hours.items()
        }

        insights: List[WorkloadInsightDto] = []

        for w in workloads:
            dept_id = w.department_id or 0
            avg_h = dept_averages.get(dept_id, 16.0)
            variance = round(w.assigned_hours - avg_h, 1)

            is_overloaded = w.assigned_hours > w.max_hours or w.workload_status == "OVERLOADED"
            is_underutilized = w.assigned_hours < (avg_h * 0.5) and w.assigned_hours < 10.0
            is_imbalanced = is_overloaded or is_underutilized

            if is_overloaded:
                status = "OVERLOADED"
                explanation = (
                    f"{w.faculty_name} carries {w.assigned_hours:.1f} hrs ({variance:+.1f} hrs vs department mean of {avg_h:.1f}), "
                    f"indicating acute instruction saturation across {w.subject_count} courses."
                )
            elif is_underutilized:
                status = "LOW"
                explanation = (
                    f"{w.faculty_name} is currently assigned {w.assigned_hours:.1f} hrs ({variance:+.1f} hrs vs mean of {avg_h:.1f}), "
                    f"leaving available instructional bandwidth."
                )
            elif w.assigned_hours > (avg_h * 1.2):
                status = "HIGH"
                explanation = (
                    f"{w.faculty_name} workload is higher than average ({w.assigned_hours:.1f} hrs vs {avg_h:.1f} hrs avg)."
                )
            else:
                status = "NORMAL"
                explanation = (
                    f"{w.faculty_name} has a balanced teaching load of {w.assigned_hours:.1f} hrs aligned with departmental norms."
                )

            insights.append(WorkloadInsightDto(
                faculty_id=w.faculty_id,
                faculty_name=w.faculty_name,
                department_name=w.department_name,
                assigned_hours=w.assigned_hours,
                max_hours=w.max_hours or 20.0,
                workload_status=status,
                variance_from_avg=variance,
                is_imbalanced=is_imbalanced,
                explanation=explanation,
            ))

        return insights

workload_analyzer = WorkloadAnalyzer()
